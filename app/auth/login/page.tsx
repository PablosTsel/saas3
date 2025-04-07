"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles } from "lucide-react"
import { useState, FormEvent } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      console.log("Attempting to log in user:", { email })
      const { user, error } = await login(email, password)
      
      if (error) {
        console.error("Login error:", error)
        toast.error(error)
        setError(error)
        setIsLoading(false)
        return
      }
      
      if (user) {
        console.log("Login successful:", user)
        toast.success("Logged in successfully!")
        // Give the toast a moment to display before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast.error("Failed to log in")
        setError("Failed to log in")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      toast.error(error.message || "An unexpected error occurred")
      setError(error.message || "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PortfolioMaker</span>
            </Link>
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-800">Sign in to your account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-indigo-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email address</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label htmlFor="remember" className="text-gray-600 text-sm">Remember me</Label>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-indigo-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700" disabled={isLoading}>
                  Google
                </Button>
                <Button variant="outline" className="w-full border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700" disabled={isLoading}>
                  GitHub
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600">
            Not a member?{" "}
            <Link href="/auth/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

