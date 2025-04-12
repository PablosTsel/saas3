import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CreditCard, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getStripe } from '@/lib/stripe';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioName: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  portfolioId,
  portfolioName,
}: PaymentModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log("Starting checkout process for portfolio:", portfolioId);
      
      // Call our API to create a checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      console.log("Checkout session created:", data);
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      if (data.url) {
        // If we have a URL, redirect directly to Stripe hosted page
        console.log("Redirecting to Stripe URL:", data.url);
        window.location.href = data.url; // Use direct location change instead of router
      } else if (data.sessionId) {
        // If we have a sessionId, redirect using Stripe SDK
        console.log("Redirecting via Stripe SDK with session ID:", data.sessionId);
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        
        if (error) {
          console.error("Stripe redirect error:", error);
          throw error;
        }
      } else {
        throw new Error('No URL or session ID returned from server');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'An unknown error occurred';
      console.error('Payment error:', error);
      setErrorMessage(errorMsg);
      toast.error(`Payment failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Portfolio Preview Payment</DialogTitle>
          <DialogDescription>
            To view your portfolio "{portfolioName}", please complete a one-time payment of €1.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Euro className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Portfolio Preview</h3>
            <p className="text-center text-sm text-muted-foreground mt-1">
              One-time access to view your portfolio
            </p>
            <p className="text-2xl font-bold mt-2">€1.00</p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              Error: {errorMessage}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>• Secure payment via Stripe</p>
            <p>• One-time payment for preview access</p>
            <p>• Unlock your portfolio immediately</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" /> Pay €1.00
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 