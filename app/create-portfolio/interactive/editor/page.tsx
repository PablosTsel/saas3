"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Check, Save, Edit, Plus, X, Trash, Image, Upload, File } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createPortfolio } from "@/lib/firebase"

// Initial placeholder data
const defaultPortfolioData = {
  name: "My Portfolio",
  title: "Software Developer",
  smallIntro: "I create intuitive and powerful digital experiences",
  about: "I'm a passionate developer with a focus on creating user-friendly and performant web applications. My approach combines technical excellence with a strong understanding of user experience principles.",
  fullName: "Your Name",
  email: "youremail@example.com",
  phone: "+1 (123) 456-7890",
  githubProfile: "https://github.com/yourusername",
  profilePicture: null,
  hasCv: false,
  cv: null,
  skills: [
    { name: "JavaScript", level: "95%" },
    { name: "React", level: "90%" },
    { name: "TypeScript", level: "85%" }
  ],
  projects: [
    { 
      name: "Project One", 
      description: "A brief description of your first project. Explain the problem it solves and technologies used.", 
      image: null,
      technologies: ["React", "TypeScript", "Tailwind CSS"]
    },
    { 
      name: "Project Two", 
      description: "A brief description of your second project. Highlight your role and the impact it made.", 
      image: null,
      technologies: ["Next.js", "Firebase", "Tailwind CSS"]
    },
    { 
      name: "Project Three", 
      description: "A brief description of your third project. Mention challenging aspects and how you overcame them.", 
      image: null,
      technologies: ["Node.js", "Express", "MongoDB"]
    }
  ],
  experience: [],
  education: []
};

// Define types for our portfolio data
interface Skill {
  name: string;
  level?: string;
}

interface Project {
  name: string;
  description: string;
  image: File | null;
  technologies: string[];
  githubUrl?: string;
  reportFile?: File | null;
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

interface PortfolioData {
  name: string;
  title: string;
  smallIntro: string;
  about: string;
  fullName: string;
  email: string;
  phone: string;
  githubProfile?: string;
  profilePicture: File | null;
  cv: File | null;
  hasCv: boolean;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  templateId: string;
}

export default function InteractiveEditor() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template") || "template1"
  const isPrefilled = searchParams.get("prefilled") === "true"
  
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    ...defaultPortfolioData,
    templateId
  })
  
  const [currentEditField, setCurrentEditField] = useState<string | null>(null)
  const [fieldValue, setFieldValue] = useState<string>("")
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [iframeHeight, setIframeHeight] = useState<number>(0)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Load portfolio data when component mounts
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast.error("You need to be logged in to create a portfolio")
      router.push("/auth/login")
      return
    }
    
    // Load pre-filled portfolio data from sessionStorage if available
    if (isPrefilled) {
      try {
        const prefilledData = sessionStorage.getItem('prefilledPortfolioData')
        if (prefilledData) {
          const parsedData = JSON.parse(prefilledData)
          setPortfolioData({
            ...parsedData,
            // Ensure templateId is set correctly from URL params
            templateId
          })
          
          // Clear the session storage to prevent it from being used again
          // sessionStorage.removeItem('prefilledPortfolioData')
        }
      } catch (error) {
        console.error('Error loading pre-filled portfolio data:', error)
        toast.error('Failed to load template data. Using default values instead.')
      }
    }
    
    // Set iframe height to window height
    setIframeHeight(window.innerHeight - 64) // Subtract header height
    
    const handleResize = () => {
      setIframeHeight(window.innerHeight - 64)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [user, router, templateId, isPrefilled])
  
  // Handle iframe messaging
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Make sure the message is from our iframe
      if (event.origin !== window.location.origin) return
      
      const { type, field, index, value } = event.data
      
      if (type === 'requestInitialData') {
        // The iframe is requesting initial data, let's send it
        const iframe = iframeRef.current
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'update',
            data: portfolioData
          }, '*')
        }
      } else if (type === 'edit') {
        setCurrentEditField(field)
        setCurrentIndex(index !== undefined ? index : null)
        
        // Set the current value based on provided value or from portfolioData
        if (value) {
          setFieldValue(value)
        } else if (index !== undefined) {
          // This is an array field (skills, projects, etc.)
          if (field === 'skill') {
            setFieldValue(portfolioData.skills[index].name)
          } else if (field === 'project-name') {
            setFieldValue(portfolioData.projects[index].name)
          } else if (field === 'project-description') {
            setFieldValue(portfolioData.projects[index].description)
          }
        } else {
          // This is a regular field
          setFieldValue(portfolioData[field as keyof typeof portfolioData] as string)
        }
      } else if (type === 'upload') {
        // Trigger file upload for profile picture, CV, or project image
        document.getElementById(`${field}-upload${index !== undefined ? '-' + index : ''}`)?.click()
      } else if (type === 'add') {
        // Add a new item (skill, project, etc.)
        if (field === 'skill') {
          const newSkills = [...portfolioData.skills, { name: "New Skill" }]
          setPortfolioData({
            ...portfolioData,
            skills: newSkills
          })
        } else if (field === 'project') {
          const newProjects = [...portfolioData.projects, { 
            name: "New Project", 
            description: "Describe your project here", 
            image: null,
            technologies: ["Technology 1", "Technology 2"] 
          }]
          setPortfolioData({
            ...portfolioData,
            projects: newProjects
          })
        }
      } else if (type === 'remove') {
        // Remove an item
        if (field === 'skill' && index !== undefined) {
          const newSkills = [...portfolioData.skills]
          newSkills.splice(index, 1)
          setPortfolioData({
            ...portfolioData,
            skills: newSkills
          })
        } else if (field === 'project' && index !== undefined) {
          const newProjects = [...portfolioData.projects]
          newProjects.splice(index, 1)
          setPortfolioData({
            ...portfolioData,
            projects: newProjects
          })
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [portfolioData])
  
  // Update iframe content when portfolioData changes
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentWindow) return
    
    // If we already have a generated preview, no need to generate again
    // unless portfolioData has changed
    if (iframe.src.includes('portfolios/preview-')) return

    // Create a temporary portfolio when the component mounts
    const generatePreview = async () => {
      try {
        // Create a temporary ID for the preview
        const tempId = `preview-${Math.random().toString(36).substring(2, 15)}`
        
        // Call the portfolio generation API
        const response = await fetch('/api/portfolios/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            portfolioId: tempId,
            portfolioData: {
              ...portfolioData,
              id: tempId
            }
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate preview')
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Set the iframe source to the generated portfolio
          iframe.src = data.url
          
          // Send a message to the iframe with instructions to make elements editable
           setTimeout(() => {
             if (iframe.contentWindow) {
               iframe.contentWindow.postMessage({
                 type: 'makeEditable',
                 data: portfolioData
               }, '*')
             }
           }, 1000) // Give the iframe time to load
         } else {
           throw new Error(data.error || 'Unknown error')
         }
       } catch (error) {
         console.error('Error generating preview:', error)
         toast.error('Failed to generate preview. Using fallback method.')
         
         // Fallback to the old method if the new one fails
         iframe.src = `/api/preview-template?template=${templateId}&editable=true`
         
         // Send updated data to iframe
         setTimeout(() => {
           if (iframe.contentWindow) {
             iframe.contentWindow.postMessage({
               type: 'update',
               data: portfolioData
             }, '*')
           }
         }, 500)
       }
    }
    
    generatePreview()
  }, [portfolioData, templateId])
  
  // Add an event listener to inject editing capabilities into the preview iframe
  useEffect(() => {
    const handleIframeLoad = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
      
      // Create a script element to inject our editing functionality
      const script = iframe.contentDocument.createElement('script');
      script.type = 'text/javascript';
      script.textContent = `
        // Function to make an element editable
        function makeEditable(element, field, index) {
          if (!element) return;
          
          // Add visual editing cue
          element.style.position = 'relative';
          element.style.cursor = 'pointer';
          element.style.transition = 'outline 0.2s ease';
          
          element.addEventListener('mouseover', function() {
            element.style.outline = '2px dashed rgba(99, 102, 241, 0.5)';
          });
          
          element.addEventListener('mouseout', function() {
            element.style.outline = 'none';
          });
          
          element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Send message to parent window
            window.parent.postMessage({
              type: 'edit',
              field: field,
              index: index,
              value: element.textContent
            }, '*');
          });
        }
        
        // Listen for messages from the parent
        window.addEventListener('message', function(event) {
          // Make sure the message is from our parent
          if (event.origin !== window.location.origin) return;
          
          const { type, data } = event.data;
          
          if (type === 'makeEditable') {
            // Find and make elements editable
            // Name/title
            const nameElements = document.querySelectorAll('h1');
            if (nameElements.length > 0) {
              makeEditable(nameElements[0], 'fullName');
            }
            
            // Title/profession
            const titleElements = document.querySelectorAll('h2');
            if (titleElements.length > 0) {
              makeEditable(titleElements[0], 'title');
            }
            
            // Small intro/tagline
            const introElements = document.querySelectorAll('p.intro, .hero-content p, .tagline');
            if (introElements.length > 0) {
              makeEditable(introElements[0], 'smallIntro');
            }
            
            // About section
            const aboutElements = document.querySelectorAll('#about p, .about-text p, .about-content p');
            if (aboutElements.length > 0) {
              makeEditable(aboutElements[0], 'about');
            }
            
            // Email
            const emailElements = document.querySelectorAll('a[href^="mailto:"]');
            if (emailElements.length > 0) {
              makeEditable(emailElements[0], 'email');
            }
            
            // Phone
            const phoneElements = document.querySelectorAll('a[href^="tel:"]');
            if (phoneElements.length > 0) {
              makeEditable(phoneElements[0], 'phone');
            }
            
            // Skills
            const skillElements = document.querySelectorAll('.skill, .skill-tag');
            skillElements.forEach((skill, index) => {
              makeEditable(skill, 'skill', index);
            });
            
            // Projects
            const projectNameElements = document.querySelectorAll('.project h3, .project-name, .project-title');
            projectNameElements.forEach((name, index) => {
              makeEditable(name, 'project-name', index);
            });
            
            const projectDescElements = document.querySelectorAll('.project p, .project-description, .project-desc');
            projectDescElements.forEach((desc, index) => {
              makeEditable(desc, 'project-description', index);
            });
          }
        });
      `;
      
      // Append the script to the iframe document
      iframe.contentDocument.body.appendChild(script);
    };
    
    // Add event listener for iframe load
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }
    
    // Clean up
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);
  
  const handleSaveField = () => {
    if (!currentEditField) return
    
    // Store the old data to detect changes
    const oldPortfolioData = { ...portfolioData };
    
    // Update the data
    if (currentIndex !== null) {
      // Update array item (skill, project, etc.)
      if (currentEditField === 'skill') {
        const newSkills = [...portfolioData.skills]
        newSkills[currentIndex].name = fieldValue
        setPortfolioData({
          ...portfolioData,
          skills: newSkills
        })
      } else if (currentEditField === 'project-name') {
        const newProjects = [...portfolioData.projects]
        newProjects[currentIndex].name = fieldValue
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        })
      } else if (currentEditField === 'project-description') {
        const newProjects = [...portfolioData.projects]
        newProjects[currentIndex].description = fieldValue
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        })
      }
    } else {
      // Update regular field
      setPortfolioData({
        ...portfolioData,
        [currentEditField]: fieldValue
      })
    }
    
    // Reset the edit state
    setCurrentEditField(null)
    setCurrentIndex(null)
    
    // Show a toast notification
    toast.success('Changes saved successfully');
    
    // Force regeneration of the preview by resetting the iframe src
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = 'about:blank'; // Clear the iframe
    }
  }
  
  const handleCancel = () => {
    setCurrentEditField(null)
    setCurrentIndex(null)
  }
  
  // Add an uploadFile function to handle file uploads
  const handleFileUpload = async (file: File, field: 'cv' | 'projectImage' | 'profilePicture', projectIndex?: number) => {
    setIsUploading(true)
    
    try {
      if (field === 'profilePicture') {
        setPortfolioData({
          ...portfolioData,
          profilePicture: file
        })
      } else if (field === 'cv') {
        setPortfolioData({
          ...portfolioData,
          cv: file,
          hasCv: true
        })
      } else if (field === 'projectImage' && typeof projectIndex === 'number') {
        const newProjects = [...portfolioData.projects]
        newProjects[projectIndex] = { 
          ...newProjects[projectIndex], 
          image: file 
        }
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        })
      }
      
      toast.success(`${field === 'cv' ? 'CV' : field === 'profilePicture' ? 'Profile picture' : 'Project image'} uploaded successfully`)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSavePortfolio = async () => {
    if (!user) {
      toast.error("You need to be logged in to save your portfolio")
      return
    }
    
    setIsSaving(true)
    
    try {
      // Create the portfolio
      const result = await createPortfolio(user.uid, portfolioData)
      
      if (!result.success) {
        toast.error(result.error || "Failed to create portfolio")
        setIsSaving(false)
        return
      }
      
      // Portfolio created successfully
      toast.success("Portfolio created successfully!")
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error creating portfolio:", error)
      toast.error(error.message || "An error occurred while creating your portfolio")
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm h-16">
        <div className="container mx-auto flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800 mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Interactive Editor <span className="text-indigo-500">•</span> {portfolioData.name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPortfolioData({
                ...defaultPortfolioData,
                templateId
              })}
              className="border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800"
            >
              Reset
            </Button>
            
            <Button 
              onClick={handleSavePortfolio}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Portfolio
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Iframe Container */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`/api/preview-template?template=${templateId}&editable=true`}
          className="w-full h-full border-0"
          style={{ height: `${iframeHeight}px` }}
        />
      </div>
      
      {/* File Upload Inputs (hidden) */}
      <input 
        type="file" 
        id="profilePicture-upload" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0], 'profilePicture')
          }
        }}
      />
      
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
      
      {portfolioData.projects.map((_, index) => (
        <input 
          key={`project-image-${index}`}
          type="file" 
          id={`projectImage-upload-${index}`} 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0], 'projectImage', index)
            }
          }}
        />
      ))}
      
      {/* Edit Dialog */}
      <Dialog open={currentEditField !== null} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentEditField === 'fullName' && 'Edit Your Name'}
              {currentEditField === 'title' && 'Edit Your Professional Title'}
              {currentEditField === 'smallIntro' && 'Edit Your Short Introduction'}
              {currentEditField === 'about' && 'Edit About Me'}
              {currentEditField === 'email' && 'Edit Email Address'}
              {currentEditField === 'phone' && 'Edit Phone Number'}
              {currentEditField === 'githubProfile' && 'Edit GitHub Profile URL'}
              {currentEditField === 'skill' && 'Edit Skill'}
              {currentEditField === 'project-name' && 'Edit Project Name'}
              {currentEditField === 'project-description' && 'Edit Project Description'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {currentEditField === 'about' || currentEditField === 'project-description' ? (
              <Textarea
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                placeholder={`Enter your ${currentEditField === 'about' ? 'about me text' : 'project description'}`}
                className="min-h-[150px]"
              />
            ) : (
              <Input
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                placeholder={`Enter your ${currentEditField}`}
              />
            )}
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSaveField}>
              <Check className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 