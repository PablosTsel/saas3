"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

// Template data - same as in dashboard
const TEMPLATES = [
  {
    id: "template1",
    name: "Clean Modern",
    description: "A clean, modern design with subtle animations and a professional look.",
    previewImage: "/templates/template1/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template2",
    name: "Creative Portfolio",
    description: "A creative portfolio with a unique layout, perfect for showcasing visual work.",
    previewImage: "/templates/template2/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template3",
    name: "Developer Focused",
    description: "A developer-focused template with a code-inspired design.",
    previewImage: "/videosandpictures/template3/template3.png?v=1",
    previewVideo: "/videosandpictures/template3/template3.webm?v=1",
    hasVideo: true
  },
  {
    id: "template4",
    name: "Bubble Animation",
    description: "A sleek design with floating bubble animations in the background.",
    previewImage: "/templates/template4/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template5",
    name: "Corporate Professional",
    description: "A professional template with a corporate feel, perfect for business roles.",
    previewImage: "/templates/template5/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template6",
    name: "Minimalist",
    description: "A clean minimalist design that puts your content front and center.",
    previewImage: "/templates/template6/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template7",
    name: "Gradient Waves",
    description: "A modern design with animated gradient waves in the background.",
    previewImage: "/templates/template7/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  },
  {
    id: "template8",
    name: "Artistic Minimal",
    description: "An ultra-minimalistic and artistic design with subtle animations and typography focus.",
    previewImage: "/templates/template8/thumbnail_dash.svg",
    previewVideo: "",
    hasVideo: false
  }
];

// Example portfolio data for John Doe - this will be used as a starting point
const johnDoePortfolioData = {
  name: "My Portfolio",
  title: "AI Engineer",
  smallIntro: "I'm a skilled AI Engineer with a passion for developing innovative solutions.",
  about: "Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing. I am passionate about harnessing cutting-edge technologies to create impactful AI solutions. I have experience building and deploying AI models that solve real-world problems and drive business value. My approach combines technical excellence with a strong focus on practical applications and ethical considerations. Collaboration and continuous learning are at the heart of my professional philosophy.",
  fullName: "John Doe",
  email: "johndoe@gmail.com",
  phone: "+34 607980731",
  githubProfile: "https://github.com/PablosTsel",
  profilePicture: null,
  cv: null,
  hasCv: true,
  skills: [
    { name: "Python", level: "95%" },
    { name: "Machine Learning", level: "90%" },
    { name: "TensorFlow", level: "85%" },
    { name: "Natural Language Processing", level: "80%" },
    { name: "Computer Vision", level: "85%" },
    { name: "Data Structures & Algorithms", level: "90%" }
  ],
  experience: [],
  education: [],
  projects: [
    { 
      name: "NBA Dashboard", 
      description: "Developed an Excel file containing various data and statistics from the 2015-2017 NBA seasons. The dashboard provides insights on players, teams, and games, including player stats, team performance metrics, and game-by-game analysis. Users can filter and sort the data to identify trends and patterns in player performance across different seasons.", 
      image: null,
      technologies: ["Excel", "Data Analysis", "Sports Analytics", "Dashboard"]
    },
    { 
      name: "AI Recommendation System", 
      description: "Developed a sophisticated recommendation engine using collaborative filtering and content-based algorithms to provide personalized suggestions to users, resulting in a 35% increase in user engagement. The system was designed with scalability in mind, allowing seamless integration with various platforms. Extensive A/B testing was conducted to fine-tune algorithm performance and maximize user satisfaction.", 
      image: null,
      technologies: ["Python", "Machine Learning", "Collaborative Filtering", "User Engagement"]
    },
    { 
      name: "Natural Language Processing Tool", 
      description: "Created an NLP tool that analyzes customer feedback across multiple channels, automatically categorizing issues and identifying sentiment to help businesses understand customer needs better. Leveraged state-of-the-art transformer models to ensure high accuracy in language understanding. The tool enabled proactive customer service strategies by uncovering recurring pain points and emerging trends.", 
      image: null,
      technologies: ["NLP", "Python", "Sentiment Analysis", "Text Classification"] 
    },
    { 
      name: "Computer Vision Project", 
      description: "Built a computer vision system for object detection and classification in real-time video streams, achieving 94% accuracy in identifying specific items in complex environments. The solution utilized a YOLO-based architecture optimized for speed and performance on edge devices. It significantly improved operational efficiency.", 
      image: null,
      technologies: ["Computer Vision", "TensorFlow", "Object Detection", "Real-time Processing"]
    }
  ]
};

export default function InteractiveTemplateSelection() {
  const { user } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const templateVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Add effect for template video hover
  useEffect(() => {
    if (hoveredTemplate && templateVideoRefs.current[hoveredTemplate]) {
      templateVideoRefs.current[hoveredTemplate]?.play().catch(err => {
        console.error("Video play error:", err);
      });
    } else {
      // Pause all videos when not hovering
      Object.keys(templateVideoRefs.current).forEach(key => {
        if (templateVideoRefs.current[key]) {
          templateVideoRefs.current[key]?.pause();
          if (templateVideoRefs.current[key]) {
            templateVideoRefs.current[key]!.currentTime = 0;
          }
        }
      });
    }
  }, [hoveredTemplate]);

  // Use effect to handle mounted state
  useEffect(() => {
    setMounted(true)
    
    // Redirect to login if not authenticated
    if (!user) {
      toast.error("You need to be logged in to create a portfolio")
      router.push("/auth/login")
    }
  }, [user, router])

  const handleTemplateSelect = (templateId: string) => {
    // Set loading state while we create the portfolio data
    setIsCreating(true);
    
    try {
      // Create a new portfolio with John Doe's data and the selected template
      const portfolioData = {
        ...johnDoePortfolioData,
        templateId: templateId
      };
      
      // Store the portfolio data in sessionStorage to persist it between pages
      sessionStorage.setItem('prefilledPortfolioData', JSON.stringify(portfolioData));
      
      // Show a toast notification to let the user know a template is being prepared
      toast.success(`Preparing ${TEMPLATES.find(t => t.id === templateId)?.name} template for editing`);
      
      // Redirect to interactive editor with the selected template
      router.push(`/create-portfolio/interactive/editor?template=${templateId}&prefilled=true`);
    } catch (error) {
      console.error("Error preparing template:", error);
      toast.error("Failed to prepare template. Please try again.");
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <Link href="/" className="flex items-center gap-3">
            {mounted ? (
              theme === 'dark' ? (
                <>
                  <Image 
                    src="/logos/DarkThemeLogo.png" 
                    alt="MakePortfolio Logo" 
                    width={150} 
                    height={40} 
                    className="h-10 w-auto"
                    priority
                  />
                  <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">MakePortfolio</span>
                </>
              ) : (
                <>
                  <Image 
                    src="/logos/LightThemeLogo.png" 
                    alt="MakePortfolio Logo" 
                    width={150} 
                    height={40} 
                    className="h-10 w-auto"
                    priority
                  />
                  <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">MakePortfolio</span>
                </>
              )
            ) : (
              // Show a placeholder during server render to avoid hydration mismatch
              <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            )}
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Choose a Template
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
          Select a design template for your portfolio. After choosing, you'll be able to edit the content directly within the template.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map(template => (
            <div 
              key={template.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="aspect-[16/9] bg-white dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={template.previewImage}
                    alt={`${template.name} Preview`} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      template.hasVideo && hoveredTemplate === template.id ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  {template.hasVideo && (
                    <video 
                      ref={(el) => {
                        templateVideoRefs.current[template.id] = el;
                      }}
                      src={template.previewVideo}
                      muted
                      loop
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
                <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Loading overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Preparing Your Template</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">Setting up your portfolio with sample data...</p>
          </div>
        </div>
      )}
    </div>
  )
} 