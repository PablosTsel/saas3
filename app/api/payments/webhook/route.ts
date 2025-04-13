import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { updatePortfolio, getPortfolioById } from '@/lib/firebase';
import { headers } from 'next/headers';

// This API route handles Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    // Get the request body text
    const body = await request.text();
    
    // Get headers with await - required in Next.js 15+
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify the event is from Stripe
    const stripe = getServerStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
    
    // Handle specific event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract portfolioId from metadata
      const portfolioId = session.metadata?.portfolioId;
      
      if (portfolioId) {
        console.log(`Payment completed for portfolio: ${portfolioId}`);
        
        // Get current portfolio data
        const { portfolio } = await getPortfolioById(portfolioId);
        
        if (portfolio) {
          // Update portfolio payment status
          await updatePortfolio(portfolioId, {
            ...portfolio,
            isPreviewPaid: true,
            paymentStatus: 'completed',
            paymentCompletedAt: new Date().toISOString(),
          });
          
          console.log(`Portfolio ${portfolioId} payment status updated successfully`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}

// Need to disable body parsing as we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}; 