"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getPortfolioById, updatePortfolio } from "@/lib/firebase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, ChevronLeft, Save, Trash2, ListChecks, Briefcase, GraduationCap, UploadCloud, FileText } from "lucide-react"
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
    skills: [],
    experience: [],
    education: [],
    projectCount: 1,
    projects: [{ name: "", description: "", image: null }],
    templateId: "",
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
  const handleFileUpload = (file: File, field: 'cv' | 'projectImage', projectIndex?: number) => {
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

  // Handle experience
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

  // Handle education
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
      // Create a copy of the portfolio data with the ID
      const portfolioToUpdate = {
        ...portfolioData,
        updatedAt: new Date().toISOString()
      }
      
      // Call the updatePortfolio function
      const { success, error } = await updatePortfolio(id, portfolioToUpdate)
      
      if (!success) {
        toast.dismiss("saving")
        toast.error(error || "Failed to update portfolio")
        setIsSaving(false)
        return
      }
      
      toast.dismiss("saving")
      toast.success("Portfolio updated successfully!")
      
      // Update the original data to reflect the new state
      setOriginalData(portfolioData)
      setHasChanges(false)
      
      // Wait a moment then redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      console.error("Error updating portfolio:", err)
      toast.dismiss("saving")
      toast.error(err.message || "An unexpected error occurred")
    } finally {
      setIsSaving(false)
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
          <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 bg-white p-1 rounded-lg shadow-sm border border-indigo-100">
            <TabsTrigger value="general" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              General
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <ListChecks className="h-4 w-4 mr-1" /> Skills
            </TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Briefcase className="h-4 w-4 mr-1" /> Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <GraduationCap className="h-4 w-4 mr-1" /> Education
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
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <div className="flex-1 grid md:grid-cols-2 gap-2">
                          <div>
                            <Input
                              placeholder="Skill name"
                              value={skill.name}
                              onChange={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Select 
                              value={skill.level} 
                              onValueChange={(value) => handleUpdateSkill(index, 'level', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Skill level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card className="bg-white shadow-sm border border-indigo-100">
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Add your professional experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioData.experience.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No work experience added yet</p>
                    <Button onClick={handleAddExperience} variant="outline" className="border-dashed border-indigo-200">
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Experience
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {portfolioData.experience.map((exp, index) => (
                      <div key={index} className="space-y-4 p-4 bg-indigo-50/30 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">Experience #{index + 1}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveExperience(index)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`exp-company-${index}`}>Company</Label>
                            <Input
                              id={`exp-company-${index}`}
                              placeholder="Company name"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`exp-position-${index}`}>Position</Label>
                            <Input
                              id={`exp-position-${index}`}
                              placeholder="Your job title"
                              value={exp.position}
                              onChange={(e) => handleUpdateExperience(index, 'position', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`exp-period-${index}`}>Period</Label>
                            <Input
                              id={`exp-period-${index}`}
                              placeholder="e.g. Jan 2020 - Present"
                              value={exp.period}
                              onChange={(e) => handleUpdateExperience(index, 'period', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`exp-description-${index}`}>Description</Label>
                          <Textarea
                            id={`exp-description-${index}`}
                            placeholder="Describe your responsibilities and achievements"
                            value={exp.description}
                            onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={handleAddExperience} 
                      variant="outline" 
                      className="mt-4 border-dashed border-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Another Experience
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <Card className="bg-white shadow-sm border border-indigo-100">
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Add your educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioData.education.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No education added yet</p>
                    <Button onClick={handleAddEducation} variant="outline" className="border-dashed border-indigo-200">
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Education
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {portfolioData.education.map((edu, index) => (
                      <div key={index} className="space-y-4 p-4 bg-indigo-50/30 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">Education #{index + 1}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveEducation(index)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                            <Input
                              id={`edu-institution-${index}`}
                              placeholder="School or university name"
                              value={edu.institution}
                              onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                            <Input
                              id={`edu-degree-${index}`}
                              placeholder="e.g. Bachelor of Science in Computer Science"
                              value={edu.degree}
                              onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edu-period-${index}`}>Period</Label>
                            <Input
                              id={`edu-period-${index}`}
                              placeholder="e.g. 2016 - 2020"
                              value={edu.period}
                              onChange={(e) => handleUpdateEducation(index, 'period', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={handleAddEducation} 
                      variant="outline" 
                      className="mt-4 border-dashed border-indigo-200"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Another Education
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