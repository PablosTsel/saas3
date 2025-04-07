"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Edit, Eye, Globe, Plus, Settings, Sparkles, User, Users, Bell, LogOut } from "lucide-react"
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
import { useState } from "react"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md px-6 py-6 h-auto rounded-lg transition-all hover:shadow-lg hover:scale-105">
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
              {/* Portfolio Card */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100 rounded-xl group">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-gray-800">My Portfolio</CardTitle>
                  <CardDescription className="text-indigo-500">Professional template</CardDescription>
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
                  <Button variant="outline" size="sm" asChild className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700">
                    <Link href="/editor" className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-indigo-500" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    <Link href="#view" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" /> View Live
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Create New Portfolio Card */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-300 border border-dashed border-indigo-200 rounded-xl bg-white/50 group">
                <CardHeader className="pb-2 border-b border-dashed border-indigo-100">
                  <CardTitle className="text-gray-800">Create New Portfolio</CardTitle>
                  <CardDescription className="text-indigo-500">Choose from our templates</CardDescription>
                </CardHeader>
                <CardContent className="aspect-video flex items-center justify-center p-0 group-hover:bg-indigo-50/50 transition-colors">
                  <button className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-indigo-100 hover:scale-110 transition-all border border-dashed border-indigo-200 group-hover:border-indigo-300">
                    <Plus className="h-12 w-12 text-indigo-400" />
                  </button>
                </CardContent>
              </Card>
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
    </div>
  )
}

