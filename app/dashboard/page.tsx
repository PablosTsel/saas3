"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Edit, Eye, Globe, Plus, Settings, Sparkles, User, Users, Bell, LogOut, ChevronRight, ChevronLeft, Upload, X, Check, File } from "lucide-react"
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
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { createPortfolio, getUserPortfolios, deletePortfolio } from "@/lib/firebase"
import PortfolioCard from "@/components/portfolio-card"

// Define types for our portfolio data
interface Skill {
  name: string;
  level?: string; // Making level optional since we won't be using it
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
  technologies: string[];
  githubUrl?: string;
  reportFile?: File | null;
}

interface PortfolioData {
  name: string;
  title: string;
  smallIntro: string;
  about: string;
  fullName: string;
  email: string;
  phone: string;
  profilePicture: File | null;
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
    title: "AI Engineer",
    smallIntro: "I'm a skilled AI Engineer with a passion for developing innovative solutions.",
    about: "Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing. I have experience building and deploying AI models that solve real-world problems and drive business value. My approach combines technical excellence with a strong focus on practical applications and ethical considerations.",
    fullName: "John Doe",
    email: "johndoe@gmail.com",
    phone: "+34 607980731",
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
    projectCount: 4,
    projects: [
      { 
        name: "NBA Dashboard", 
        description: "Developed an Excel file containing various data and statistics from the 2015-2017 NBA seasons. The dashboard provides insights on players, teams, and games, including player stats, team performance metrics, and game-by-game analysis. Users can filter and sort the data to identify trends and patterns in player performance across different seasons.", 
        image: null,
        technologies: ["Excel", "Data Analysis", "Sports Analytics", "Dashboard"]
      },
      { 
        name: "AI Recommendation System", 
        description: "Developed a sophisticated recommendation engine using collaborative filtering and content-based algorithms to provide personalized suggestions to users, resulting in a 35% increase in user engagement.", 
        image: null,
        technologies: ["Python", "Machine Learning", "Collaborative Filtering", "User Engagement"]
      },
      { 
        name: "Natural Language Processing Tool", 
        description: "Created an NLP tool that analyzes customer feedback across multiple channels, automatically categorizing issues and identifying sentiment to help businesses understand customer needs better.", 
        image: null,
        technologies: ["NLP", "Python", "Sentiment Analysis", "Text Classification"] 
      },
      { 
        name: "Computer Vision Project", 
        description: "Built a computer vision system for object detection and classification in real-time video streams, achieving 94% accuracy in identifying specific items in complex environments.", 
        image: null,
        technologies: ["Computer Vision", "TensorFlow", "Object Detection", "Real-time Processing"]
      }
    ],
    templateId: ""
  })
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const totalSteps = 4 // Basic info, CV/Skills, Projects, Template
  const progress = (currentStep / totalSteps) * 100

  // Add template hover state for video
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const templateVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({
    template1: null
  });

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
      title: "AI Engineer",
      smallIntro: "I'm a skilled AI Engineer with a passion for developing innovative solutions.",
      about: "Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing. I have experience building and deploying AI models that solve real-world problems and drive business value. My approach combines technical excellence with a strong focus on practical applications and ethical considerations.",
      fullName: "John Doe",
      email: "johndoe@gmail.com",
      phone: "+34 607980731",
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
      projectCount: 4,
      projects: [
        { 
          name: "NBA Dashboard", 
          description: "Developed an Excel file containing various data and statistics from the 2015-2017 NBA seasons. The dashboard provides insights on players, teams, and games, including player stats, team performance metrics, and game-by-game analysis. Users can filter and sort the data to identify trends and patterns in player performance across different seasons.", 
          image: null,
          technologies: ["Excel", "Data Analysis", "Sports Analytics", "Dashboard"]
        },
        { 
          name: "AI Recommendation System", 
          description: "Developed a sophisticated recommendation engine using collaborative filtering and content-based algorithms to provide personalized suggestions to users, resulting in a 35% increase in user engagement.", 
          image: null,
          technologies: ["Python", "Machine Learning", "Collaborative Filtering", "User Engagement"]
        },
        { 
          name: "Natural Language Processing Tool", 
          description: "Created an NLP tool that analyzes customer feedback across multiple channels, automatically categorizing issues and identifying sentiment to help businesses understand customer needs better.", 
          image: null,
          technologies: ["NLP", "Python", "Sentiment Analysis", "Text Classification"] 
        },
        { 
          name: "Computer Vision Project", 
          description: "Built a computer vision system for object detection and classification in real-time video streams, achieving 94% accuracy in identifying specific items in complex environments.", 
          image: null,
          technologies: ["Computer Vision", "TensorFlow", "Object Detection", "Real-time Processing"]
        }
      ],
      templateId: ""
    })
    setSelectedTemplate("")
    setIsCreateModalOpen(true)
  }

  // Add a state to track validation errors for each field
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleNextStep = () => {
    // Reset validation errors
    setValidationErrors({});
    
    // Validation for each step
    if (currentStep === 1) {
      const errors: Record<string, boolean> = {};
      
      // Validate mandatory fields in step 1
      if (!portfolioData.name.trim()) errors.name = true;
      if (!portfolioData.fullName.trim()) errors.fullName = true;
      if (!portfolioData.title.trim()) errors.title = true;
      if (!portfolioData.smallIntro.trim()) errors.smallIntro = true;
      if (!portfolioData.about.trim()) errors.about = true;
      if (!portfolioData.profilePicture) errors.profilePicture = true;
      
      // If there are validation errors, don't proceed
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        
        // Scroll to the first error field
        const firstErrorField = Object.keys(errors)[0];
        
        // Use a timeout to ensure DOM is updated with error states
        setTimeout(() => {
          let scrollTarget = null;
          
          // Special handling for profile picture
          if (firstErrorField === 'profilePicture') {
            // Try to find the profile picture upload container
            const uploadContainer = document.querySelector('[data-upload-container="profilePicture"]');
            if (uploadContainer) {
              scrollTarget = uploadContainer;
            }
          } else {
            // For regular input fields, use the ID
            const element = document.getElementById(firstErrorField);
            if (element) {
              scrollTarget = element;
            }
          }

          // If we found a target element, scroll to it
          if (scrollTarget) {
            console.log("Scrolling to:", scrollTarget);
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Try to focus the element if it's an input
            if (scrollTarget.tagName === 'INPUT' || scrollTarget.tagName === 'TEXTAREA') {
              try {
                (scrollTarget as HTMLInputElement | HTMLTextAreaElement).focus();
              } catch (e) {
                console.log("Could not focus element", e);
              }
            }
            
            // Highlight the element temporarily to make it more visible
            scrollTarget.classList.add('ring-2', 'ring-red-400');
            setTimeout(() => {
              scrollTarget.classList.remove('ring-2', 'ring-red-400');
            }, 2000);
          }
        }, 100);
        
        // Show toast with error message
        toast.error("Please fill in all required fields before proceeding", {
          duration: 3000,
        });
        
        return;
      }
    }
    
    // Step 2 validations
    if (currentStep === 2) {
      const errors: Record<string, boolean> = {};
      
      // Email and phone are mandatory
      if (!portfolioData.email.trim()) errors.email = true;
      if (!portfolioData.phone.trim()) errors.phone = true;
      
      // At least 3 skills are required
      if (portfolioData.skills.length < 3) {
        errors.skills = true;
        toast.error("Please add at least 3 skills", {
          duration: 3000,
        });
        return;
      }
      
      // Check if skills have names
      const emptySkills = portfolioData.skills.some((skill, index) => {
        if (!skill.name.trim()) {
          errors[`skill-${index}`] = true;
          return true;
        }
        return false;
      });
      
      // If there are validation errors, don't proceed
      if (Object.keys(errors).length > 0 || emptySkills) {
        setValidationErrors(errors);
        
        // Scroll to the first error field
        const firstErrorField = Object.keys(errors)[0];
        
        // Add a small delay to ensure DOM is updated with error states
        setTimeout(() => {
          const element = document.getElementById(firstErrorField);
          if (element) {
            // Make sure to scroll with enough offset to account for sticky header
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 100);
        
        // Show toast with error message
        toast.error("Please fill in all required fields before proceeding", {
          duration: 3000,
        });
        
        return;
      }
    }
    
    // Step 3 validations for projects
    if (currentStep === 3) {
      const errors: Record<string, boolean> = {};
      let hasErrors = false;
      
      // Check each project for required fields
      portfolioData.projects.forEach((project, index) => {
        if (!project.name.trim()) {
          errors[`project-${index}-name`] = true;
          hasErrors = true;
        }
        
        if (!project.description.trim()) {
          errors[`project-${index}-description`] = true;
          hasErrors = true;
        }
        
        if (!project.image) {
          errors[`project-${index}-image`] = true;
          hasErrors = true;
        }
      });
      
      // If there are validation errors, don't proceed
      if (hasErrors) {
        setValidationErrors(errors);
        
        // Find the first error field
        const firstErrorKey = Object.keys(errors)[0];
        const errorParts = firstErrorKey.split('-');
        const projectIndex = errorParts[1];
        const fieldType = errorParts[2];
        
        // Use a timeout to ensure React has updated the DOM with error states
        setTimeout(() => {
          let scrollTarget = null;
          
          // First try direct element ID
          const directElement = document.getElementById(firstErrorKey);
          if (directElement) {
            scrollTarget = directElement;
          } 
          // For image uploads, try the upload container
          else if (fieldType === 'image') {
            // Try to find the image upload container
            const imageContainer = document.querySelector(`[data-image-upload-container="project-${projectIndex}"]`);
            if (imageContainer) {
              scrollTarget = imageContainer;
            }
          }
          
          // If we still don't have a target, try the project container
          if (!scrollTarget) {
            const projectContainer = document.getElementById(`project-container-${projectIndex}`);
            if (projectContainer) {
              scrollTarget = projectContainer;
            }
          }
          
          // Last resort - try any element with project index in class name
          if (!scrollTarget) {
            const projectElements = document.querySelectorAll(`.project-container`);
            if (projectElements && projectElements.length > parseInt(projectIndex)) {
              scrollTarget = projectElements[parseInt(projectIndex)];
            }
          }
          
          // Scroll to the target element if found
          if (scrollTarget) {
            console.log("Scrolling to:", scrollTarget);
            scrollTarget.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
            
            // Try to focus if it's an input
            if (scrollTarget.tagName === 'INPUT' || scrollTarget.tagName === 'TEXTAREA') {
              try {
                (scrollTarget as HTMLInputElement | HTMLTextAreaElement).focus();
              } catch (e) {
                console.log("Could not focus element", e);
              }
            }
            
            // Highlight the element temporarily to make it more visible
            scrollTarget.classList.add('ring-2', 'ring-red-400');
            setTimeout(() => {
              scrollTarget.classList.remove('ring-2', 'ring-red-400');
            }, 2000);
          }
        }, 100);
        
        // Show toast with error message
        toast.error("Please fill in all required fields for each project", {
          duration: 3000,
        });
        
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form submission
      handleSubmitPortfolio();
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
              const newFile = new (File as unknown as {
                new(bits: BlobPart[], name: string, options?: FilePropertyBag): File;
              })([blob], file.name, {
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
  const handleFileUpload = async (file: File, field: 'cv' | 'projectImage' | 'profilePicture' | 'projectReport', projectIndex?: number) => {
    // Compress images to reduce size
    let processedFile = file;
    
    if (field !== 'cv' && field !== 'projectReport' && file.type.startsWith('image/')) {
      try {
        const maxSizeMB = 2; // 2MB max for images
        if (file.size > maxSizeMB * 1024 * 1024) {
          processedFile = await compressImage(file, maxSizeMB);
        }
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Failed to compress image. Using original file.');
        processedFile = file;
      }
    }
    
    if (field === 'cv') {
      // Validate PDF size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('CV file is too large. Maximum size is 10MB.');
        return;
      }
      
      setPortfolioData({
        ...portfolioData,
        cv: processedFile
      });
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
    } else if (field === 'projectReport' && typeof projectIndex === 'number') {
      // Validate report size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Report file is too large. Maximum size is 10MB.');
        return;
      }
      
      const newProjects = [...portfolioData.projects];
      newProjects[projectIndex] = { 
        ...newProjects[projectIndex], 
        reportFile: processedFile 
      };
      setPortfolioData({
        ...portfolioData,
        projects: newProjects
      });
    } else if (field === 'profilePicture') {
      setPortfolioData({
        ...portfolioData,
        profilePicture: processedFile
      });
    }
  }

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
        setSelectedTemplate("template1");
      }
      
      // Create a copy with all the necessary data
      const portfolioToCreate = {
        ...portfolioData,
        templateId: selectedTemplate || "template1" // Default to template1
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
        title: "AI Engineer",
        smallIntro: "I'm a skilled AI Engineer with a passion for developing innovative solutions.",
        about: "Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing. I have experience building and deploying AI models that solve real-world problems and drive business value. My approach combines technical excellence with a strong focus on practical applications and ethical considerations.",
        fullName: "John Doe",
        email: "johndoe@gmail.com",
        phone: "+34 607980731",
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
        projectCount: 4,
        projects: [
          { 
            name: "NBA Dashboard", 
            description: "Developed an Excel file containing various data and statistics from the 2015-2017 NBA seasons. The dashboard provides insights on players, teams, and games, including player stats, team performance metrics, and game-by-game analysis. Users can filter and sort the data to identify trends and patterns in player performance across different seasons.", 
            image: null,
            technologies: ["Excel", "Data Analysis", "Sports Analytics", "Dashboard"]
          },
          { 
            name: "AI Recommendation System", 
            description: "Developed a sophisticated recommendation engine using collaborative filtering and content-based algorithms to provide personalized suggestions to users, resulting in a 35% increase in user engagement.", 
            image: null,
            technologies: ["Python", "Machine Learning", "Collaborative Filtering", "User Engagement"]
          },
          { 
            name: "Natural Language Processing Tool", 
            description: "Created an NLP tool that analyzes customer feedback across multiple channels, automatically categorizing issues and identifying sentiment to help businesses understand customer needs better.", 
            image: null,
            technologies: ["NLP", "Python", "Sentiment Analysis", "Text Classification"] 
          },
          { 
            name: "Computer Vision Project", 
            description: "Built a computer vision system for object detection and classification in real-time video streams, achieving 94% accuracy in identifying specific items in complex environments.", 
            image: null,
            technologies: ["Computer Vision", "TensorFlow", "Object Detection", "Real-time Processing"]
          }
        ],
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
          templateId: selectedTemplate || "template1"
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
            title: "AI Engineer",
            smallIntro: "I'm a skilled AI Engineer with a passion for developing innovative solutions.",
            about: "Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing. I have experience building and deploying AI models that solve real-world problems and drive business value. My approach combines technical excellence with a strong focus on practical applications and ethical considerations.",
            fullName: "John Doe",
            email: "johndoe@gmail.com",
            phone: "+34 607980731",
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
            projectCount: 4,
            projects: [
              { 
                name: "NBA Dashboard", 
                description: "Developed an Excel file containing various data and statistics from the 2015-2017 NBA seasons. The dashboard provides insights on players, teams, and games, including player stats, team performance metrics, and game-by-game analysis. Users can filter and sort the data to identify trends and patterns in player performance across different seasons.", 
                image: null,
                technologies: ["Excel", "Data Analysis", "Sports Analytics", "Dashboard"]
              },
              { 
                name: "AI Recommendation System", 
                description: "Developed a sophisticated recommendation engine using collaborative filtering and content-based algorithms to provide personalized suggestions to users, resulting in a 35% increase in user engagement.", 
                image: null,
                technologies: ["Python", "Machine Learning", "Collaborative Filtering", "User Engagement"]
              },
              { 
                name: "Natural Language Processing Tool", 
                description: "Created an NLP tool that analyzes customer feedback across multiple channels, automatically categorizing issues and identifying sentiment to help businesses understand customer needs better.", 
                image: null,
                technologies: ["NLP", "Python", "Sentiment Analysis", "Text Classification"] 
              },
              { 
                name: "Computer Vision Project", 
                description: "Built a computer vision system for object detection and classification in real-time video streams, achieving 94% accuracy in identifying specific items in complex environments.", 
                image: null,
                technologies: ["Computer Vision", "TensorFlow", "Object Detection", "Real-time Processing"]
              }
            ],
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

  // Add this after the handleInputChange function
  // Update handleCvToggle to just set if CV is present or not
  const handleCvToggle = (hasCv: boolean) => {
    // Always enable CV as an option, but mark if user has one or not
    setPortfolioData({
      ...portfolioData,
      hasCv,
      // If user doesn't have a CV, clear the file reference
      cv: hasCv ? portfolioData.cv : null,
    });
  };

  const handleAddSkill = () => {
    setPortfolioData({
      ...portfolioData,
      skills: [...portfolioData.skills, { name: "" }]
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
        newProjects.push({ name: "", description: "", image: null, technologies: [] })
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

  // Helper function to determine if a field has an error
  const hasError = (fieldName: string): boolean => {
    return validationErrors[fieldName] === true;
  }

  // CSS class for input fields with errors
  const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50";
  const errorLabelClass = "text-red-500";

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
            className="mt-4 md:mt-0 bg-black hover:bg-gray-800 text-white shadow-md px-6 py-6 h-auto rounded-md transition-all hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Portfolio
          </Button>
        </div>

        <Tabs defaultValue="portfolios" className="w-full">
          <TabsList className="flex space-x-2 bg-white p-1 rounded-lg border border-indigo-100 mb-6 shadow-sm">
            <TabsTrigger 
              value="portfolios" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 transition-all"
            >
              Portfolios
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex-1 py-3 rounded-md data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 transition-all"
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
                      className="bg-black hover:bg-gray-800 text-white shadow-md px-6 py-6 h-auto rounded-md transition-all hover:shadow-lg"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Portfolio
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Portfolio cards - Using our new PortfolioCard component
                portfolios.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    id={portfolio.id}
                    name={portfolio.name}
                    title={portfolio.title}
                    templateId={portfolio.templateId}
                    onDelete={handleDeletePortfolio}
                  />
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
                      <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 h-auto rounded-md shadow-md hover:shadow-lg transition-all hover:scale-105">
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
                    <Button variant="outline" className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-md">
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
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-md">
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
          
          <div className="px-6 pb-3 pt-4 border-b shrink-0">
            <div className="flex justify-between mb-2 text-xs text-gray-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-indigo-100 progress" />
          </div>
          
          <div className="px-6 pt-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 210px)' }}>
            {/* Content for each step */}
            <div className="pb-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="py-4 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
                  
                  {/* Full Name Field - required */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className={hasError('fullName') ? errorLabelClass : ""}>
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      placeholder="Pablos Tselioudis" 
                      value={portfolioData.fullName}
                      onChange={handleInputChange}
                      className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                        hasError('fullName') ? errorInputClass : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500">Your complete name as it will appear on your portfolio.</p>
                  </div>
                  
                  {/* Profile Picture Upload - required */}
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture" className={hasError('profilePicture') ? errorLabelClass : ""}>
                      Profile Picture <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center ${
                        hasError('profilePicture') 
                          ? "bg-red-50 border border-red-300" 
                          : "bg-indigo-50 border border-indigo-100"
                      }`}>
                        {portfolioData.profilePicture ? (
                          <img 
                            src={URL.createObjectURL(portfolioData.profilePicture)} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className={`w-12 h-12 ${hasError('profilePicture') ? "text-red-300" : "text-indigo-300"}`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div 
                          id="profile-picture-container"
                          data-upload-container="profilePicture"
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            hasError('profilePicture') 
                              ? "border-red-300 hover:border-red-500 bg-red-50" 
                              : "border-indigo-100 hover:border-indigo-300"
                          }`}
                        >
                          {portfolioData.profilePicture ? (
                            <div className="space-y-2">
                              <div className="text-sm text-indigo-600">
                                Selected image: {portfolioData.profilePicture.name}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-indigo-200 text-xs rounded-md"
                                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                              >
                                Change Image
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className={`h-8 w-8 mx-auto mb-2 ${hasError('profilePicture') ? "text-red-300" : "text-indigo-300"}`} />
                              <div className="text-sm text-gray-600 mb-2">
                                Upload a profile picture
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-indigo-200 text-xs rounded-md"
                                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                              >
                                Select Image
                              </Button>
                            </>
                          )}
                          <input 
                            type="file" 
                            id="profile-picture-upload"
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], 'profilePicture');
                                // Clear the validation error for this field
                                setValidationErrors({...validationErrors, profilePicture: false});
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Recommended: Square image (1:1 ratio), max 2MB. Formats: JPG, PNG.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className={hasError('name') ? errorLabelClass : ""}>
                      Portfolio Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="My Professional Portfolio" 
                      value={portfolioData.name}
                      onChange={handleInputChange}
                      className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                        hasError('name') ? errorInputClass : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500">This name is only used to identify your portfolio in your dashboard. It will NOT appear on the actual portfolio.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className={hasError('title') ? errorLabelClass : ""}>
                      Professional Title <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Frontend Developer" 
                      value={portfolioData.title}
                      onChange={handleInputChange}
                      className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                        hasError('title') ? errorInputClass : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500">Your job title or professional focus.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smallIntro" className={hasError('smallIntro') ? errorLabelClass : ""}>
                      Small Intro <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="smallIntro" 
                      name="smallIntro" 
                      placeholder="A brief one-sentence introduction" 
                      value={portfolioData.smallIntro}
                      onChange={handleInputChange}
                      className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                        hasError('smallIntro') ? errorInputClass : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500">A short introduction for the homepage header (1 sentence).</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about" className={hasError('about') ? errorLabelClass : ""}>
                      About Me <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                      id="about" 
                      name="about" 
                      placeholder="I'm a passionate developer with 5 years of experience..." 
                      value={portfolioData.about}
                      onChange={handleInputChange}
                      className={`min-h-[120px] border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                        hasError('about') ? errorInputClass : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500">A brief introduction about yourself.</p>
                  </div>
                </div>
              )}
              
              {/* Step 2: CV Upload and Personal Details */}
              {currentStep === 2 && (
                <div className="py-4 space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Resume/CV & Personal Details</h3>
                  
                  {/* Resume Upload Section - Optional */}
                  <div className="space-y-3">
                    <Label className="text-gray-800 font-medium">Resume/CV Upload (Optional)</Label>
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
                        className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-md"
                        onClick={() => document.getElementById('cv-upload')?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Accepted formats: PDF, DOC, DOCX, max 5MB.</p>
                    <p className="text-xs text-indigo-600">Visitors to your portfolio will be able to download your CV.</p>
                  </div>
                  
                  {/* Personal Information Section */}
                  <div className="space-y-3">
                    <Label className="text-gray-800 font-medium">Personal Information</Label>
                    <div className="space-y-3 p-3 rounded-lg border border-indigo-100 bg-indigo-50/30">
                      <div className="space-y-2">
                        <Label htmlFor="email" className={hasError('email') ? errorLabelClass : ""}>
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={portfolioData.email || ""}
                          onChange={handleInputChange}
                          placeholder="email@example.com" 
                          className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                            hasError('email') ? errorInputClass : ""
                          }`}
                          required
                        />
                        <p className="text-xs text-gray-500">Your contact email for professional inquiries.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className={hasError('phone') ? errorLabelClass : ""}>
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={portfolioData.phone || ""}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567" 
                          className={`border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 ${
                            hasError('phone') ? errorInputClass : ""
                          }`}
                          required
                        />
                        <p className="text-xs text-gray-500">Your contact phone number.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills Section - At least 3 required */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className={`text-gray-800 ${hasError('skills') ? errorLabelClass : ""}`}>
                        Skills <span className="text-red-500">*</span> <span className="text-xs font-normal">(at least 3 required)</span>
                      </Label>
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
                      <p className={`text-sm italic ${hasError('skills') ? "text-red-500" : "text-gray-500"}`}>
                        No skills added yet. Click "Add Skill" to begin.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {portfolioData.skills.map((skill, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input 
                              id={`skill-${index}`}
                              value={skill.name} 
                              onChange={(e) => {
                                handleUpdateSkill(index, 'name', e.target.value);
                                // Clear validation error for this field
                                if (e.target.value.trim()) {
                                  const newErrors = {...validationErrors};
                                  delete newErrors[`skill-${index}`];
                                  setValidationErrors(newErrors);
                                }
                              }}
                              placeholder="e.g. React, JavaScript, UI Design" 
                              className={`flex-1 border-indigo-100 ${
                                hasError(`skill-${index}`) ? errorInputClass : ""
                              }`}
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveSkill(index)}
                              disabled={portfolioData.skills.length <= 3} // Prevent removing if only 3 skills left
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {hasError('skills') && (
                      <p className="text-xs text-red-500">Please add at least 3 skills.</p>
                    )}
                  </div>
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
                      <div 
                        key={index} 
                        data-project-index={index}
                        id={`project-container-${index}`}
                        className="project-container p-4 border border-indigo-100 rounded-lg space-y-4 bg-indigo-50/30"
                      >
                        <h4 className="font-medium text-indigo-600 flex justify-between">
                          Project {index + 1}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label 
                              htmlFor={`project-${index}-name`}
                              className={hasError(`project-${index}-name`) ? errorLabelClass : ""}
                            >
                              Project Name <span className="text-red-500">*</span>
                            </Label>
                            <Input 
                              id={`project-${index}-name`}
                              value={project.name}
                              onChange={(e) => {
                                handleUpdateProject(index, 'name', e.target.value);
                                // Clear validation error
                                if (e.target.value.trim()) {
                                  const newErrors = {...validationErrors};
                                  delete newErrors[`project-${index}-name`];
                                  setValidationErrors(newErrors);
                                }
                              }}
                              placeholder="My Awesome Project"
                              className={`border-indigo-100 ${
                                hasError(`project-${index}-name`) ? errorInputClass : ""
                              }`}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label 
                              htmlFor={`project-${index}-description`}
                              className={hasError(`project-${index}-description`) ? errorLabelClass : ""}
                            >
                              Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea 
                              id={`project-${index}-description`}
                              value={project.description}
                              onChange={(e) => {
                                handleUpdateProject(index, 'description', e.target.value);
                                // Clear validation error
                                if (e.target.value.trim()) {
                                  const newErrors = {...validationErrors};
                                  delete newErrors[`project-${index}-description`];
                                  setValidationErrors(newErrors);
                                }
                              }}
                              placeholder="Describe what this project is about, technologies used, and your role"
                              className={`min-h-[80px] border-indigo-100 ${
                                hasError(`project-${index}-description`) ? errorInputClass : ""
                              }`}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label 
                              htmlFor={`project-${index}-image`}
                              className={hasError(`project-${index}-image`) ? errorLabelClass : ""}
                            >
                              Project Image <span className="text-red-500">*</span>
                            </Label>
                            <div 
                              data-image-upload-container={`project-${index}`}
                              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                hasError(`project-${index}-image`) 
                                  ? "border-red-300 hover:border-red-500 bg-red-50" 
                                  : "border-indigo-100 hover:border-indigo-300"
                              }`}
                            >
                              {project.image ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-indigo-600">
                                    Selected image: {project.image.name}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs rounded-md"
                                    onClick={() => document.getElementById(`project-${index}-image-upload`)?.click()}
                                  >
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Upload className={`h-8 w-8 mx-auto mb-2 ${
                                    hasError(`project-${index}-image`) ? "text-red-300" : "text-indigo-300"
                                  }`} />
                                  <div className="text-sm text-gray-600 mb-2">
                                    Upload a screenshot or image of your project
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs rounded-md"
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
                                    handleFileUpload(e.target.files[0], 'projectImage', index);
                                    // Clear validation error
                                    const newErrors = {...validationErrors};
                                    delete newErrors[`project-${index}-image`];
                                    setValidationErrors(newErrors);
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">Recommended size: 1200x800px, max 2MB. Formats: JPG, PNG.</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`project-${index}-github`}>
                              GitHub Repository URL <span className="text-xs text-gray-500 font-normal">(optional)</span>
                            </Label>
                            <Input 
                              id={`project-${index}-github`}
                              value={project.githubUrl || ''}
                              onChange={(e) => handleUpdateProject(index, 'githubUrl', e.target.value)}
                              placeholder="https://github.com/username/repository"
                              className="border-indigo-100"
                            />
                            <p className="text-xs text-gray-500">Link to your GitHub repository</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`project-${index}-report`}>
                              Project Report <span className="text-xs text-gray-500 font-normal">(optional)</span>
                            </Label>
                            <div className="border-2 border-dashed border-indigo-100 rounded-lg p-4 text-center hover:border-indigo-300 transition-colors">
                              {project.reportFile ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-indigo-600">
                                    Selected file: {project.reportFile.name}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs rounded-md"
                                    onClick={() => document.getElementById(`project-${index}-report-upload`)?.click()}
                                  >
                                    Change Report
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <File className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                                  <div className="text-sm text-gray-600 mb-2">
                                    Upload a report or documentation for your project
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-indigo-200 text-xs rounded-md"
                                    onClick={() => document.getElementById(`project-${index}-report-upload`)?.click()}
                                  >
                                    Select Report
                                  </Button>
                                </>
                              )}
                              <input 
                                type="file" 
                                id={`project-${index}-report-upload`}
                                accept=".pdf,.doc,.docx,.ppt,.pptx" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(e.target.files[0], 'projectReport', index)
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">Upload project documentation (PDF, Word, PowerPoint). Max 10MB.</p>
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
                        selectedTemplate === "template1" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template1")}
                      onMouseEnter={() => setHoveredTemplate("template1")}
                      onMouseLeave={() => setHoveredTemplate(null)}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template1/JohnDoe2024.png"
                            alt="Template 1 Preview" 
                            className={`w-full h-full object-cover transition-opacity duration-300 ${hoveredTemplate === "template1" ? 'opacity-0' : 'opacity-100'}`}
                          />
                          <video 
                            ref={(el) => {
                              templateVideoRefs.current.template1 = el;
                            }}
                            src="/videos/Temp1.webm"
                            muted
                            loop
                            playsInline
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hoveredTemplate === "template1" ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 1</div>
                        <div className="text-xs text-gray-500">Modern Minimal</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "template2" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template2")}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template2/thumbnail_dash.svg" 
                            alt="Template 2 Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 2</div>
                        <div className="text-xs text-gray-500">Professional Dark with Device Displays</div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "template3" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template3")}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template3/thumbnail_dash.svg" 
                            alt="Template 3 Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 3</div>
                        <div className="text-xs text-gray-500">Creative Bold</div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "template4" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template4")}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template4/thumbnail_dash.svg" 
                            alt="Template 4 Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 4</div>
                        <div className="text-xs text-gray-500">Minimal Portfolio</div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "template5" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template5")}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template5/thumbnail_dash.svg" 
                            alt="Template 5 Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 5</div>
                        <div className="text-xs text-gray-500">Visual Portfolio</div>
                      </div>
                    </div>

                    <div 
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === "template6" 
                          ? "border-indigo-500 ring-2 ring-indigo-200" 
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => handleTemplateSelect("template6")}
                    >
                      <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src="/templates/template6/thumbnail_dash.svg" 
                            alt="Template 6 Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white text-center">
                        <div className="font-medium text-gray-800">Template 6</div>
                        <div className="text-xs text-gray-500">Glass Morphism</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                      Each template features a single-page design with progressive disclosure for a smooth user experience.
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
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-md"
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
              className="bg-black hover:bg-gray-800 text-white px-6 rounded-md"
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


