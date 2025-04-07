"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  FileImage,
  Briefcase,
  Award,
  Phone,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  FlipVerticalIcon as DragVertical,
  Check,
} from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState("basic-info")

  const totalSteps = 5
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)

      // Update active tab based on current step
      switch (currentStep + 1) {
        case 1:
          setActiveTab("basic-info")
          break
        case 2:
          setActiveTab("about")
          break
        case 3:
          setActiveTab("skills")
          break
        case 4:
          setActiveTab("projects")
          break
        case 5:
          setActiveTab("contact")
          break
        default:
          break
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)

      // Update active tab based on current step
      switch (currentStep - 1) {
        case 1:
          setActiveTab("basic-info")
          break
        case 2:
          setActiveTab("about")
          break
        case 3:
          setActiveTab("skills")
          break
        case 4:
          setActiveTab("projects")
          break
        case 5:
          setActiveTab("contact")
          break
        default:
          break
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create your portfolio</h1>
            <p className="text-gray-500">Complete the steps below to set up your professional portfolio.</p>
          </div>

          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2 w-full" />
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>
                {currentStep === 1 && "Basic Info"}
                {currentStep === 2 && "About"}
                {currentStep === 3 && "Skills"}
                {currentStep === 4 && "Projects"}
                {currentStep === 5 && "Contact"}
              </span>
            </div>
          </div>

          {currentStep <= totalSteps ? (
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="basic-info"
                  onClick={() => currentStep >= 1 && setCurrentStep(1)}
                  disabled={currentStep < 1}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Basic Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                  disabled={currentStep < 2}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  onClick={() => currentStep >= 3 && setCurrentStep(3)}
                  disabled={currentStep < 3}
                >
                  <Award className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  onClick={() => currentStep >= 4 && setCurrentStep(4)}
                  disabled={currentStep < 4}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  onClick={() => currentStep >= 5 && setCurrentStep(5)}
                  disabled={currentStep < 5}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Contact</span>
                </TabsTrigger>
              </TabsList>

              {/* Step 1: Basic Info */}
              <TabsContent value="basic-info">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Let's start with some basic information about you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" alt="Profile picture" />
                        <AvatarFallback>UP</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headline">Professional headline</Label>
                      <Input id="headline" placeholder="e.g. Senior UX Designer at Company" />
                      <p className="text-sm text-gray-500">A short description that appears under your name</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="e.g. San Francisco, CA" />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 2: About */}
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About You</CardTitle>
                    <CardDescription>Tell visitors about yourself and your background.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Write a brief description about yourself, your experience, and what you do..."
                        className="min-h-[200px]"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Formatting options</span>
                        <span className="text-gray-500">0/500 characters</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tips for a great bio:</Label>
                      <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                        <li>Keep it concise and focused on your professional experience</li>
                        <li>Highlight your key achievements and specialties</li>
                        <li>Mention your career goals and what you're passionate about</li>
                        <li>Use a friendly, conversational tone</li>
                      </ul>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 3: Skills */}
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Skills</CardTitle>
                    <CardDescription>Add skills to showcase your expertise.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Skills List</Label>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Skill
                        </Button>
                      </div>

                      {/* Skill Item 1 */}
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DragVertical className="h-5 w-5 text-gray-400" />
                            <h3 className="font-medium">React</h3>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skill-name-1">Skill Name</Label>
                          <Input id="skill-name-1" defaultValue="React" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="proficiency-1">Proficiency</Label>
                            <span className="text-sm text-gray-500">Advanced</span>
                          </div>
                          <Slider id="proficiency-1" defaultValue={[4]} max={5} step={1} />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                            <span>Expert</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-1">Category (Optional)</Label>
                          <Select>
                            <SelectTrigger id="category-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend Development</SelectItem>
                              <SelectItem value="backend">Backend Development</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="management">Project Management</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Skill Item 2 */}
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DragVertical className="h-5 w-5 text-gray-400" />
                            <h3 className="font-medium">JavaScript</h3>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skill-name-2">Skill Name</Label>
                          <Input id="skill-name-2" defaultValue="JavaScript" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="proficiency-2">Proficiency</Label>
                            <span className="text-sm text-gray-500">Expert</span>
                          </div>
                          <Slider id="proficiency-2" defaultValue={[5]} max={5} step={1} />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                            <span>Expert</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-2">Category (Optional)</Label>
                          <Select>
                            <SelectTrigger id="category-2">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend Development</SelectItem>
                              <SelectItem value="backend">Backend Development</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="management">Project Management</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 4: Projects */}
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>Showcase your best work with projects.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Project List</Label>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                      </div>

                      {/* Project Item 1 */}
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DragVertical className="h-5 w-5 text-gray-400" />
                            <h3 className="font-medium">E-commerce Website</h3>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-name-1">Project Name</Label>
                          <Input id="project-name-1" defaultValue="E-commerce Website" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-description-1">Description (3 sentences max)</Label>
                          <Textarea
                            id="project-description-1"
                            defaultValue="Developed a full-featured e-commerce platform with React and Node.js. Implemented user authentication, product catalog, and payment processing. The site achieved a 25% increase in conversion rate compared to the previous version."
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Project Image</Label>
                          <div className="border-2 border-dashed rounded-md p-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FileImage className="h-8 w-8 text-gray-400" />
                              <div className="text-sm text-gray-500">
                                <p>Drag and drop an image here, or click to browse</p>
                                <p className="text-xs">PNG, JPG or GIF, max 2MB</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Upload Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Item 2 */}
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DragVertical className="h-5 w-5 text-gray-400" />
                            <h3 className="font-medium">Mobile App</h3>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-name-2">Project Name</Label>
                          <Input id="project-name-2" defaultValue="Mobile App" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-description-2">Description (3 sentences max)</Label>
                          <Textarea
                            id="project-description-2"
                            defaultValue="Designed and developed a fitness tracking mobile app using React Native. Integrated with health APIs to track user activity and provide personalized recommendations. Featured on the App Store's 'New Apps We Love' section."
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Project Image</Label>
                          <div className="border-2 border-dashed rounded-md p-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FileImage className="h-8 w-8 text-gray-400" />
                              <div className="text-sm text-gray-500">
                                <p>Drag and drop an image here, or click to browse</p>
                                <p className="text-xs">PNG, JPG or GIF, max 2MB</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Upload Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 5: Contact */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How can people reach you?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input id="contact-email" type="email" placeholder="your@email.com" />
                      <div className="flex items-center gap-2 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Email verified</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Social Media Links</Label>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm">
                          LinkedIn
                        </Label>
                        <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm">
                          GitHub
                        </Label>
                        <Input id="github" placeholder="https://github.com/yourusername" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-sm">
                          Twitter
                        </Label>
                        <Input id="twitter" placeholder="https://twitter.com/yourusername" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm">
                          Personal Website
                        </Label>
                        <Input id="website" placeholder="https://yourwebsite.com" />
                      </div>

                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Another Link
                      </Button>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleNext}>
                        Finish <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Completion Screen
            <Card>
              <CardContent className="pt-6 pb-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Portfolio Created Successfully!</h2>
                <p className="text-gray-500 mb-6">
                  Your portfolio has been created and is ready to be customized further.
                </p>

                <div className="mb-8 border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Portfolio Preview</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/editor">Customize Portfolio</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

