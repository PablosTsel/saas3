import { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioRegenerate from "./portfolio-regenerate";

interface PortfolioCardProps {
  id: string;
  name: string;
  title: string;
  templateId: string;
  onDelete: (id: string, name: string) => void;
}

const PortfolioCard: FC<PortfolioCardProps> = ({
  id,
  name,
  title,
  templateId,
  onDelete,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play().catch(err => console.error("Video play error:", err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering]);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100 rounded-xl group">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-800 truncate max-w-[200px]" title={name}>{name}</span>
          <span className="text-xs font-normal text-indigo-500">
            {templateId === "minimal" ? "Minimal template" : 
             templateId === "creative" ? "Creative template" : 
             templateId === "template4" ? "Minimal Portfolio" :
             `Template ${templateId.replace('template', '')}`}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        className="aspect-video bg-white flex items-center justify-center p-0 relative overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute inset-0 w-full h-full">
          {templateId === "template1" ? (
            <>
              <img 
                src="/templates/template1/JohnDoe2024.png"
                alt={`${name} Preview`}
                className={`object-cover w-full h-full transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
              />
              <video 
                ref={videoRef}
                src="/videos/Temp1.webm"
                muted
                loop
                playsInline
                className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          ) : (
            <Image 
              src={templateId === "template4"
                ? `/templates/template4/thumbnail_dash.svg`
                : `/templates/${templateId}/thumbnail_dash.svg`}
              alt={`${name} Preview`}
              fill
              className="object-cover"
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between py-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700">
            <Link href={`/editor/${id}`} className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-indigo-500" /> Edit
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700">
            <Link href={`/portfolio/${id}`} target="_blank" className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-500" /> Preview
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <PortfolioRegenerate 
            portfolioId={id} 
            portfolioName={name} 
            className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700"
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(id, name)}
            className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PortfolioCard; 