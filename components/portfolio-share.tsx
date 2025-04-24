import { useState } from "react";
import { Share2, Copy, Mail, Linkedin, Twitter, Facebook, Check, X, Instagram, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PortfolioShareProps {
  portfolioId: string;
  portfolioName: string;
  portfolioTitle?: string;
  slug?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  iconOnly?: boolean;
}

export default function PortfolioShare({
  portfolioId,
  portfolioName,
  portfolioTitle = "",
  slug,
  variant = "outline",
  size = "sm",
  className = "",
  iconOnly = false
}: PortfolioShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the proper link URL - use slug if available, otherwise use ID
  const portfolioUrl = slug && slug.trim() !== '' ? `/portfolio/${slug}` : `/portfolio/${portfolioId}`;

  // Get the full URL for sharing (including domain)
  const getFullUrl = () => {
    // Use window.location to get the base URL in the browser
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://yourportfolio.com'; // Fallback for SSR
    
    return `${baseUrl}${portfolioUrl}`;
  };

  // Handle copying to clipboard
  const copyToClipboard = async () => {
    const fullUrl = getFullUrl();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Could not copy link');
    }
  };

  // Handle share via email
  const shareViaEmail = () => {
    const fullUrl = getFullUrl();
    const subject = encodeURIComponent(`Check out ${portfolioName}'s portfolio`);
    const body = encodeURIComponent(`Take a look at ${portfolioName}'s portfolio${portfolioTitle ? `: ${portfolioTitle}` : ''}\n\n${fullUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Email sharing opened');
  };

  // Handle share via social media
  const shareToSocial = (platform: string) => {
    const fullUrl = getFullUrl();
    const text = encodeURIComponent(`Check out ${portfolioName}'s portfolio${portfolioTitle ? `: ${portfolioTitle}` : ''}`);
    let url = '';

    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(fullUrl)}`;
        break;
      case 'instagram':
        // Since Instagram doesn't have a direct web share API, we'll copy a formatted message to clipboard
        const instaCopy = async () => {
          try {
            const message = `Check out ${portfolioName}'s portfolio${portfolioTitle ? `: ${portfolioTitle}` : ''}\n\n${fullUrl}`;
            await navigator.clipboard.writeText(message);
            toast.success('Copied to clipboard for Instagram sharing!');
          } catch (error) {
            console.error('Error copying for Instagram share:', error);
            toast.error('Could not copy text for Instagram');
          }
        };
        instaCopy();
        return;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
    toast.success(`Sharing to ${platform} opened`);
  };

  // Handle share button click using Web Share API if available
  const handleShare = async () => {
    const fullUrl = getFullUrl();
    setIsSharing(true);
    
    try {
      // Try using the Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${portfolioName}'s portfolio`,
          text: portfolioTitle 
            ? `Take a look at ${portfolioName}'s portfolio: ${portfolioTitle}`
            : `Take a look at ${portfolioName}'s portfolio`,
          url: fullUrl,
        });
        toast.success('Shared successfully!');
      } else {
        // Fall back to our custom share modal
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share portfolio link');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing}
        className={className}
        title="Share this portfolio"
        aria-label="Share portfolio"
      >
        {iconOnly ? (
          <Share2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        ) : (
          <div className="flex items-center gap-1.5">
            <Share2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
            {isSharing ? 'Sharing...' : 'Share'}
          </div>
        )}
      </Button>

      {/* Share Modal Dialog */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Portfolio</DialogTitle>
            <DialogDescription>
              Share {portfolioName}'s portfolio using one of the options below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={getFullUrl()}
                className="text-sm text-gray-500 dark:text-gray-400"
              />
            </div>
            <Button 
              type="button" 
              size="sm" 
              className={`px-3 ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Share via</h3>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={shareViaEmail}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
              <Button 
                variant="outline"
                className="flex-1 gap-2 text-[#0A66C2] border-[#0A66C2] hover:bg-[#0A66C2]/10"
                onClick={() => shareToSocial('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
            </div>
            
            <div className="flex gap-3 flex-wrap mt-3">
              <Button 
                variant="outline"
                className="flex-1 gap-2 text-[#1DA1F2] border-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                onClick={() => shareToSocial('twitter')}
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
              <Button 
                variant="outline"
                className="flex-1 gap-2 text-[#1877F2] border-[#1877F2] hover:bg-[#1877F2]/10"
                onClick={() => shareToSocial('facebook')}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
            </div>
            
            <div className="flex gap-3 flex-wrap mt-3">
              <Button 
                variant="outline"
                className="flex-1 gap-2 text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10"
                onClick={() => shareToSocial('whatsapp')}
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>
              <Button 
                variant="outline"
                className="flex-1 gap-2 text-[#E4405F] border-[#E4405F] hover:bg-[#E4405F]/10"
                onClick={() => shareToSocial('instagram')}
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-1" /> Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 