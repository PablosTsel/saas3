import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TemplatePreviewProps {
  name: string
  imageSrc: string
  className?: string
}

export default function TemplatePreview({ name, imageSrc, className = "" }: TemplatePreviewProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden">
        <div className="relative aspect-[3/4] w-full">
          <Image src={imageSrc || "/placeholder.svg"} alt={`${name} template preview`} fill className="object-cover" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4">
        <p className="font-medium">{name}</p>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/signup">Use</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

