import { Layout, Palette, Smartphone, Briefcase, Award, Mail, Zap, Globe, Shield } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "layout":
        return <Layout className="h-6 w-6" />
      case "palette":
        return <Palette className="h-6 w-6" />
      case "smartphone":
        return <Smartphone className="h-6 w-6" />
      case "briefcase":
        return <Briefcase className="h-6 w-6" />
      case "award":
        return <Award className="h-6 w-6" />
      case "mail":
        return <Mail className="h-6 w-6" />
      case "zap":
        return <Zap className="h-6 w-6" />
      case "globe":
        return <Globe className="h-6 w-6" />
      case "shield":
        return <Shield className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-2 text-primary">{getIcon(icon)}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}

