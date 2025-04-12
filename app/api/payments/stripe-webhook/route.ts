import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { getPortfolioById, updatePortfolio } from '@/lib/firebase';
import { headers } from 'next/headers';

// This API route handles Stripe webhook events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') || '';
  
  const stripe = getServerStripe();
  
  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle specific webhook events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Extract portfolio ID from metadata
      const portfolioId = session.metadata.portfolioId;
      
      if (portfolioId) {
        console.log(`Payment completed for portfolio: ${portfolioId}`);
        const { portfolio } = await getPortfolioById(portfolioId);
        
        if (portfolio) {
          // Update portfolio payment status
          await updatePortfolio(portfolioId, {
            ...portfolio,
            isPreviewPaid: true,
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
          });
          console.log(`Updated payment status for portfolio ${portfolioId} - isPreviewPaid: true`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
} 