import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Sparkles,
  Save,
  Eye,
  Laptop,
  Smartphone,
  Tablet,
  PanelLeft,
  PanelRight,
  Moon,
  Sun,
  Palette,
  Type,
} from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function EditorPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 font-bold text-xl">
              <Sparkles className="h-5 w-5" />
              <span>Portfolio Editor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" /> Save & Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-background overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sections</h3>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                      Welcome
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                      About
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left bg-accent" size="sm">
                      Skills
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                      Projects
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                      Contact
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Skills Section</h3>

                  <div className="space-y-2">
                    <Label htmlFor="section-title">Section Title</Label>
                    <Input id="section-title" defaultValue="My Skills" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section-description">Description</Label>
                    <Textarea
                      id="section-description"
                      defaultValue="Here are some of the skills I've acquired throughout my career."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Skills</Label>
                      <Button variant="outline" size="sm">
                        Add Skill
                      </Button>
                    </div>

                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">React</span>
                          <span className="text-sm">Advanced</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">JavaScript</span>
                          <span className="text-sm">Expert</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">UI/UX Design</span>
                          <span className="text-sm">Intermediate</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Template</h3>
                  <Button variant="outline" className="w-full justify-between">
                    Professional
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Theme</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span className="text-sm">Light Mode</span>
                    </div>
                    <Switch id="theme-mode" />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Dark Mode</span>
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="h-8 rounded-md bg-primary cursor-pointer" title="Primary"></div>
                    <div className="h-8 rounded-md bg-secondary cursor-pointer" title="Secondary"></div>
                    <div className="h-8 rounded-md bg-accent cursor-pointer" title="Accent"></div>
                    <div className="h-8 rounded-md bg-background border cursor-pointer" title="Background"></div>
                    <div className="h-8 rounded-md bg-foreground cursor-pointer" title="Foreground"></div>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    <Palette className="mr-2 h-4 w-4" /> Customize Colors
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Typography</h3>
                  <Button variant="outline" className="w-full">
                    <Type className="mr-2 h-4 w-4" /> Font Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Laptop className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Tablet className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                AI Suggestions
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm min-h-full p-8">
              <h2 className="text-2xl font-bold mb-4">My Skills</h2>
              <p className="text-gray-500 mb-6">Here are some of the skills I've acquired throughout my career.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">React</h3>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "90%" }}></div>
                  </div>
                  <p className="mt-1 text-sm text-right">Advanced</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">JavaScript</h3>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "95%" }}></div>
                  </div>
                  <p className="mt-1 text-sm text-right">Expert</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">UI/UX Design</h3>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <p className="mt-1 text-sm text-right">Intermediate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

