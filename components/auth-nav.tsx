"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export function AuthNav() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After hydration, set mounted to true
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    const { success, error } = await logout()
    
    if (error) {
      toast.error(error)
      return
    }
    
    if (success) {
      toast.success("Logged out successfully")
      router.push("/")
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-indigo-100 dark:border-gray-800">
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

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </Link>
          <Link href="#templates" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Templates
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full w-9 h-9"
            aria-label="Toggle theme"
          >
            {/* Only show icon when client-side mounted to avoid hydration mismatch */}
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-300" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-700" />
              )
            ) : (
              // Show empty div with same dimensions during server render
              <div className="h-4 w-4" />
            )}
          </Button>
          
          {loading ? (
            <div className="h-10 w-24 bg-indigo-50 dark:bg-gray-800 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-indigo-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={handleLogout} size="sm" className="bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-md">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-indigo-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-md shadow-sm hover:shadow-md transition-all">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 