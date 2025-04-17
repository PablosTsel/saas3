"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

export function AuthNav() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

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

  return (
    <header className="bg-white shadow-sm border-b border-indigo-100">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PortfolioMaker</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Features
          </Link>
          <Link href="#templates" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Templates
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-24 bg-indigo-50 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-md">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={handleLogout} size="sm" className="bg-black hover:bg-gray-800 text-white rounded-md">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-md">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white rounded-md shadow-sm hover:shadow-md transition-all">
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