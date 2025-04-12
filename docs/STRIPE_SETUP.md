# Setting Up Stripe Payments for Portfolio Previews

This guide will walk you through setting up Stripe payments for your portfolio previews feature. Users will need to pay €1 to view their generated portfolios.

## Prerequisites

- A Stripe account (sign up at [stripe.com](https://stripe.com) if you don't have one)
- The Stripe CLI (for webhook testing)

## Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up for an account
2. Complete the verification process

## Step 2: Get Your API Keys

1. Log in to your Stripe Dashboard
2. Go to Developers → API keys
3. Note your Publishable Key and Secret Key
    - For testing, use the ones labeled "Test keys"
    - For production, use the ones labeled "Live keys"

## Step 3: Configure Your Environment Variables

1. Edit the `.env.local` file in your project root
2. Add your Stripe API keys:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORTFOLIO_PREVIEW_PRICE=100  # 100 cents = €1
```

## Step 4: Set Up Webhooks

Webhooks are necessary to receive payment confirmations from Stripe.

### For Local Development

1. Install the Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in to your Stripe account from the CLI:
   ```
   stripe login
   ```
3. Use our helper script to listen for webhooks:
   ```
   npm run stripe:webhook
   ```
4. Copy the webhook signing secret shown in the terminal to your `.env.local` file

### For Production

1. In your Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select the events to listen for, at minimum:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Reveal the signing secret and add it to your environment variables

## Step 5: Test the Payment Flow

1. Start your development server:
   ```
   npm run dev
   ```
2. Create a new portfolio
3. Try to view it - you should see the payment screen
4. Test the payment using Stripe's test card:
   - Card number: `4242 4242 4242 4242`
   - Expiration: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

## Step 6: Going Live

When you're ready to accept real payments:

1. Complete your Stripe account setup and verification
2. Switch from test keys to live keys in your environment variables
3. Ensure your webhook endpoints are set up for the live environment
4. Test thoroughly with a small real payment before launching

## Troubleshooting

If you encounter issues:

- Check the console logs for error messages
- Verify webhook events are being received properly
- Ensure your API keys and webhook secrets are correctly set
- Test with Stripe's test cards to avoid real charges during testing

For more help, refer to the [Stripe documentation](https://stripe.com/docs) or contact their support. 