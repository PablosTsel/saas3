import { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioRegenerate from "./portfolio-regenerate";
import PortfolioShare from "./portfolio-share";

interface PortfolioCardProps {
  id: string;
  name: string;
  title: string;
  templateId: string;
  slug?: string;
  onDelete: (id: string, name: string) => void;
}

const PortfolioCard: FC<PortfolioCardProps> = ({
  id,
  name,
  title,
  templateId,
  slug,
  onDelete,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const portfolioUrl = slug && slug.trim() !== '' ? `/portfolio/${slug}` : `/portfolio/${id}`;

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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 rounded-xl group">
      <CardHeader className="pb-2 border-b dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-800 dark:text-gray-200 truncate max-w-[200px]" title={name}>{name}</span>
          <span className="text-xs font-normal text-indigo-500 dark:text-indigo-400">
            {templateId === "minimal" ? "Minimal template" : 
             templateId === "creative" ? "Creative template" : 
             `Template ${templateId.replace('template', '')}`}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        className="aspect-video bg-white dark:bg-gray-800 flex items-center justify-center p-0 relative overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute inset-0 w-full h-full">
          {templateId === "template3" ? (
            <>
              <Image
                src="/videosandpictures/template3/template3.png?v=1"
                alt={`${name} Preview`}
                fill
                priority
                className={`object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
              />
              <video 
                ref={videoRef}
                src="/videosandpictures/template3/template3.webm?v=1"
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
      
      <CardFooter className="flex flex-wrap justify-between py-4 px-4 border-t dark:border-gray-700">
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" asChild className="px-2 border-indigo-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Link href={`/editor/${id}`} className="flex items-center gap-1.5">
              <Edit className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Edit
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild className="px-2 border-indigo-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Link href={portfolioUrl} target="_blank" className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Preview
            </Link>
          </Button>
          
          <PortfolioShare 
            portfolioId={id}
            portfolioName={name}
            portfolioTitle={title}
            slug={slug}
            className="px-2 border-indigo-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          />
        </div>
        
        <div className="flex gap-1.5 mt-0">
          <PortfolioRegenerate 
            portfolioId={id} 
            portfolioName={name} 
            className="px-2 border-indigo-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(id, name)}
            className="w-8 h-8 p-0 flex items-center justify-center border-red-200 dark:border-red-900 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PortfolioCard; 