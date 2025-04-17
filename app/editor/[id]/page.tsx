"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getPortfolioById, updatePortfolio, uploadFile } from "@/lib/firebase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, ChevronLeft, Save, Trash2, ListChecks, Briefcase, GraduationCap, UploadCloud, FileText, User } from "lucide-react"
import { isEqual } from 'lodash'

// Define types for our portfolio data using the same types as dashboard
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
  imageUrl?: string; // For loaded portfolio data
}

interface PortfolioData {
  id?: string;
  name: string;
  title: string;
  about: string;
  cv: File | null;
  cvUrl?: string; // For loaded portfolio data
  hasCv: boolean;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projectCount: number;
  projects: Project[];
  templateId: string;
  fullName: string;
  smallIntro: string;
  email: string;
  phone: string;
  profilePicture?: File;
  profilePictureUrl?: string;
}

export default function PortfolioEditorPage() {
  const { id } = useParams() as { id: string }
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [originalData, setOriginalData] = useState<PortfolioData | null>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: "",
    title: "",
    about: "",
    cv: null,
    hasCv: true,
    skills: [
      { name: "Python", level: "Advanced" },
      { name: "Machine Learning", level: "Advanced" },
      { name: "TensorFlow", level: "Intermediate" },
      { name: "Natural Language Processing", level: "Intermediate" },
      { name: "Computer Vision", level: "Intermediate" },
      { name: "Data Structures & Algorithms", level: "Advanced" }
    ],
    experience: [],
    education: [],
    projectCount: 1,
    projects: [{ name: "", description: "", image: null }],
    templateId: "",
    fullName: "",
    smallIntro: "",
    email: "",
    phone: "",
  })
  const [activeTab, setActiveTab] = useState("general")
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch portfolio data
  useEffect(() => {
    if (!user) return

    const fetchPortfolio = async () => {
      try {
        const { portfolio, error } = await getPortfolioById(id)
        
        if (error || !portfolio) {
          toast.error(error || "Failed to load portfolio")
          router.push("/dashboard")
          return
        }
        
        // Transform the data for the editor
        // Cast portfolio to any to avoid TypeScript errors with dynamic properties
        const portfolioData = portfolio as any
        
        const transformedData: PortfolioData = {
          id: portfolioData.id,
          name: portfolioData.name || "",
          title: portfolioData.title || "",
          about: portfolioData.about || "",
          cv: null, // Actual file will be uploaded later
          cvUrl: portfolioData.cvUrl || "",
          hasCv: portfolioData.hasCv,
          skills: portfolioData.skills || [],
          experience: portfolioData.experience || [],
          education: portfolioData.education || [],
          projectCount: portfolioData.projects?.length || 1,
          projects: portfolioData.projects?.map((project: any) => ({
            name: project.name || "",
            description: project.description || "",
            image: null, // Actual file will be uploaded later
            imageUrl: project.imageUrl || ""
          })) || [{ name: "", description: "", image: null }],
          templateId: portfolioData.templateId || "minimal",
          fullName: portfolioData.fullName || "",
          smallIntro: portfolioData.smallIntro || "",
          email: portfolioData.email || "",
          phone: portfolioData.phone || "",
          profilePicture: portfolioData.profilePicture,
          profilePictureUrl: portfolioData.profilePictureUrl,
        }
        
        setPortfolioData(transformedData)
        setOriginalData(transformedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching portfolio:", error)
        toast.error("Failed to load portfolio data")
        router.push("/dashboard")
      }
    }
    
    fetchPortfolio()
  }, [id, user, router])

  // Check for changes
  useEffect(() => {
    if (!originalData) return
    
    // Compare portfolioData with originalData to detect changes
    // Ignore file objects in the comparison
    const comparableCurrentData = {
      ...portfolioData,
      cv: null,
      projects: portfolioData.projects.map(p => ({ ...p, image: null }))
    }
    
    const comparableOriginalData = {
      ...originalData,
      cv: null,
      projects: originalData.projects.map(p => ({ ...p, image: null }))
    }
    
    setHasChanges(!isEqual(comparableCurrentData, comparableOriginalData))
  }, [portfolioData, originalData])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Don't allow changing the name field
    if (name === "name") return
    
    setPortfolioData({
      ...portfolioData,
      [name]: value
    })
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle file upload
  const handleFileUpload = (file: File, field: 'cv' | 'projectImage' | 'profilePicture', projectIndex?: number) => {
    if (field === 'cv') {
      setPortfolioData({
        ...portfolioData,
        cv: file,
        cvUrl: "" // Clear the previous URL so we know to upload the new file
      })
    } else if (field === 'projectImage' && typeof projectIndex === 'number') {
      const newProjects = [...portfolioData.projects]
      newProjects[projectIndex] = { 
        ...newProjects[projectIndex], 
        image: file,
        imageUrl: "" // Clear the previous URL so we know to upload the new file
      }
      setPortfolioData({
        ...portfolioData,
        projects: newProjects
      })
    } else if (field === 'profilePicture') {
      setPortfolioData({
        ...portfolioData,
        profilePicture: file,
        profilePictureUrl: "" // Clear the previous URL so we know to upload the new file
      })
    }
  }

  // Handle CV toggle
  const handleCvToggle = (hasCv: boolean) => {
    setPortfolioData({
      ...portfolioData,
      hasCv,
      cv: hasCv ? portfolioData.cv : null
    })
  }

  // Handle skills
  const handleAddSkill = () => {
    setPortfolioData({
      ...portfolioData,
      skills: [...portfolioData.skills, { name: "", level: "Intermediate" }]
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

  // Handle projects
  const handleUpdateProjectCount = (count: string) => {
    const newCount = parseInt(count)
    if (isNaN(newCount) || newCount < 1) return
    
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
    newProjects[index] = { 
      ...newProjects[index], 
      [field]: value,
      // If updating the image, clear the imageUrl
      ...(field === 'image' ? { imageUrl: "" } : {})
    }
    setPortfolioData({
      ...portfolioData,
      projects: newProjects
    })
  }

  // Handle save/update
  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("You must be logged in to update a portfolio")
      return
    }

    if (isSaving) return // Prevent multiple submissions
    
    if (!hasChanges) {
      toast.info("No changes to save")
      return
    }

    setIsSaving(true)
    toast.loading("Saving changes...", { id: "saving" })

    try {
      // Create a copy of the portfolio data without File objects
      const portfolioToUpdate = {
        ...portfolioData,
        updatedAt: new Date().toISOString(),
        // Remove the File objects - they will be uploaded separately
        cv: null,
        profilePicture: null
      }
      
      // First, verify portfolio ownership
      const { portfolio: currentPortfolio, error: fetchError } = await getPortfolioById(id);
      if (fetchError || !currentPortfolio) {
        throw new Error(`Failed to verify portfolio ownership: ${fetchError || "Portfolio not found"}`);
      }
      
      // Cast to any to access properties safely
      const portfolioDoc = currentPortfolio as any;
      
      if (portfolioDoc.userId !== user.uid) {
        throw new Error("You don't have permission to edit this portfolio");
      }
      
      // Create a version of the portfolio that doesn't contain File objects
      // This version will be used if the file uploads fail
      const fallbackPortfolio = {
        ...portfolioToUpdate,
        // Keep existing URLs if available
        profilePictureUrl: portfolioData.profilePictureUrl || portfolioDoc.profilePictureUrl,
        cvUrl: portfolioData.hasCv ? (portfolioData.cvUrl || portfolioDoc.cvUrl) : null,
        // Keep existing project images
        projects: portfolioToUpdate.projects.map((project: Project, i: number) => ({
          ...project,
          imageUrl: project.imageUrl || (portfolioDoc.projects && i < portfolioDoc.projects.length ? 
                                portfolioDoc.projects[i].imageUrl : null),
        }))
      };
      
      // Handle file uploads - Profile Picture
      if (portfolioData.profilePicture) {
        try {
          toast.loading("Uploading profile picture...", { id: "uploading-profile" })
          const { url, error: uploadError } = await uploadFile(
            portfolioData.profilePicture,
            `users/${user.uid}/portfolios/${id}/profile-picture`
          )
          
          if (uploadError) {
            console.error("Profile picture upload failed:", uploadError);
            toast.dismiss("uploading-profile");
            toast.error("Couldn't upload profile picture. Using existing one if available.");
            // Continue without the new profile picture, using the existing URL
          } else {
            toast.dismiss("uploading-profile");
            toast.success("Profile picture uploaded successfully!");
            portfolioToUpdate.profilePictureUrl = url;
          }
        } catch (error) {
          console.error("Profile picture upload error:", error);
          toast.dismiss("uploading-profile");
          toast.error("Profile picture upload failed. Continuing with other changes.");
          // Continue with the update, just without the new profile picture
        }
      }
      
      // Handle file uploads - CV
      if (portfolioData.hasCv && portfolioData.cv) {
        try {
          toast.loading("Uploading CV...", { id: "uploading-cv" });
          const { url, error: uploadError } = await uploadFile(
            portfolioData.cv,
            `users/${user.uid}/portfolios/${id}/cv`
          );
          
          if (uploadError) {
            console.error("CV upload failed:", uploadError);
            toast.dismiss("uploading-cv");
            toast.error("Couldn't upload CV. Using existing one if available.");
            // Continue without the new CV, using the existing URL
          } else {
            toast.dismiss("uploading-cv");
            toast.success("CV uploaded successfully!");
            portfolioToUpdate.cvUrl = url;
          }
        } catch (error) {
          console.error("CV upload error:", error);
          toast.dismiss("uploading-cv");
          toast.error("CV upload failed. Continuing with other changes.");
          // Continue with the update, just without the new CV
        }
      }
      
      // Handle project image uploads
      const projectsToUpdate = [...portfolioData.projects];
      
      for (let i = 0; i < projectsToUpdate.length; i++) {
        const project = projectsToUpdate[i];
        
        if (project.image) {
          try {
            toast.loading(`Uploading project ${i+1} image...`, { id: `uploading-project-${i}` });
            const { url, error: uploadError } = await uploadFile(
              project.image,
              `users/${user.uid}/portfolios/${id}/projects/project-${i}`
            );
            
            if (uploadError) {
              console.error(`Project ${i+1} image upload failed:`, uploadError);
              toast.dismiss(`uploading-project-${i}`);
              toast.error(`Couldn't upload project ${i+1} image. Using existing one if available.`);
              // Keep existing image URL if available
              projectsToUpdate[i] = {
                ...project,
                image: null,
                imageUrl: project.imageUrl || (portfolioDoc.projects && i < portfolioDoc.projects.length ? 
                                portfolioDoc.projects[i].imageUrl : null)
              };
            } else {
              toast.dismiss(`uploading-project-${i}`);
              projectsToUpdate[i] = {
                ...project,
                imageUrl: url,
                image: null
              };
            }
          } catch (error) {
            console.error(`Project ${i+1} image upload error:`, error);
            toast.dismiss(`uploading-project-${i}`);
            toast.error(`Project ${i+1} image upload failed. Continuing with other changes.`);
            // Keep existing image URL if available
            projectsToUpdate[i] = {
              ...project,
              image: null,
              imageUrl: project.imageUrl || (portfolioDoc.projects && i < portfolioDoc.projects.length ? 
                            portfolioDoc.projects[i].imageUrl : null)
            };
          }
        }
      }
      
      // Update with the processed projects
      portfolioToUpdate.projects = projectsToUpdate;
      
      // Call the updatePortfolio function with cleaned data
      const { success, error } = await updatePortfolio(id, portfolioToUpdate);
      
      if (!success) {
        toast.dismiss("saving");
        toast.error(error || "Failed to update portfolio");
        setIsSaving(false);
        return;
      }
      
      toast.dismiss("saving");
      toast.success("Portfolio updated successfully!");
      
      // Update the original data to reflect the new state
      setOriginalData({
        ...portfolioToUpdate,
        // Restore the file references in our state, but they won't be saved to Firestore
        cv: portfolioData.cv,
        profilePicture: portfolioData.profilePicture,
        projects: projectsToUpdate.map((p, i) => ({
          ...p,
          image: portfolioData.projects[i].image
        }))
      });
      setHasChanges(false);
      
      // Automatically regenerate the portfolio before redirecting
      toast.loading(`Regenerating portfolio...`, {
        id: `regenerate-${id}`,
        duration: 10000, // Longer duration as generation can take time
      });
      
      try {
        // Call the API to regenerate the portfolio
        const regenerateResponse = await fetch(`/api/portfolios/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ portfolioId: id }),
        });

        const regenerateData = await regenerateResponse.json();

        if (!regenerateResponse.ok) {
          throw new Error(regenerateData.error || "Failed to regenerate portfolio");
        }

        // Success message
        toast.success(`Portfolio "${portfolioData.name}" regenerated successfully`, {
          id: `regenerate-${id}`,
          duration: 4000,
        });
      } catch (regenerateError) {
        console.error("Error regenerating portfolio:", regenerateError);
        toast.error(
          regenerateError instanceof Error 
            ? `Failed to regenerate portfolio: ${regenerateError.message}` 
            : "Failed to regenerate portfolio", 
          {
            id: `regenerate-${id}`,
            duration: 5000,
          }
        );
      }
      
      // Redirect to dashboard after regeneration attempt (whether successful or not)
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating portfolio:", err);
      toast.dismiss("saving");
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push("/dashboard")
      }
    } else {
      router.push("/dashboard")
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-lg text-indigo-700">Loading portfolio...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleCancel} className="mr-4">
              <ChevronLeft className="h-5 w-5 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Edit Portfolio: {portfolioData.name}</h1>
              <p className="text-sm text-gray-600">Make changes to your portfolio</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving || !hasChanges}
              className={`${hasChanges ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-300'} text-white`}
            >
              <Save className="h-4 w-4 mr-1" /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid grid-cols-3 gap-2 bg-white p-1 rounded-lg shadow-sm border border-indigo-100">
            <TabsTrigger value="general" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              General
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <ListChecks className="h-4 w-4 mr-1" /> Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Projects
            </TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-white shadow-sm border border-indigo-100">
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your basic information and bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Portfolio Name (cannot be changed)</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={portfolioData.name}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      placeholder="e.g. John Doe"
                      value={portfolioData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input 
                      id="title" 
                      name="title"
                      placeholder="e.g. Senior Frontend Developer"
                      value={portfolioData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smallIntro">Small Intro</Label>
                    <Input 
                      id="smallIntro" 
                      name="smallIntro"
                      placeholder="A brief one-sentence introduction"
                      value={portfolioData.smallIntro}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500">A short introduction for the homepage header (1 sentence).</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="about">About Me</Label>
                    <Textarea 
                      id="about" 
                      name="about"
                      placeholder="Tell us about yourself..."
                      value={portfolioData.about}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template</Label>
                    <Select 
                      value={portfolioData.templateId} 
                      onValueChange={(value) => setPortfolioData({...portfolioData, templateId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="template1">Template 1 (Modern Minimal)</SelectItem>
                        <SelectItem value="template2">Template 2 (Professional Dark)</SelectItem>
                        <SelectItem value="template3">Template 3 (Creative Bold)</SelectItem>
                        <SelectItem value="template4">Template 4 (Minimal Portfolio)</SelectItem>
                        <SelectItem value="template5">Template 5 (Visual Portfolio)</SelectItem>
                        <SelectItem value="template6">Template 6 (Glass Morphism)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-4">
                  <Label className="block">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-indigo-100">
                      {portfolioData.profilePicture || portfolioData.profilePictureUrl ? (
                        <img 
                          src={portfolioData.profilePicture ? URL.createObjectURL(portfolioData.profilePicture) : portfolioData.profilePictureUrl}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-indigo-300" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-indigo-600 border-indigo-200"
                        onClick={() => document.getElementById('profilePicture-upload')?.click()}
                      >
                        <UploadCloud className="h-4 w-4" />
                        Choose Photo
                      </Button>
                      <Input
                        id="profilePicture-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profilePicture')}
                      />
                      <p className="text-xs text-gray-500">Recommended: Square image, at least 300x300px</p>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4">
                  <Label className="block">Contact Information</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={portfolioData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        value={portfolioData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Label className="mr-4">CV / Resume</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className={`${portfolioData.hasCv ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'text-gray-700'}`}
                        onClick={() => handleCvToggle(true)}
                      >
                        Upload CV
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className={`${!portfolioData.hasCv ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'text-gray-700'}`}
                        onClick={() => handleCvToggle(false)}
                      >
                        No CV
                      </Button>
                    </div>
                  </div>
                  
                  {portfolioData.hasCv && (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-indigo-600 border-indigo-200"
                          onClick={() => document.getElementById('cv-upload')?.click()}
                        >
                          <UploadCloud className="h-4 w-4" />
                          Choose File
                        </Button>
                        <Input
                          id="cv-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')}
                        />
                        <span className="text-sm text-gray-600">
                          {portfolioData.cv ? portfolioData.cv.name : portfolioData.cvUrl ? "Current CV (click to replace)" : "No file chosen"}
                        </span>
                      </div>
                      {portfolioData.cvUrl && !portfolioData.cv && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          <a href={portfolioData.cvUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            View current CV
                          </a>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX, max 5MB.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="bg-white shadow-sm border border-indigo-100">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>List your technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioData.skills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No skills added yet</p>
                    <Button onClick={handleAddSkill} variant="outline" className="border-dashed border-indigo-200">
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Skill
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolioData.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="e.g. React, JavaScript, UI Design"
                            value={skill.name}
                            onChange={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveSkill(index)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={handleAddSkill} 
                      variant="outline" 
                      className="mt-4 border-dashed border-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Another Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white shadow-sm border border-indigo-100">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Showcase your work and projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="project-count">Number of Projects</Label>
                  <div className="max-w-xs">
                    <Input
                      id="project-count"
                      type="number"
                      min="1"
                      value={portfolioData.projectCount}
                      onChange={(e) => handleUpdateProjectCount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-8">
                  {portfolioData.projects.map((project, index) => (
                    <div key={index} className="space-y-4 p-4 bg-indigo-50/30 rounded-lg border border-indigo-100">
                      <h3 className="font-medium text-gray-800">Project #{index + 1}</h3>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`project-name-${index}`}>Project Name</Label>
                          <Input
                            id={`project-name-${index}`}
                            placeholder="Name of your project"
                            value={project.name}
                            onChange={(e) => handleUpdateProject(index, 'name', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`project-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`project-desc-${index}`}
                          placeholder="Describe your project"
                          value={project.description}
                          onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Project Image</Label>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-indigo-600 border-indigo-200"
                              onClick={() => document.getElementById(`project-image-${index}`)?.click()}
                            >
                              <UploadCloud className="h-4 w-4" />
                              Choose Image
                            </Button>
                            <Input
                              id={`project-image-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'projectImage', index)}
                            />
                            <span className="text-sm text-gray-600">
                              {project.image ? project.image.name : project.imageUrl ? "Current image (click to replace)" : "No image chosen"}
                            </span>
                          </div>
                          
                          {project.imageUrl && !project.image && (
                            <div className="mt-2">
                              <img 
                                src={project.imageUrl} 
                                alt={project.name || "Project image"} 
                                className="h-24 w-auto object-cover rounded-md border border-indigo-100"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 