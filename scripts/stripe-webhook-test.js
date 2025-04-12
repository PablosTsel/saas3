// Stripe webhook testing script
const https = require('https');
const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Instructions
console.log('\n=== Stripe Webhook Testing Helper ===\n');
console.log('This script helps you test Stripe webhooks locally.');
console.log('To use this script:');
console.log('1. Install the Stripe CLI from https://stripe.com/docs/stripe-cli');
console.log('2. Login to your Stripe account using: stripe login');
console.log('3. Run this script and follow the prompts\n');

// Check if Stripe CLI is installed
const checkStripeCLI = spawn('which', ['stripe']);

checkStripeCLI.on('close', (code) => {
  if (code !== 0) {
    console.error('\nError: Stripe CLI not found. Please install it first.');
    console.log('Visit: https://stripe.com/docs/stripe-cli for installation instructions.');
    rl.close();
    return;
  }

  // Prompt for choosing between listen and trigger
  rl.question('\nDo you want to (1) Listen for webhooks or (2) Trigger a test event? ', (answer) => {
    if (answer === '1') {
      // Listen for webhooks
      console.log('\nStarting webhook listener. Press Ctrl+C to stop.\n');
      
      // Get the webhook secret
      const stripeWebhook = spawn('stripe', ['listen', '--forward-to', 'http://localhost:3000/api/payments/webhook']);
      
      stripeWebhook.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // Extract webhook signing secret if shown
        if (output.includes('webhook signing secret:')) {
          const secretLine = output.split('\n').find(line => line.includes('webhook signing secret:'));
          const secret = secretLine.split('webhook signing secret: ')[1].trim();
          console.log('\n=== COPY THIS TO YOUR .env.local FILE ===');
          console.log(`STRIPE_WEBHOOK_SECRET=${secret}\n`);
        }
      });
      
      stripeWebhook.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });
      
      stripeWebhook.on('close', (code) => {
        console.log(`Webhook listener stopped with code ${code}`);
        rl.close();
      });
    } else if (answer === '2') {
      // Trigger a test event
      rl.question('\nEnter the event type to trigger (e.g., checkout.session.completed): ', (eventType) => {
        rl.question('Enter a portfolio ID to include in the metadata: ', (portfolioId) => {
          console.log(`\nTriggering ${eventType} event with portfolio ID: ${portfolioId}\n`);
          
          const triggerArgs = [
            'trigger',
            eventType,
            '--metadata', 
            `{"portfolioId":"${portfolioId}"}`
          ];
          
          const stripeTrigger = spawn('stripe', triggerArgs);
          
          stripeTrigger.stdout.on('data', (data) => {
            console.log(data.toString());
          });
          
          stripeTrigger.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
          });
          
          stripeTrigger.on('close', (code) => {
            console.log(`\nEvent triggered with exit code ${code}`);
            rl.close();
          });
        });
      });
    } else {
      console.log('Invalid option. Please run the script again and choose 1 or 2.');
      rl.close();
    }
  });
}); 