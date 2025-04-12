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

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
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

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      if (data.url) {
        // If we have a URL, redirect directly to Stripe hosted page
        router.push(data.url);
      } else if (data.sessionId) {
        // If we have a sessionId, redirect using Stripe SDK
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
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