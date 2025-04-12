import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialize Stripe on the server - only create this when on the server
const getStripeServerSide = () => {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-03-31.basil', // Use the latest API version
    });
  }
  
  return null;
};

// Export a function to get the server-side Stripe instance
export const getServerStripe = () => {
  // This should only be called from server components or API routes
  const stripe = getStripeServerSide();
  if (!stripe) {
    throw new Error('Stripe can only be accessed server-side');
  }
  return stripe;
};

// Initialize Stripe on the client-side
let stripePromise: Promise<StripeClient | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

// Portfolio preview price (100 cents = 1 euro)
export const PORTFOLIO_PREVIEW_PRICE = process.env.PORTFOLIO_PREVIEW_PRICE 
  ? parseInt(process.env.PORTFOLIO_PREVIEW_PRICE) 
  : 100; 