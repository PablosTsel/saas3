"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getPortfolioById, updatePortfolio } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PaymentModal from '@/components/payment-modal';

export default function PortfolioViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const portfolioId = params.id as string;
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Check for payment success from query params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId && portfolioId) {
      // Update the portfolio payment status
      const updatePaymentStatus = async () => {
        setCheckingPayment(true);
        try {
          console.log("Payment success detected, updating portfolio status");
          
          // Fetch fresh portfolio data to ensure we have the latest state
          const { portfolio: freshPortfolio } = await getPortfolioById(portfolioId);
          
          if (freshPortfolio) {
            // Type assertion for freshPortfolio
            const typedFreshPortfolio = freshPortfolio as {
              id: string;
              isPreviewPaid?: boolean;
              paymentStatus?: string;
              [key: string]: any;
            };
            
            // Check if it's already marked as paid in the database
            if (!typedFreshPortfolio.isPreviewPaid && 
                typedFreshPortfolio.paymentStatus !== 'paid' && 
                typedFreshPortfolio.paymentStatus !== 'completed') {
              console.log("Portfolio not yet marked as paid, updating...");
              // Update the portfolio payment status
              await updatePortfolio(portfolioId, {
                ...freshPortfolio,
                isPreviewPaid: true,
                paymentStatus: 'completed',
                paymentCompletedAt: new Date().toISOString(),
              });
              
              console.log("Portfolio payment status updated successfully");
            } else {
              console.log("Portfolio already marked as paid, skipping update");
            }
            
            // Set the portfolio with payment completed to trigger page refresh
            setPortfolio({
              ...freshPortfolio,
              isPreviewPaid: true,
              paymentStatus: 'completed'
            });
            
            // Clear the query params to avoid reprocessing on refresh
            router.replace(`/portfolio/${portfolioId}`);
            
            // Force a portfolio generation
            setTimeout(() => {
              generatePortfolio(portfolioId);
            }, 500);
          }
        } catch (err) {
          console.error('Error updating payment status:', err);
        } finally {
          setCheckingPayment(false);
        }
      };
      
      updatePaymentStatus();
    }
  }, [portfolioId, searchParams, router]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        const { portfolio: portfolioData, error: fetchError } = await getPortfolioById(portfolioId);
        
        if (fetchError || !portfolioData) {
          setError(fetchError || 'Portfolio not found');
          setLoading(false);
          return;
        }
        
        setPortfolio(portfolioData);
        
        // Add type assertion for the portfolio data
        const typedPortfolioData = portfolioData as {
          id: string;
          name: string;
          isPreviewPaid: boolean;
          paymentStatus?: string;
          [key: string]: any;
        };
        
        // Check if payment is required and not yet paid
        // Account for both isPreviewPaid flag and paymentStatus fields
        const isPaid = typedPortfolioData.isPreviewPaid === true || 
                      ['paid', 'completed'].includes(typedPortfolioData.paymentStatus || '');
        
        if (!isPaid) {
          console.log("Portfolio requires payment");
          setLoading(false);
          return; // Don't proceed to load portfolio if payment is required
        }
        
        // Payment is confirmed, proceed to load/generate the portfolio
        console.log("Payment verified, proceeding to load portfolio");
        
        // Check if portfolio HTML exists
        try {
          console.log(`Checking if portfolio exists at /portfolios/${portfolioId}/index.html`);
          const response = await fetch(`/portfolios/${portfolioId}/index.html`, { method: 'HEAD' });
          if (response.ok) {
            console.log('Portfolio HTML file exists, setting URL');
            setPortfolioUrl(`/portfolios/${portfolioId}/index.html`);
          } else {
            console.log('Portfolio HTML file not found, need to generate');
            // Need to generate the portfolio
            generatePortfolio(portfolioId);
          }
        } catch (e) {
          console.log('Error checking portfolio file:', e);
          // File doesn't exist, generate it
          generatePortfolio(portfolioId);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio information');
        setDetailedError(err);
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, [portfolioId]);
  
  const generatePortfolio = async (id: string) => {
    setGenerating(true);
    setError(null);
    setDetailedError(null);
    setHtmlContent(null);
    
    try {
      console.log(`Generating portfolio for ID: ${id}`);
      const response = await fetch('/api/portfolios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioId: id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from API:', data);
        throw new Error(data.error || 'Failed to generate portfolio');
      }
      
      console.log('Portfolio generated successfully:', data);
      
      // Check if we received a URL or direct HTML content
      if (data.url) {
        setPortfolioUrl(data.url);
        
        // Verify the file exists after generation
        try {
          const fileCheck = await fetch(data.url, { method: 'HEAD' });
          if (!fileCheck.ok) {
            console.warn('Generated file not accessible:', data.url);
            // If URL is not accessible but HTML content was provided, use that instead
            if (data.htmlContent) {
              console.log('Using provided HTML content as fallback');
              setHtmlContent(data.htmlContent);
              setPortfolioUrl(null);
            } else {
              setError('Generated file not accessible. Please try again.');
            }
          }
        } catch (fileError) {
          console.warn('Error checking generated file:', fileError);
          // If URL is not accessible but HTML content was provided, use that instead
          if (data.htmlContent) {
            console.log('Using provided HTML content as fallback after file check error');
            setHtmlContent(data.htmlContent);
            setPortfolioUrl(null);
          }
        }
      } else if (data.htmlContent) {
        // If direct HTML content was returned (file system write failed), use it directly
        console.log('Using HTML content provided by API');
        setHtmlContent(data.htmlContent);
      } else {
        throw new Error('No portfolio content received from server');
      }
      
    } catch (err: any) {
      console.error('Error generating portfolio:', err);
      setError('Failed to generate portfolio: ' + err.message);
      setDetailedError(err);
    } finally {
      setGenerating(false);
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    if (portfolioId) {
      setError(null);
      setDetailedError(null);
      setHtmlContent(null);
      setPortfolioUrl(null);
      generatePortfolio(portfolioId);
    }
  };

  // Handle payment
  const handleStartPayment = () => {
    setShowPaymentModal(true);
  };
  
  if (loading || checkingPayment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Loading portfolio...</h1>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          {detailedError && (
            <div className="mb-6 text-left p-3 bg-gray-50 rounded text-sm overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(detailedError, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetry} className="bg-indigo-600 hover:bg-indigo-700">
              Try Again
            </Button>
            <Button onClick={() => window.history.back()} className="bg-gray-600 hover:bg-gray-700">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show payment screen if portfolio exists but is not paid
  // Check both isPreviewPaid flag and paymentStatus fields
  const isPaid = portfolio && (portfolio.isPreviewPaid === true || 
                            ['paid', 'completed'].includes(portfolio.paymentStatus || ''));
  
  if (portfolio && !isPaid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-indigo-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Preview Your Portfolio</h1>
          <p className="text-gray-600 mb-6">
            To view your portfolio "{portfolio.name}", a one-time payment of €1 is required.
          </p>
          <Button 
            onClick={handleStartPayment}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Pay €1 to View Portfolio
          </Button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>• Secure payment via Stripe</p>
            <p>• One-time payment, no subscription</p>
            <p>• Immediate access after payment</p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
        
        {/* Payment Modal */}
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          portfolioId={portfolioId}
          portfolioName={portfolio.name || 'Your Portfolio'}
        />
      </div>
    );
  }
  
  if (generating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-indigo-100">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Generating portfolio...</h1>
          <p className="text-gray-600">We're creating your portfolio from your selected template. This may take a moment.</p>
        </div>
      </div>
    );
  }
  
  // If we have direct HTML content, render it in an iframe
  if (htmlContent) {
    return (
      <iframe
        srcDoc={htmlContent}
        className="w-full h-screen border-0"
        title={portfolio?.name || 'Portfolio'}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
  
  // If we have a URL, load the portfolio from that URL
  if (portfolioUrl) {
    return (
      <iframe 
        src={portfolioUrl} 
        className="w-full h-screen border-0" 
        title={portfolio?.name || 'Portfolio'}
      />
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-indigo-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ready to generate your portfolio?</h1>
        <p className="text-gray-600 mb-6">Your portfolio template is ready to be created. Click the button below to generate it.</p>
        <Button 
          onClick={() => generatePortfolio(portfolioId)} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Portfolio'
          )}
        </Button>
      </div>
    </div>
  );
} 