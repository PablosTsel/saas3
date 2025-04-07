"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Edit, Eye, Globe, Plus, Settings, Sparkles, User, Users, Bell, LogOut, ChevronRight, ChevronLeft, Upload, X, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { createPortfolio, getUserPortfolios, deletePortfolio } from "@/lib/firebase"

// Define types for our portfolio data
interface Skill {
  name: string;
  level: string;
}

interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  period: string;
}

interface Project {
  name: string;
  description: string;
  image: File | null;
}

interface PortfolioData {
  name: string;
  title: string;
  about: string;
  cv: File | null;
  hasCv: boolean;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projectCount: number;
  projects: Project[];
  templateId: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: "",
    title: "",
    about: "",
    cv: null,
    hasCv: true,
    skills: [],
    experience: [],
    education: [],
    projectCount: 1,
    projects: [{ name: "", description: "", image: null }],
    templateId: ""
  })
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const totalSteps = 4 // Basic info, CV/Skills, Projects, Template
  const progress = (currentStep / totalSteps) * 100

  // Fetch user portfolios on component mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (user) {
        setIsLoading(true);
        try {
          console.log("Fetching portfolios for user:", user.uid);
          const { portfolios: userPortfolios, error } = await getUserPortfolios(user.uid);
          if (error) {
            console.error("Error fetching portfolios:", error);
            toast.error("Failed to load portfolios: " + error);
          } else {
            console.log("Portfolios fetched successfully:", userPortfolios.length);
            setPortfolios(userPortfolios);
          }
        } catch (error: any) {
          console.error("Error fetching portfolios:", error);
          toast.error("An unexpected error occurred while loading portfolios");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPortfolios();
  }, [user]);

  // Add this function after the useEffect hook that fetches portfolios
  const fetchPortfolios = async () => {
    if (user) {
      try {
        console.log("Manually refreshing portfolios for user:", user.uid);
        const { portfolios: userPortfolios, error } = await getUserPortfolios(user.uid);
        if (error) {
          console.error("Error fetching portfolios:", error);
          toast.error("Failed to refresh portfolios: " + error);
        } else {
          console.log("Portfolios refreshed successfully:", userPortfolios.length);
          setPortfolios(userPortfolios);
        }
      } catch (error: any) {
        console.error("Error refreshing portfolios:", error);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const { success, error } = await logout()
      
      if (error) {
        toast.error(error)
        setIsLoggingOut(false)
        return
      }
      
      if (success) {
        toast.success("Logged out successfully!")
        router.push("/")
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred")
      setIsLoggingOut(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.displayName) return "U"
    
    const nameParts = user.displayName.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  const handleCreatePortfolio = () => {
    setCurrentStep(1)
    setPortfolioData({
      name: "",
      title: "",
      about: "",
      cv: null,
      hasCv: true,
      skills: [],
      experience: [],
      education: [],
      projectCount: 1,
      projects: [{ name: "", description: "", image: null }],
      templateId: ""
    })
    setSelectedTemplate("")
    setIsCreateModalOpen(true)
  }

  const handleNextStep = () => {
    // Validation for each step
    if (currentStep === 1 && !portfolioData.name) {
      toast.error("Please enter a portfolio name")
      return
    }
    
    // CV is completely optional now, no warning needed
    
    if (currentStep === 2 && !portfolioData.hasCv) {
      // Only validate the minimum required info for skills and experience
      if (portfolioData.skills.length === 0) {
        toast.warning("Consider adding at least one skill to showcase your expertise")
        // Don't block progress
      }
      if (portfolioData.experience.length === 0) {
        toast.warning("Consider adding at least one work experience to make your portfolio more complete")
        // Don't block progress
      }
    }
    
    if (currentStep === 3) {
      // Only validate project name and description
      const hasEmptyProjects = portfolioData.projects.some(project => !project.name || !project.description)
      if (hasEmptyProjects) {
        toast.warning("Some projects are missing a name or description. This is recommended but not required.")
        // Don't block progress
      }
      
      // Images are completely optional
      const missingImages = portfolioData.projects.some(project => !project.image)
      if (missingImages) {
        toast.info("Some projects don't have images. Default placeholders will be used.", 
          { duration: 3000 })
        // Continue anyway - don't return
      }
    }
    
    if (currentStep === 4 && !selectedTemplate) {
      toast.warning("Please select a template")
      // Continue anyway with default template
      setSelectedTemplate("minimal")
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Handle form submission
      handleSubmitPortfolio()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setPortfolioData({...portfolioData, templateId})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPortfolioData({
      ...portfolioData,
      [name]: value
    })
  }

  // Add a utility function to compress images before upload
  const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
    // Early return if not an image or already small enough
    if (!file.type.startsWith('image/') || file.size <= maxSizeMB * 1024 * 1024) {
      return file;
    }

    // Special handling for PNGs to preserve transparency
    const isPNG = file.type === 'image/png';
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          // Calculate new dimensions while preserving aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Maximum dimensions - smaller for better performance
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // For PNGs, preserve transparency
          if (isPNG) {
            ctx.clearRect(0, 0, width, height);
          } else {
            // For JPGs, fill with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with optimized quality
          // Use original format for PNG to preserve transparency
          const outputFormat = isPNG ? 'image/png' : 'image/jpeg';
          const quality = isPNG ? 0.85 : 0.75; // Higher quality for PNGs
          
          canvas.toBlob((blob) => {
            if (blob) {
              // Create new file from blob
              const newFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: Date.now(),
              });
              
              console.log(`Compressed ${file.name} from ${(file.size / (1024 * 1024)).toFixed(2)}MB to ${(newFile.size / (1024 * 1024)).toFixed(2)}MB`);
              resolve(newFile);
            } else {
              // If compression fails, return original
              console.warn("Image compression failed, using original file");
              resolve(file);
            }
          }, outputFormat, quality);
        };
        img.onerror = () => {
          console.error('Failed to load image for compression');
          resolve(file); // Return original on error
        };
      };
      reader.onerror = () => {
        console.error('Failed to read file for compression');
        resolve(file); // Return original on error
      };
    });
  };

  // Update the handleFileUpload function to better handle different file types
  const handleFileUpload = async (file: File, field: 'cv' | 'projectImage', projectIndex?: number) => {
    try {
      // Check file size and type
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf' || file.type === 'application/msword' || 
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Size limits based on file type
      let maxSize;
      let fileTypeMsg;
      
      if (field === 'cv' && !isPDF) {
        toast.error(`Only PDF, DOC, or DOCX files are allowed for CV uploads.`);
        return;
      }
      
      if (field === 'projectImage' && !isImage) {
        toast.error(`Only image files (PNG, JPG, JPEG, GIF) are allowed for project screenshots.`);
        return;
      }
      
      if (isImage) {
        maxSize = 5 * 1024 * 1024; // 5MB for images
        fileTypeMsg = "image";
      } else if (isPDF) {
        maxSize = 10 * 1024 * 1024; // 10MB for PDFs/documents
        fileTypeMsg = "document";
      } else {
        maxSize = 3 * 1024 * 1024; // 3MB default
        fileTypeMsg = "file";
      }
      
      if (file.size > maxSize) {
        toast.warning(
          `The ${fileTypeMsg} "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the recommended size limit of ${(maxSize / (1024 * 1024))}MB. It may upload slowly.`,
          { duration: 5000 }
        );
      }
      
      // For images, try to compress them
      let processedFile = file;
      if (field === 'projectImage' && isImage) {
        toast.loading(`Optimizing image "${file.name}"...`, { id: `compress-${file.name}` });
        try {
          processedFile = await compressImage(file);
          toast.dismiss(`compress-${file.name}`);
          if (processedFile.size < file.size) {
            toast.success(`Image optimized: ${(file.size / (1024 * 1024)).toFixed(1)}MB → ${(processedFile.size / (1024 * 1024)).toFixed(1)}MB`);
          }
        } catch (err) {
          toast.dismiss(`compress-${file.name}`);
          console.error("Image compression failed:", err);
          // Continue with original file
        }
      }
      
      // Update the appropriate state with the processed file
      if (field === 'cv') {
        setPortfolioData({
          ...portfolioData,
          cv: processedFile
        });
        toast.success(`CV file "${file.name}" selected`);
      } else if (field === 'projectImage' && typeof projectIndex === 'number') {
        const newProjects = [...portfolioData.projects];
        newProjects[projectIndex] = { 
          ...newProjects[projectIndex], 
          image: processedFile 
        };
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        });
        toast.success(`Project image "${file.name}" selected`);
      }
    } catch (error) {
      console.error("Error handling file upload:", error);
      toast.error("There was a problem processing the file. Please try again.");
    }
  };

  const handleSubmitPortfolio = async () => {
    if (!user) {
      toast.error("You must be logged in to create a portfolio");
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);
    
    // Clear any existing toasts
    toast.dismiss();
    
    // Show a loading toast that can be dismissed
    const loadingToastId = toast.loading("Creating your portfolio...", {
      duration: Infinity, // Don't auto-dismiss
    });

    try {
      // Check if portfolio has the minimum required data
      if (!portfolioData.name) {
        toast.dismiss(loadingToastId);
        toast.error("Portfolio name is required");
        setIsSubmitting(false);
        return;
      }

      // If no template is selected, use the default
      if (!selectedTemplate) {
        setSelectedTemplate("minimal");
      }
      
      // Create a copy with all the necessary data
      const portfolioToCreate = {
        ...portfolioData,
        templateId: selectedTemplate || "minimal" // Default to minimal
      };
      
      // Create the portfolio
      const result = await createPortfolio(user.uid, portfolioToCreate);
      
      // Handle the result
      toast.dismiss(loadingToastId);
      
      if (!result.success) {
        toast.error(result.error || "Failed to create portfolio");
        setIsSubmitting(false);
        return;
      }
      
      // Portfolio created successfully, but maybe with file upload issues
      if (result.error) {
        // Some files didn't upload, but portfolio was created
        toast.success("Portfolio created successfully!");
        toast.info(result.error, { duration: 8000 });
      } else {
        // Everything worked perfectly
        toast.success("Portfolio created successfully!");
      }
      
      // Refresh the portfolios list
      fetchPortfolios();
      
      // Reset form and close modal
      setIsCreateModalOpen(false);
      setCurrentStep(1);
      setSelectedTemplate("");
      setPortfolioData({
        name: "",
        title: "",
        about: "",
        cv: null,
        hasCv: true,
        skills: [],
        experience: [],
        education: [],
        projectCount: 1,
        projects: [{ name: "", description: "", image: null }],
        templateId: "",
      });
    } catch (err: any) {
      console.error("Unexpected error creating portfolio:", err);
      toast.dismiss(loadingToastId);
      
      // Still try to create the portfolio without files
      try {
        toast.loading("File uploads failed. Creating portfolio without files...", { id: "retry" });
        
        // Create a copy without files for a second attempt
        const portfolioWithoutFiles = {
          ...portfolioData,
          cv: null,
          projects: portfolioData.projects.map(project => ({...project, image: null})),
          templateId: selectedTemplate || "minimal"
        };
        
        const retryResult = await createPortfolio(user.uid, portfolioWithoutFiles);
        toast.dismiss("retry");
        
        if (retryResult.success) {
          toast.success("Portfolio created successfully, but without any files.");
          fetchPortfolios();
          setIsCreateModalOpen(false);
          setCurrentStep(1);
          setSelectedTemplate("");
          setPortfolioData({
            name: "",
            title: "",
            about: "",
            cv: null,
            hasCv: true,
            skills: [],
            experience: [],
            education: [],
            projectCount: 1,
            projects: [{ name: "", description: "", image: null }],
            templateId: "",
          });
        } else {
          toast.error("We couldn't create your portfolio. Please try again later.");
        }
      } catch (retryErr) {
        toast.dismiss("retry");
        console.error("Even retry failed:", retryErr);
        toast.error("Portfolio creation failed. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCvToggle = (hasCv: boolean) => {
    setPortfolioData({
      ...portfolioData,
      hasCv,
      // Reset fields accordingly
      cv: hasCv ? portfolioData.cv : null,
      skills: !hasCv ? portfolioData.skills : [],
      experience: !hasCv ? portfolioData.experience : [],
      education: !hasCv ? portfolioData.education : []
    })
  }

  const handleAddSkill = () => {
    setPortfolioData({
      ...portfolioData,
      skills: [...portfolioData.skills, { name: "", level: "Beginner" }]
    })
  }

  const handleUpdateSkill = (index: number, field: keyof Skill, value: string) => {
    const newSkills = [...portfolioData.skills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setPortfolioData({
      ...portfolioData,
      skills: newSkills
    })
  }

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...portfolioData.skills]
    newSkills.splice(index, 1)
    setPortfolioData({
      ...portfolioData,
      skills: newSkills
    })
  }

  const handleAddExperience = () => {
    setPortfolioData({
      ...portfolioData,
      experience: [...portfolioData.experience, { company: "", position: "", period: "", description: "" }]
    })
  }

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...portfolioData.experience]
    newExperience[index] = { ...newExperience[index], [field]: value }
    setPortfolioData({
      ...portfolioData,
      experience: newExperience
    })
  }

  const handleRemoveExperience = (index: number) => {
    const newExperience = [...portfolioData.experience]
    newExperience.splice(index, 1)
    setPortfolioData({
      ...portfolioData,
      experience: newExperience
    })
  }

  const handleAddEducation = () => {
    setPortfolioData({
      ...portfolioData,
      education: [...portfolioData.education, { institution: "", degree: "", period: "" }]
    })
  }

  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...portfolioData.education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setPortfolioData({
      ...portfolioData,
      education: newEducation
    })
  }

  const handleRemoveEducation = (index: number) => {
    const newEducation = [...portfolioData.education]
    newEducation.splice(index, 1)
    setPortfolioData({
      ...portfolioData,
      education: newEducation
    })
  }

  const handleUpdateProjectCount = (count: string) => {
    const newCount = parseInt(count, 10)
    let newProjects = [...portfolioData.projects]
    
    if (newCount > portfolioData.projects.length) {
      // Add new projects
      for (let i = portfolioData.projects.length; i < newCount; i++) {
        newProjects.push({ name: "", description: "", image: null })
      }
    } else if (newCount < portfolioData.projects.length) {
      // Remove excess projects
      newProjects = newProjects.slice(0, newCount)
    }
    
    setPortfolioData({
      ...portfolioData,
      projectCount: newCount,
      projects: newProjects
    })
  }

  const handleUpdateProject = (index: number, field: keyof Project, value: string | File | null) => {
    const newProjects = [...portfolioData.projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setPortfolioData({
      ...portfolioData,
      projects: newProjects
    })
  }

  // Add function to delete portfolio
  const handleDeletePortfolio = async (portfolioId: string, portfolioName: string) => {
    if (!user) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the portfolio "${portfolioName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { success, error } = await deletePortfolio(portfolioId);
      
      if (success) {
        toast.success(`Portfolio "${portfolioName}" deleted successfully`);
        // Refresh the portfolios list
        fetchPortfolios();
      } else {
        toast.error(`Failed to delete portfolio: ${error}`);
      }
    } catch (error: any) {
      console.error("Error deleting portfolio:", error);
      toast.error("An unexpected error occurred while deleting the portfolio");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-indigo-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PortfolioMaker</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-indigo-100 hover:ring-indigo-200 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1 rounded-xl overflow-hidden shadow-lg border border-indigo-100" align="end" forceMount>
                <DropdownMenuLabel className="font-normal bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex flex-col space-y-1 py-1">
                    <p className="text-sm font-medium leading-none text-gray-800">{user?.displayName || "User"}</p>
                    <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-indigo-50" />
                <DropdownMenuItem className="py-2.5 cursor-pointer hover:bg-indigo-50">
                  <User className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2.5 cursor-pointer hover:bg-indigo-50">
                  <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="py-2.5 cursor-pointer hover:bg-red-50 text-red-600 hover:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
            <p className="text-gray-600">Welcome, <span className="text-indigo-600 font-medium">{user?.displayName || "User"}</span>! Manage your portfolios and account settings.</p>
          </div>
          <Button 
            onClick={handleCreatePortfolio}
            className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md px-6 py-6 h-auto rounded-lg transition-all hover:shadow-lg hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Portfolio
          </Button>
        </div>

        <Tabs defaultValue="portfolios" className="w-full">
          <TabsList className="flex space-x-2 bg-white p-1 rounded-lg border border-indigo-100 mb-6 shadow-sm">
            <TabsTrigger 
              value="portfolios" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 transition-all"
            >
              Portfolios
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 transition-all"
            >
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolios" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Better loading state
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-lg text-indigo-600 font-medium">Loading your portfolios...</p>
                  <p className="text-sm text-gray-500 mt-2">This might take a few seconds</p>
                </div>
              ) : portfolios.length === 0 ? (
                // Empty state
                <Card className="col-span-full overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100 rounded-xl group">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <Plus className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No portfolios yet</h3>
                    <p className="text-gray-600 text-center mb-6">Create your first portfolio to showcase your skills and projects.</p>
                    <Button 
                      onClick={handleCreatePortfolio}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md px-6 py-6 h-auto rounded-lg transition-all hover:shadow-lg hover:scale-105"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Portfolio
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Portfolio cards
                portfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100 rounded-xl group">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-gray-800">{portfolio.name}</CardTitle>
                      <CardDescription className="text-indigo-500">
                        {portfolio.templateId === "minimal" ? "Minimal template" : 
                         portfolio.templateId === "creative" ? "Creative template" : 
                         "Professional template"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="aspect-video bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center p-0 relative overflow-hidden">
                      <div className="text-center transition-transform duration-300 group-hover:scale-110">
                        <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                          <Globe className="h-10 w-10 text-indigo-400" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Portfolio Preview</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between py-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700">
                          <Link href={`/editor/${portfolio.id}`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-indigo-500" /> Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                          onClick={() => handleDeletePortfolio(portfolio.id, portfolio.name)}
                        >
                          <X className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                      <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                        <Link href={`/portfolio/${portfolio.id}`} className="flex items-center gap-2">
                          <Eye className="h-4 w-4" /> View Live
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}

              {/* Create New Portfolio Card - always show this card */}
              {!isLoading && (
                <Card 
                  onClick={handleCreatePortfolio}
                  className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-300 border border-dashed border-indigo-200 rounded-xl bg-white/50 group cursor-pointer"
                >
                  <CardHeader className="pb-2 border-b border-dashed border-indigo-100">
                    <CardTitle className="text-gray-800">Create New Portfolio</CardTitle>
                    <CardDescription className="text-indigo-500">Choose from our templates</CardDescription>
                  </CardHeader>
                  <CardContent className="aspect-video flex items-center justify-center p-0 group-hover:bg-indigo-50/50 transition-colors">
                    <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-indigo-100 hover:scale-110 transition-all border border-dashed border-indigo-200 group-hover:border-indigo-300">
                      <Plus className="h-12 w-12 text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-gray-800">Portfolio Analytics</CardTitle>
                <CardDescription className="text-indigo-700">View statistics for your portfolios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Total Views</span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">124</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Unique Visitors</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">87</span>
                  </div>
                </div>
                <div className="h-[250px] w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center border border-indigo-100 shadow-inner">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                    <p className="text-sm text-indigo-600 font-medium">Analytics chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-gray-800">Account Settings</CardTitle>
                <CardDescription className="text-indigo-700">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" />
                    Personal Information
                  </h3>
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-indigo-500 mb-1">Name</p>
                        <p className="font-medium text-gray-800">{user?.displayName || "Not set"}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-indigo-500 mb-1">Email</p>
                        <p className="font-medium text-gray-800">{user?.email}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-indigo-500 mb-1">Account Created</p>
                        <p className="font-medium text-gray-800">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Subscription
                  </h3>
                  <div className="p-5 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Free Plan</p>
                        <p className="text-sm text-gray-500 mt-1">Basic features</p>
                      </div>
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 h-auto rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-500" />
                    Password
                  </h3>
                  <div className="p-5 bg-white rounded-lg border border-indigo-100 shadow-sm">
                    <p className="text-sm text-gray-600 mb-3">Change your password to keep your account secure</p>
                    <Button variant="outline" className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700">
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2 text-red-600">
                    <LogOut className="h-5 w-5" />
                    Delete Account
                  </h3>
                  <div className="p-5 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                    <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data. This action cannot be undone.</p>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Portfolio Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        // Only allow closing if not submitting
        if (!isSubmitting) {
          setIsCreateModalOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] p-0 rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
            <DialogTitle className="text-2xl font-bold text-gray-800">Create New Portfolio</DialogTitle>
            <DialogDescription className="text-indigo-700">
              Complete the steps below to set up your portfolio
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 pt-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="w-full mb-6 sticky top-0 bg-white z-10 pt-2 pb-4">
              <div className="flex justify-between mb-2 text-xs text-gray-500">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-indigo-100 progress" />
            </div>
            
            {/* Content for each step */}
            <div className="pb-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="py-4 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Portfolio Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="My Professional Portfolio" 
                      value={portfolioData.name}
                      onChange={handleInputChange}
                      className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                    <p className="text-xs text-gray-500">This will be used to identify your portfolio in your dashboard.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Frontend Developer" 
                      value={portfolioData.title}
                      onChange={handleInputChange}
                      className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                    <p className="text-xs text-gray-500">Your job title or professional focus.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">About Me</Label>
                    <Textarea 
                      id="about" 
                      name="about" 
                      placeholder="I'm a passionate developer with 5 years of experience..." 
                      value={portfolioData.about}
                      onChange={handleInputChange}
                      className="min-h-[120px] border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                    <p className="text-xs text-gray-500">A brief introduction about yourself.</p>
                  </div>
                </div>
              )}
              
              {/* Step 2: CV Upload or Manual Entry */}
              {currentStep === 2 && (
                <div className="py-4 space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Resume/CV</h3>
                  
                  <div className="flex items-center gap-4">
                    <div 
                      className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                        portfolioData.hasCv 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => handleCvToggle(true)}
                    >
                      <Upload className="h-5 w-5 mx-auto mb-2 text-indigo-500" />
                      <div className="text-sm font-medium">Upload my CV</div>
                    </div>
                    
                    <div 
                      className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                        !portfolioData.hasCv 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => handleCvToggle(false)}
                    >
                      <Edit className="h-5 w-5 mx-auto mb-2 text-indigo-500" />
                      <div className="text-sm font-medium">Don't have a CV yet</div>
                    </div>
                  </div>
                  
                  {portfolioData.hasCv ? (
                    // CV upload section
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-indigo-100 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors">
                        <Upload className="h-10 w-10 text-indigo-300 mx-auto mb-4" />
                        <div className="text-sm text-gray-600 mb-4">
                          {portfolioData.cv 
                            ? `Selected file: ${portfolioData.cv.name}` 
                            : "Drag and drop your CV here, or click to browse"}
                        </div>
                        <input 
                          type="file" 
                          id="cv-upload" 
                          accept=".pdf,.doc,.docx" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], 'cv')
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700"
                          onClick={() => document.getElementById('cv-upload')?.click()}
                        >
                          Select File
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Accepted formats: PDF, DOC, DOCX, max 5MB.</p>
                      <p className="text-xs text-indigo-600">Your skills, experience, and education will be extracted from your CV.</p>
                    </div>
                  ) : (
                    // Manual entry section
                    <div className="space-y-6">
                      {/* Skills Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-gray-800">Skills</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs border-indigo-200"
                            onClick={handleAddSkill}
                          >
                            Add Skill
                          </Button>
                        </div>
                        
                        {portfolioData.skills.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No skills added yet. Click "Add Skill" to begin.</p>
                        ) : (
                          <div className="space-y-3">
                            {portfolioData.skills.map((skill, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <Input 
                                  value={skill.name} 
                                  onChange={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                                  placeholder="e.g. React, JavaScript, UI Design" 
                                  className="flex-1 border-indigo-100"
                                />
                                <select 
                                  value={skill.level}
                                  onChange={(e) => handleUpdateSkill(index, 'level', e.target.value)}
                                  className="w-32 h-10 rounded-md border border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Expert">Expert</option>
                                </select>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                  onClick={() => handleRemoveSkill(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Experience Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-gray-800">Work Experience</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs border-indigo-200"
                            onClick={handleAddExperience}
                          >
                            Add Experience
                          </Button>
                        </div>
                        
                        {portfolioData.experience.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No work experience added yet. Click "Add Experience" to begin.</p>
                        ) : (
                          <div className="space-y-5">
                            {portfolioData.experience.map((exp, index) => (
                              <div key={index} className="space-y-3 p-3 rounded-lg border border-indigo-100 bg-indigo-50/30">
                                <div className="flex justify-between">
                                  <h4 className="text-sm font-medium text-indigo-600">Position {index + 1}</h4>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                                    onClick={() => handleRemoveExperience(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <Input 
                                    value={exp.company} 
                                    onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                                    placeholder="Company Name" 
                                    className="w-full border-indigo-100"
                                  />
                                  <div className="flex gap-2">
                                    <Input 
                                      value={exp.position} 
                                      onChange={(e) => handleUpdateExperience(index, 'position', e.target.value)}
                                      placeholder="Position Title" 
                                      className="flex-1 border-indigo-100"
                                    />
                                    <Input 
                                      value={exp.period} 
                                      onChange={(e) => handleUpdateExperience(index, 'period', e.target.value)}
                                      placeholder="Period (e.g. 2020-Present)" 
                                      className="w-40 border-indigo-100"
                                    />
                                  </div>
                                  <Textarea 
                                    value={exp.description} 
                                    onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                                    placeholder="Describe your responsibilities and achievements" 
                                    className="w-full min-h-[60px] border-indigo-100"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Education Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-gray-800">Education</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs border-indigo-200"
                            onClick={handleAddEducation}
                          >
                            Add Education
                          </Button>
                        </div>
                        
                        {portfolioData.education.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No education added yet. Click "Add Education" to begin.</p>
                        ) : (
                          <div className="space-y-3">
                            {portfolioData.education.map((edu, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between">
                                    <Input 
                                      value={edu.institution} 
                                      onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                                      placeholder="Institution Name" 
                                      className="w-full border-indigo-100"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Input 
                                      value={edu.degree} 
                                      onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                                      placeholder="Degree/Certification" 
                                      className="flex-1 border-indigo-100"
                                    />
                                    <Input 
                                      value={edu.period} 
                                      onChange={(e) => handleUpdateEducation(index, 'period', e.target.value)}
                                      placeholder="Period (e.g. 2016-2020)" 
                                      className="w-40 border-indigo-100"
                                    />
                                  </div>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 mt-2 text-gray-400 hover:text-red-500"
                                  onClick={() => handleRemoveEducation(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Projects */}
              {currentStep === 3 && (
                <div className="py-4 space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Projects</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectCount">How many projects would you like to showcase?</Label>
                    <select 
                      id="projectCount"
                      value={portfolioData.projectCount}
                      onChange={(e) => handleUpdateProjectCount(e.target.value)}
                      className="w-full h-10 rounded-md border border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">You can showcase up to 6 projects in your portfolio.</p>
                  </div>
                  
                  <div className="space-y-6 mt-4">
                    {portfolioData.projects.map((project, index) => (
                      <div key={index} className="p-4 border border-indigo-100 rounded-lg space-y-4 bg-indigo-50/30">
                        <h4 className="font-medium text-indigo-600 flex justify-between">
                          Project {index + 1}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`project-${index}-name`}>Project Name</Label>
                            <Input 
                              id={`project-${index}-name`}
                              value={project.name}
                              onChange={(e) => handleUpdateProject(index, 'name', e.target.value)}
                              placeholder="My Awesome Project"
                              className="border-indigo-100"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`project-${index}-description`}>Description</Label>
                            <Textarea 
                              id={`project-${index}-description`}
                              value={project.description}
                              onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                              placeholder="Describe what this project is about, technologies used, and your role"
                              className="min-h-[80px] border-indigo-100"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`project-${index}-image`}>Project Image</Label>
                            <div className="border-2 border-dashed border-indigo-100 rounded-lg p-4 text-center hover:border-indigo-300 transition-colors">
                              {project.image ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-indigo-600">
                                    Selected image: {project.image.name}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs"
                                    onClick={() => document.getElementById(`project-${index}-image-upload`)?.click()}
                                  >
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                                  <div className="text-sm text-gray-600 mb-2">
                                    Upload a screenshot or image of your project
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs"
                                    onClick={() => document.getElementById(`project-${index}-image-upload`)?.click()}
                                  >
                                    Select Image
                                  </Button>
                                </>
                              )}
                              <input 
                                type="file" 
                                id={`project-${index}-image-upload`}
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(e.target.files[0], 'projectImage', index)
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">Recommended size: 1200x800px, max 2MB. Formats: JPG, PNG.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Step 4: Choose Template */}
              {currentStep === 4 && (
                <div className="py-4 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Choose a template</h3>
                  <p className="text-sm text-gray-600">Select a design template for your portfolio website.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "minimal" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("minimal")}
                    >
                      <div className="aspect-[3/4] bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                            <User className="h-8 w-8 text-indigo-400" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Minimal</div>
                        <div className="text-xs text-gray-500">Clean and focused</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "creative" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("creative")}
                    >
                      <div className="aspect-[3/4] bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                            <Sparkles className="h-8 w-8 text-purple-400" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Creative</div>
                        <div className="text-xs text-gray-500">Vibrant and modern</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                      You'll be able to customize colors, fonts, and layout after creating your portfolio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-t shrink-0">
            <Button 
              variant="outline" 
              onClick={() => currentStep === 1 ? setIsCreateModalOpen(false) : handlePreviousStep()}
              disabled={isSubmitting}
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700"
            >
              {currentStep === 1 ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </>
              )}
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
            >
              {currentStep === totalSteps ? (
                <>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Create Portfolio
                    </>
                  )}
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


