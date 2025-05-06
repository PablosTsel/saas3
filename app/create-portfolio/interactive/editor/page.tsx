"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
  imageUrl?: string; // URL for the uploaded image
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
  profilePictureUrl?: string; // URL for the uploaded profile picture
  cv: File | null;
  cvUrl?: string; // URL for the uploaded CV
  hasCv: boolean;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  templateId: string;
}

// Search Params wrapper component
function ClientSearchParams() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "template1";
  const isPrefilled = searchParams.get("prefilled") === "true";
  
  return { templateId, isPrefilled };
}

export default function InteractiveEditor() {
  const { user } = useAuth()
  const router = useRouter()
  
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <InteractiveEditorContent user={user} router={router} />
    </Suspense>
  )
}

// Main content component
function InteractiveEditorContent({ 
  user, 
  router 
}: { 
  user: any; 
  router: any;
}) {
  // Use the client component to access searchParams safely
  const { templateId, isPrefilled } = ClientSearchParams();
  
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewURL, setPreviewURL] = useState<string | null>(null)
  
  // State for prompting portfolio name when missing
  const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean>(false)
  const [tempPortfolioName, setTempPortfolioName] = useState<string>("")
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const profilePictureInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const projectImageInputRef = useRef<HTMLInputElement>(null)
  
  // Field mapping for data model
  const fieldMapping: Record<string, keyof PortfolioData> = {
    'fullName': 'fullName',
    'title': 'title',
    'smallIntro': 'smallIntro',
    'about': 'about',
    'email': 'email',
    'phone': 'phone',
    'githubProfile': 'githubProfile'
  };
  
  // Function to generate portfolio preview
  const generatePreview = async () => {
    const iframe = iframeRef.current
    if (!iframe) return
    
    setIframeLoading(true)
    
    try {
      // Use a consistent ID for the preview during editing session instead of creating a new one each time
      // We'll store it in useState so it persists across renders
      if (!previewId) {
        const newPreviewId = `preview-${Math.random().toString(36).substring(2, 15)}`
        setPreviewId(newPreviewId)
      }
      
      console.log(`Generating preview with ID: ${previewId || 'not set yet'} and template: ${templateId}`)
      
      // Call the portfolio generation API
      const response = await fetch('/api/portfolios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          portfolioId: previewId || 'preview-temp',
          portfolioData: {
            ...portfolioData,
            id: previewId || 'preview-temp'
          }
        }),
      })
      
      if (!response.ok) {
        console.error('Generate preview response not OK:', await response.text())
        throw new Error(`Failed to generate preview: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Generate preview response:', data)
      
      if (data.success) {
        let iframeSrc: string | null = null;
        if (data.url) {
          iframeSrc = data.url;
        } else if (data.htmlContent) {
          // Create an object URL from the returned HTML content
          const blob = new Blob([data.htmlContent], { type: 'text/html' });
          const objectURL = URL.createObjectURL(blob);
          iframeSrc = objectURL;
          // Revoke previous object URL to avoid memory leaks
          if (previewURL) {
            URL.revokeObjectURL(previewURL);
          }
          setPreviewURL(objectURL);
        }
        
        if (iframeSrc) {
          console.log(`Setting iframe src to: ${iframeSrc}`);
          iframe.src = iframeSrc;
        } else {
          console.error('No URL or htmlContent returned from the API');
          throw new Error('No valid preview content returned');
        }
        
        // Send a message to the iframe with instructions to make elements editable
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'makeEditable',
              data: portfolioData
            }, '*');
          }
        }, 1000);
        
        return; // success, exit function
      } else {
        // After 3 failed attempts, show error and stop
        toast.error('Failed to generate preview. Please refresh or try again later.');
        setIframeLoading(false);
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      
      // If we've tried less than 3 times, retry
      if (loadAttempts < 3) {
        console.log(`Retrying preview generation (attempt ${loadAttempts + 1}/3)...`)
        setLoadAttempts(prev => prev + 1)
        
        // Wait a bit before retrying
        setTimeout(() => {
          // Use a consistent approach that works in both local and production
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('Using direct portfolio URL approach for local development')
            // For local development, this approach works best
            generatePreview()
          } else {
            console.log('Using API template approach for production')
            // For production, use the API approach that's proven to work
            const iframe = iframeRef.current
            if (iframe) {
              iframe.src = `/api/preview-template?template=${templateId}&editable=true`
            }
          }
        }, 1000)
      } else {
        // After 3 failed attempts, use the backup method
        toast.error('Failed to generate preview using primary method. Using backup approach.')
        
        // Fallback to the direct template API approach
        if (iframe) {
          iframe.src = `/api/preview-template?template=${templateId}&editable=true`
          
          // Send updated data to iframe after it loads
          iframe.onload = () => {
            setIframeLoading(false)
            if (iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'update',
                data: portfolioData
              }, '*')
            }
          }
        }
      }
    }
  }

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
  
  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is coming from the same domain
      if (event.origin !== window.location.origin) return;

      const { type, field, index, value } = event.data;
      console.log('Received message:', event.data);

      if (type === 'requestInitialData') {
        // Send the current portfolio data to the iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'initialData',
            data: portfolioData
          }, window.location.origin);
        }
      } else if (type === 'edit') {
        // Set the current field being edited
        setCurrentEditField(field);
        
        // Determine the value to edit
        let editValue = '';
        
        if (typeof index === 'number') {
          setCurrentIndex(index);
          // Handle array items
          if (field === 'skill' && portfolioData.skills[index]) {
            editValue = portfolioData.skills[index].name || '';
          } else if (field === 'project-name' && portfolioData.projects[index]) {
            editValue = portfolioData.projects[index].name || '';
          } else if (field === 'project-description' && portfolioData.projects[index]) {
            editValue = portfolioData.projects[index].description || '';
          }
        } else {
          setCurrentIndex(null);
          // Handle regular fields
          if (field === 'fullName') {
            editValue = portfolioData.fullName || '';
          } else if (field === 'title') {
            editValue = portfolioData.title || '';
          } else if (field === 'smallIntro') {
            editValue = portfolioData.smallIntro || '';
          } else if (field === 'about') {
            editValue = portfolioData.about || '';
          } else if (field === 'email') {
            editValue = portfolioData.email || '';
          } else if (field === 'phone') {
            editValue = portfolioData.phone || '';
          } else if (field === 'githubProfile') {
            editValue = portfolioData.githubProfile || '';
          }
        }
        
        setFieldValue(editValue);
        
        // Open the edit dialog
        setIsEditDialogOpen(true);
      } else if (type === 'upload') {
        // Trigger file upload for the field
        if (field === 'profilePicture') {
          profilePictureInputRef.current?.click();
        } else if (field === 'projectImage' && typeof index === 'number') {
          setCurrentProjectIndex(index);
          projectImageInputRef.current?.click();
        } else if (field === 'cv') {
          cvInputRef.current?.click();
        }
      } else if (type === 'add') {
        // Add a new item based on field type
        if (field === 'skill') {
          const newSkills = [...portfolioData.skills, { name: 'New Skill' }];
          setPortfolioData({...portfolioData, skills: newSkills});
          
          // Regenerate preview
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            // Instead of setting to about:blank, just update the existing iframe
            iframe.contentWindow.postMessage({
              type: 'update',
              data: {...portfolioData, skills: newSkills}
            }, window.location.origin);
          }
        } else if (field === 'project') {
          const newProjects = [...portfolioData.projects, {
            name: 'New Project',
            description: 'Project description',
            image: null,
            technologies: []
          }];
          setPortfolioData({...portfolioData, projects: newProjects});
          
          // Regenerate preview
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            // Instead of setting to about:blank, just update the existing iframe
            iframe.contentWindow.postMessage({
              type: 'update',
              data: {...portfolioData, projects: newProjects}
            }, window.location.origin);
          }
        }
      } else if (type === 'remove') {
        // Remove an item based on field type and index
        if (field === 'skill' && typeof index === 'number') {
          const newSkills = [...portfolioData.skills];
          newSkills.splice(index, 1);
          setPortfolioData({...portfolioData, skills: newSkills});
          
          // Regenerate preview
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            // Instead of setting to about:blank, just update the existing iframe
            iframe.contentWindow.postMessage({
              type: 'update',
              data: {...portfolioData, skills: newSkills}
            }, window.location.origin);
          }
        } else if (field === 'project' && typeof index === 'number') {
          const newProjects = [...portfolioData.projects];
          newProjects.splice(index, 1);
          setPortfolioData({...portfolioData, projects: newProjects});
          
          // Regenerate preview
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            // Instead of setting to about:blank, just update the existing iframe
            iframe.contentWindow.postMessage({
              type: 'update',
              data: {...portfolioData, projects: newProjects}
            }, window.location.origin);
          }
        }
      }
    };
    
    // Add the message event listener to the window, not the iframe
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [portfolioData]);
  
  // Update iframe content when portfolioData changes or when component mounts
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    console.log("Generating preview with template ID:", templateId);
    // Generate preview when component mounts or data changes
    generatePreview();
  }, [portfolioData, templateId]);
  
  // Initial load - generate preview when component first mounts
  useEffect(() => {
    console.log("Component mounted, initializing preview with template:", templateId);
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Add a loading state for the iframe
  const [iframeLoading, setIframeLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Handle iframe loading state
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const handleLoad = () => {
      console.log("Iframe loaded successfully");
      setIframeLoading(false);
      
      // Give the iframe a moment to fully render before applying editable features
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'makeEditable',
            data: portfolioData
          }, '*');
        }
      }, 300);
    };
    
    const handleError = (e: any) => {
      console.error("Iframe load error:", e);
      
      // If we've tried less than 3 times, retry with increasing delay
      if (loadAttempts < 3) {
        const retryDelay = (loadAttempts + 1) * 1000; // 1s, 2s, 3s
        console.log(`Retrying iframe load in ${retryDelay/1000}s (attempt ${loadAttempts + 1}/3)...`);
        
        setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
          setIframeLoading(true);
          
          // If there's an error, retry with the debug flag
          if (iframe.src !== `/api/preview-template?template=${templateId}&editable=true&debug=true`) {
            iframe.src = `/api/preview-template?template=${templateId}&editable=true&debug=true`;
          } else {
            // If already using debug URL, reload it
            iframe.src = 'about:blank';
            setTimeout(() => {
              iframe.src = `/api/preview-template?template=${templateId}&editable=true&debug=true`;
            }, 100);
          }
        }, retryDelay);
      } else {
        // After 3 attempts, stop trying and show an error state
        setIframeLoading(false);
        toast.error("Failed to load template. Please try a different template or refresh the page.");
      }
    };
    
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [templateId, portfolioData, loadAttempts]);
  
  // Clean up old previews when the component mounts or when previewId changes
  useEffect(() => {
    // Only clean up if we have a previewId
    if (previewId) {
      // Call our cleanup API
      fetch('/api/portfolios/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excludeId: previewId }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log(`Cleanup: ${data.message}`);
          } else {
            console.error('Cleanup failed:', data.error);
          }
        })
        .catch(error => {
          console.error('Error during cleanup:', error);
        });
      
      // Add a cleanup function to run when component unmounts
      return () => {
        // When the component unmounts, we can also clean up the current preview
        // if the user didn't save it
        fetch('/api/portfolios/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ excludeId: null }), // clean everything
        }).catch(error => {
          console.error('Error during final cleanup:', error);
        });
      };
    }
  }, [previewId]);
  
  // Add an event listener to inject editing capabilities into the preview iframe
  useEffect(() => {
    const handleIframeLoad = () => {
      console.log("Iframe loaded, injecting editing capabilities");
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) {
        console.error("Iframe content not accessible", iframe?.src);
        return;
      }
      
      // Create a script element to inject our editing functionality
      const script = document.createElement('script');
      script.type = 'text/javascript';
      
      // Define the script content with string concatenation to avoid nesting issues
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
        
        // Function to make an element trigger image upload with improved styling
        function makeUploadTrigger(element, field, index) {
          if (!element) return;
          
          // Add visual editing cue
          element.style.position = 'relative';
          element.style.cursor = 'pointer';
          element.style.transition = 'outline 0.2s ease';
          
          // Add an upload icon and text overlay
          const overlay = document.createElement('div');
          overlay.style.position = 'absolute';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.display = 'flex';
          overlay.style.flexDirection = 'column';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.backgroundColor = 'rgba(79, 70, 229, 0.4)';
          overlay.style.borderRadius = element.style.borderRadius || '4px';
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.2s ease';
          overlay.style.zIndex = '10';
          
          // For profile picture, use more compact styling
          if (field === 'profilePicture') {
            // Create a more subtle upload hint
            const hintContainer = document.createElement('div');
            hintContainer.style.backgroundColor = 'rgba(79, 70, 229, 0.8)';
            hintContainer.style.color = 'white';
            hintContainer.style.padding = '4px 8px';
            hintContainer.style.borderRadius = '4px';
            hintContainer.style.fontSize = '10px';
            hintContainer.style.fontWeight = 'bold';
            hintContainer.style.maxWidth = '80%';
            hintContainer.style.textAlign = 'center';
            hintContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            hintContainer.textContent = 'Change Photo';
            
            // Camera icon using emoji for simplicity
            const icon = document.createElement('div');
            icon.style.fontSize = '16px';
            icon.style.marginBottom = '2px';
            icon.textContent = '📷';
            
            hintContainer.prepend(icon);
            overlay.appendChild(hintContainer);
          } else {
            // For project images, use the original larger styling
            const icon = document.createElement('div');
            icon.style.width = '24px';
            icon.style.height = '24px';
            icon.style.marginBottom = '8px';
            icon.style.background = 'rgba(255, 255, 255, 0.8)';
            icon.style.borderRadius = '50%';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.textContent = '📤';
            
            const text = document.createElement('div');
            text.textContent = 'Upload Project Image';
            text.style.color = 'white';
            text.style.fontWeight = 'bold';
            text.style.backgroundColor = 'rgba(79, 70, 229, 0.8)';
            text.style.padding = '4px 8px';
            text.style.borderRadius = '4px';
            text.style.maxWidth = '90%';
            text.style.textAlign = 'center';
            
            overlay.appendChild(icon);
            overlay.appendChild(text);
          }
          
          // Handle hover effects
          element.addEventListener('mouseover', function() {
            overlay.style.opacity = '1';
            element.style.outline = '2px dashed rgba(99, 102, 241, 0.8)';
          });
          
          element.addEventListener('mouseout', function() {
            overlay.style.opacity = '0';
            element.style.outline = 'none';
          });
          
          // Special case - if element is empty or has no image child,
          // show a permanent upload hint
          const hasImageContent = 
              element.querySelector('img') || 
              (element.tagName.toLowerCase() === 'img') ||
              (element.style.backgroundImage && element.style.backgroundImage !== 'none') ||
              element.classList.contains('has-profile-picture'); // Add this class when image is set
          
          if (!hasImageContent) {
            overlay.style.opacity = '0.6'; // Always visible but translucent
            
            if (field === 'profilePicture') {
              // For profile pictures, add a different permanent hint
              element.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              
              // If this is an initials-based avatar, keep it visible
              if (element.textContent && element.textContent.length <= 2) {
                element.classList.add('has-initials');
              } else {
                element.style.minHeight = '100px';
                element.style.border = '2px dashed rgba(99, 102, 241, 0.3)';
              }
            } else {
              element.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              element.style.minHeight = '100px';
              element.style.border = '2px dashed rgba(99, 102, 241, 0.3)';
            }
          }
          
          // Only add the overlay if it doesn't already exist
          if (!element.querySelector('.upload-overlay')) {
            overlay.className = 'upload-overlay';
            element.appendChild(overlay);
            
            // Make sure the position is relative for absolute positioning to work
            if (window.getComputedStyle(element).position === 'static') {
              element.style.position = 'relative';
            }
          }
          
          element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Send message to parent window to trigger file upload
            window.parent.postMessage({
              type: 'upload',
              field: field,
              index: index
            }, '*');
          });
        }
        
        // Function to update the profile picture with the uploaded image
        function updateProfilePicture(imageUrl) {
          // Find all possible profile picture elements
          const profilePicElements = document.querySelectorAll('.profile-pic, .avatar img, .hero-image img, .about-image img');
          let updated = false;
          
          profilePicElements.forEach(img => {
            if (img.tagName.toLowerCase() === 'img') {
              img.src = imageUrl;
              updated = true;
            }
          });
          
          // Check for div-based avatars (like the YN element in the screenshot)
          if (!updated) {
            const avatarDivs = document.querySelectorAll('.avatar, div[class*="avatar"], div[class*="profile-pic"], div[style*="border-radius: 50%"], .rounded-full, .circle, .circular');
            
            avatarDivs.forEach(div => {
              // Clear any text content (like initials)
              if (div.textContent && div.textContent.length <= 2) {
                div.textContent = '';
              }
              
              // Set background image 
              div.style.backgroundImage = \`url("\${imageUrl}")\`;
              div.style.backgroundSize = 'cover';
              div.style.backgroundPosition = 'center';
              div.classList.add('has-profile-picture');
              
              // Remove any hint text previously added
              const hintText = div.querySelector('.profile-pic-hint');
              if (hintText) {
                hintText.remove();
              }
              
              updated = true;
            });
          }
          
          // If we still haven't found anything, try looking for large circular elements in the header
          if (!updated) {
            const headerSection = document.querySelector('header, .hero, .header');
            if (headerSection) {
              const possibleAvatars = headerSection.querySelectorAll('div[style*="width"][style*="height"], div[style*="border-radius"]');
              
              if (possibleAvatars.length > 0) {
                // Find the largest one by width × height
                let largestElement = possibleAvatars[0];
                let largestArea = 0;
                
                possibleAvatars.forEach(el => {
                  const style = window.getComputedStyle(el);
                  const width = parseInt(style.width);
                  const height = parseInt(style.height);
                  const area = width * height;
                  
                  if (area > largestArea) {
                    largestArea = area;
                    largestElement = el;
                  }
                });
                
                // Clear any text content (like initials)
                if (largestElement.textContent && largestElement.textContent.length <= 2) {
                  largestElement.textContent = '';
                }
                
                // Set background image
                largestElement.style.backgroundImage = \`url("\${imageUrl}")\`;
                largestElement.style.backgroundSize = 'cover';
                largestElement.style.backgroundPosition = 'center';
                largestElement.classList.add('has-profile-picture');
                
                updated = true;
              }
            }
          }
          
          return updated;
        }
        
        // Function to update a project image
        function updateProjectImage(imageUrl, index) {
          const projectElements = document.querySelectorAll('.project, .project-card');
          if (index < projectElements.length) {
            const projectElement = projectElements[index];
            const imageElement = projectElement.querySelector('.project-image, .card-image, .project img');
            
            if (imageElement) {
              if (imageElement.tagName.toLowerCase() === 'img') {
                imageElement.src = imageUrl;
              } else {
                imageElement.style.backgroundImage = \`url("\${imageUrl}")\`;
                imageElement.style.backgroundSize = 'cover';
                imageElement.style.backgroundPosition = 'center';
              }
              imageElement.classList.add('has-image');
              return true;
            }
          }
          return false;
        }
        
        // Listen for messages from the parent
        window.addEventListener('message', function(event) {
          // Make sure the message is from our parent
          if (event.origin !== window.location.origin) return;
          
          const { type, data, field, index, imageUrl } = event.data;
          
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
            
            // Profile Picture - first try standard image elements
            let foundProfilePic = false;
            const profilePicElements = document.querySelectorAll('.profile-pic, .avatar img, .hero-image img, .about-image img');
            if (profilePicElements.length > 0) {
              // Use the first image as the profile picture
              makeUploadTrigger(profilePicElements[0].parentElement || profilePicElements[0], 'profilePicture');
              foundProfilePic = true;
              
              // If we have a profile picture URL, update the image
              if (data && data.profilePictureUrl) {
                profilePicElements.forEach(img => {
                  if (img.tagName.toLowerCase() === 'img') {
                    img.src = data.profilePictureUrl;
                  }
                });
              }
            }
            
            // If no standard image found, try to find div-based avatars
            if (!foundProfilePic) {
              // Look for circular avatars and initials containers
              const avatarDivs = document.querySelectorAll('.avatar, div[class*="avatar"], div[class*="profile-pic"], div[style*="border-radius: 50%"], .rounded-full, .circle, .circular');
              if (avatarDivs.length > 0) {
                // Use the first avatar div
                makeUploadTrigger(avatarDivs[0], 'profilePicture');
                foundProfilePic = true;
                
                // If we have a profile picture URL, update the background image
                if (data && data.profilePictureUrl) {
                  avatarDivs[0].style.backgroundImage = \`url("\${data.profilePictureUrl}")\`;
                  avatarDivs[0].style.backgroundSize = 'cover';
                  avatarDivs[0].style.backgroundPosition = 'center';
                  avatarDivs[0].classList.add('has-profile-picture');
                  
                  // Clear any text content (like initials)
                  if (avatarDivs[0].textContent && avatarDivs[0].textContent.length <= 2) {
                    avatarDivs[0].textContent = '';
                  }
                }
                
                // Add a subtle hint that appears on hover
                const hintText = document.createElement('div');
                hintText.className = 'profile-pic-hint';
                hintText.textContent = 'Click to change profile picture';
                hintText.style.position = 'absolute';
                hintText.style.bottom = '-20px';
                hintText.style.left = '0';
                hintText.style.right = '0';
                hintText.style.textAlign = 'center';
                hintText.style.fontSize = '10px';
                hintText.style.color = 'rgba(99, 102, 241, 0.8)';
                hintText.style.fontWeight = 'bold';
                hintText.style.opacity = '0';
                hintText.style.transition = 'opacity 0.2s ease';
                
                avatarDivs[0].addEventListener('mouseover', function() {
                  hintText.style.opacity = '1';
                });
                
                avatarDivs[0].addEventListener('mouseout', function() {
                  hintText.style.opacity = '0';
                });
                
                avatarDivs[0].style.position = 'relative';
                avatarDivs[0].appendChild(hintText);
              }
            }
            
            // If still no profile pic found, look for any likely candidate in the header
            if (!foundProfilePic) {
              // Find header or hero section
              const headerSection = document.querySelector('header, .hero, .header');
              if (headerSection) {
                // Look for any large circular element
                const possibleAvatars = headerSection.querySelectorAll('div[style*="width"][style*="height"], div[style*="border-radius"]');
                if (possibleAvatars.length > 0) {
                  // Find the largest one by width × height
                  let largestElement = possibleAvatars[0];
                  let largestArea = 0;
                  
                  possibleAvatars.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const width = parseInt(style.width);
                    const height = parseInt(style.height);
                    const area = width * height;
                    
                    if (area > largestArea) {
                      largestArea = area;
                      largestElement = el;
                    }
                  });
                  
                  makeUploadTrigger(largestElement, 'profilePicture');
                  
                  // If we have a profile picture URL, update the background image
                  if (data && data.profilePictureUrl) {
                    largestElement.style.backgroundImage = \`url("\${data.profilePictureUrl}")\`;
                    largestElement.style.backgroundSize = 'cover';
                    largestElement.style.backgroundPosition = 'center';
                    largestElement.classList.add('has-profile-picture');
                    
                    // Clear any text content (like initials)
                    if (largestElement.textContent && largestElement.textContent.length <= 2) {
                      largestElement.textContent = '';
                    }
                  }
                }
              }
            }
            
            // Skills
            const skillElements = document.querySelectorAll('.skill, .skill-tag');
            skillElements.forEach((skill, index) => {
              makeEditable(skill, 'skill', index);
            });
            
            // Projects
            const projectElements = document.querySelectorAll('.project, .project-card');
            projectElements.forEach((project, index) => {
              // Project image
              const imageElement = project.querySelector('.project-image, .card-image, .project img');
              if (imageElement) {
                makeUploadTrigger(imageElement, 'projectImage', index);
                
                // If we have project image URLs, update them
                if (data && data.projects && data.projects[index] && data.projects[index].imageUrl) {
                  if (imageElement.tagName.toLowerCase() === 'img') {
                    imageElement.src = data.projects[index].imageUrl;
                  } else {
                    imageElement.style.backgroundImage = \`url("\${data.projects[index].imageUrl}")\`;
                    imageElement.style.backgroundSize = 'cover';
                    imageElement.style.backgroundPosition = 'center';
                  }
                  imageElement.classList.add('has-image');
                }
              }
              
              // Project name
              const nameElement = project.querySelector('h3, .project-name, .project-title');
              if (nameElement) {
                makeEditable(nameElement, 'project-name', index);
              }
              
              // Project description
              const descElement = project.querySelector('p, .project-description, .project-desc');
              if (descElement) {
                makeEditable(descElement, 'project-description', index);
              }
            });
          } else if (type === 'updateImage') {
            // Handle image update message
            if (field === 'profilePicture' && imageUrl) {
              updateProfilePicture(imageUrl);
            } else if (field === 'projectImage' && imageUrl && typeof index === 'number') {
              updateProjectImage(imageUrl, index);
            }
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
    if (!currentEditField) return;
    
    // Store the old data to detect changes
    const oldPortfolioData = { ...portfolioData };
    
    // Update the data
    if (currentIndex !== null) {
      // Update array item (skill, project, etc.)
      if (currentEditField === 'skill') {
        const newSkills = [...portfolioData.skills];
        newSkills[currentIndex].name = fieldValue;
        setPortfolioData({
          ...portfolioData,
          skills: newSkills
        });
      } else if (currentEditField === 'project-name') {
        const newProjects = [...portfolioData.projects];
        newProjects[currentIndex].name = fieldValue;
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        });
      } else if (currentEditField === 'project-description') {
        const newProjects = [...portfolioData.projects];
        newProjects[currentIndex].description = fieldValue;
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        });
      }
    } else {
      // Update regular field
      if (fieldMapping[currentEditField]) {
        setPortfolioData({
          ...portfolioData,
          [fieldMapping[currentEditField]]: fieldValue
        });
      } else {
        // Otherwise just use the field name directly
        setPortfolioData({
          ...portfolioData,
          [currentEditField]: fieldValue
        });
      }
    }
    
    // Reset the edit state
    setCurrentEditField(null);
    setCurrentIndex(null);
    setIsEditDialogOpen(false);
    
    // Show a toast notification
    toast.success('Changes saved successfully');

    // Regenerate preview so the newly updated data appears immediately
    setIframeLoading(true);
  }
  
  const handleCancel = () => {
    setCurrentEditField(null)
    setCurrentIndex(null)
    setIsEditDialogOpen(false)
  }
  
  // Handle file upload for images and update preview
  const handleFileUpload = async (file: File, field: 'cv' | 'projectImage' | 'profilePicture', projectIndex?: number) => {
    setIsUploading(true);
    
    try {
      // Create a local URL for the file for immediate preview
      const fileUrl = URL.createObjectURL(file);
      
      if (field === 'profilePicture') {
        setPortfolioData({
          ...portfolioData,
          profilePicture: file,
          profilePictureUrl: fileUrl // Add this URL for rendering
        });
        
        // Send message to update the profile picture in the iframe
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'updateImage',
            field: 'profilePicture',
            imageUrl: fileUrl
          }, '*');
        }
      } else if (field === 'cv') {
        setPortfolioData({
          ...portfolioData,
          cv: file,
          hasCv: true,
          cvUrl: fileUrl // Add this URL for rendering
        });
      } else if (field === 'projectImage' && typeof projectIndex === 'number') {
        const newProjects = [...portfolioData.projects];
        newProjects[projectIndex] = { 
          ...newProjects[projectIndex], 
          image: file,
          imageUrl: fileUrl // Add this URL for rendering
        };
        setPortfolioData({
          ...portfolioData,
          projects: newProjects
        });
        
        // Send message to update the project image in the iframe
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'updateImage',
            field: 'projectImage',
            index: projectIndex,
            imageUrl: fileUrl
          }, '*');
        }
      }
      
      toast.success(`${field === 'cv' ? 'CV' : field === 'profilePicture' ? 'Profile picture' : 'Project image'} uploaded successfully`);

      // Regenerate preview so the newly uploaded image appears immediately
      setIframeLoading(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }
  
  const handleSavePortfolio = async () => {
    if (!user) {
      toast.error("You need to be logged in to save your portfolio")
      return
    }
    
    // Validate portfolio name – require a non-empty value different from the default placeholder
    if (!portfolioData.name.trim() || portfolioData.name.trim() === "My Portfolio") {
      // Open dialog prompting the user to enter a portfolio name
      setTempPortfolioName("")
      setIsNameDialogOpen(true)
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
      
      // Clean up preview files since we've saved the portfolio permanently
      await fetch('/api/portfolios/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excludeId: null }), // clean everything
      })
      
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
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
              <span>Interactive Editor</span>
              <span className="text-indigo-500">•</span>
              {/* Portfolio name input */}
              <Input
                value={portfolioData.name}
                onChange={(e) => setPortfolioData({
                  ...portfolioData,
                  name: e.target.value
                })}
                placeholder="Portfolio Name"
                className="w-40 sm:w-56 md:w-64 px-2 py-1 text-sm font-normal"
              />
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
      <div className="flex-1 overflow-hidden relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Loading template{loadAttempts > 0 ? ` (attempt ${loadAttempts + 1}/4)` : ''}...
            </p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="about:blank" 
          className="w-full h-full border-0"
          style={{ height: `${iframeHeight}px` }}
          onError={(e) => {
            console.error('Iframe load error:', e);
            setIframeLoading(false);
          }}
        />
      </div>
      
      {/* File Upload Inputs (hidden) */}
      <input 
        ref={profilePictureInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0], 'profilePicture');
          }
        }}
      />
      
      <input 
        ref={cvInputRef}
        type="file" 
        accept=".pdf,.doc,.docx" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0], 'cv');
          }
        }}
      />
      
      <input 
        ref={projectImageInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0] && currentProjectIndex !== null) {
            handleFileUpload(e.target.files[0], 'projectImage', currentProjectIndex);
          }
        }}
      />
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && handleCancel()}>
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

      {/* Dialog prompting for missing portfolio name */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Enter a portfolio name</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={tempPortfolioName}
              onChange={(e) => setTempPortfolioName(e.target.value)}
              placeholder="My Awesome Portfolio"
            />
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const trimmed = tempPortfolioName.trim()
                if (!trimmed) {
                  toast.error("Please enter a valid name for your portfolio")
                  return
                }
                // Update state with the new name and close dialog
                setPortfolioData({ ...portfolioData, name: trimmed })
                setIsNameDialogOpen(false)
                // Delay to ensure state is updated before saving
                setTimeout(() => {
                  handleSavePortfolio()
                }, 0)
              }}
            >
              <Check className="h-4 w-4 mr-2" /> Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}