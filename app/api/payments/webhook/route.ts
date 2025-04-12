import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { updatePortfolio, getPortfolioById } from '@/lib/firebase';
import { Readable } from 'stream';
import { headers } from 'next/headers';

// Helper function to get the raw body from the request
async function buffer(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    const stripe = getServerStripe();
    
    // Verify the event is from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook verification error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle specific event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract portfolioId from metadata
    const portfolioId = session.metadata?.portfolioId;
    
    if (portfolioId) {
      try {
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
      } catch (error) {
        console.error('Error updating portfolio after payment:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}

// Need to disable body parsing as we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}; 