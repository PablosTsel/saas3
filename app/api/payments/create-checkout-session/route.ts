import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, PORTFOLIO_PREVIEW_PRICE } from '@/lib/stripe';
import { getPortfolioById, updatePortfolio } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { portfolioId } = await request.json();
    
    // Get the stripe instance
    const stripe = getServerStripe();

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Fetch portfolio data to ensure it exists
    const { portfolio, error } = await getPortfolioById(portfolioId);
    
    if (error || !portfolio) {
      return NextResponse.json(
        { error: error || 'Portfolio not found' },
        { status: 404 }
      );
    }

    // TypeScript type assertion for portfolio data
    const portfolioData = portfolio as {
      id: string;
      name: string;
      userId: string;
      [key: string]: any;
    };

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Preview: ${portfolioData.name}`,
              description: 'One-time access to view your portfolio',
            },
            unit_amount: PORTFOLIO_PREVIEW_PRICE, // 100 cents = 1 euro
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/portfolio/${portfolioId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/dashboard?payment=cancelled`,
      metadata: {
        portfolioId,
        userId: portfolioData.userId,
      },
    });

    // Update portfolio with the session ID
    await updatePortfolio(portfolioId, {
      ...portfolioData,
      paymentSessionId: session.id,
      paymentStatus: 'pending',
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: `Error creating payment: ${error.message}` },
      { status: 500 }
    );
  }
} 