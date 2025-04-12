import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PortfolioRegenerateProps {
  portfolioId: string;
  portfolioName: string;
  className?: string;
}

export default function PortfolioRegenerate({ 
  portfolioId, 
  portfolioName, 
  className = "" 
}: PortfolioRegenerateProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      toast.info(`Regenerating portfolio "${portfolioName}"...`, {
        id: `regenerate-${portfolioId}`,
        duration: 10000, // Longer duration as generation can take time
      });
      
      // Call the API to regenerate the portfolio
      const response = await fetch(`/api/portfolios/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portfolioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate portfolio");
      }

      // Success message
      toast.success(`Portfolio "${portfolioName}" regenerated successfully`, {
        id: `regenerate-${portfolioId}`,
        duration: 4000,
      });
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error regenerating portfolio:", error);
      
      toast.error(
        error instanceof Error 
          ? `Failed to regenerate portfolio: ${error.message}` 
          : "Failed to regenerate portfolio", 
        {
          id: `regenerate-${portfolioId}`,
          duration: 5000,
        }
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={isRegenerating}
      className={`flex items-center gap-2 ${className}`}
      title="Regenerate this portfolio with the latest template updates"
    >
      {isRegenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Regenerating...</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Regenerate</span>
        </>
      )}
    </Button>
  );
} 