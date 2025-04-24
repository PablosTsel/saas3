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

export default function SignupPage() {
  const router = useRouter()
  const { signup, loginWithGoogle } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions")
      setError("Please accept the terms and conditions")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters")
      setError("Password should be at least 6 characters")
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log("Attempting to create user:", { email, password, name })
      const { user, error } = await signup(email, password, name)
      
      if (error) {
        console.error("Signup error:", error)
        toast.error(error)
        setError(error)
        setIsLoading(false)
        return
      }
      
      if (user) {
        console.log("User created successfully:", user)
        toast.success("Account created successfully!")
        // Give the toast a moment to display before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast.error("Failed to create account")
        setError("Failed to create account")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      toast.error(error.message || "An unexpected error occurred")
      setError(error.message || "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions")
      setError("Please accept the terms and conditions")
      return
    }
    
    setError("")
    setIsGoogleLoading(true)
    
    try {
      const { user, error } = await loginWithGoogle()
      
      if (error) {
        console.error("Google signup error:", error)
        toast.error(error)
        setError(error)
        setIsGoogleLoading(false)
        return
      }
      
      if (user) {
        console.log("Google signup successful:", user)
        toast.success("Signed up with Google successfully!")
        // Give the toast a moment to display before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast.error("Failed to sign up with Google")
        setError("Failed to sign up with Google")
        setIsGoogleLoading(false)
      }
    } catch (error: any) {
      console.error("Unexpected Google signup error:", error)
      toast.error(error.message || "An unexpected error occurred")
      setError(error.message || "An unexpected error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text dark:from-indigo-400 dark:to-purple-400">PortfolioMaker</span>
            </Link>
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-800 dark:text-gray-100">Create your account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm dark:shadow-lg border border-indigo-100 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <div className="mt-2">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-indigo-100 dark:border-gray-600 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-700 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-indigo-100 dark:border-gray-600 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-700 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-indigo-100 dark:border-gray-600 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-700 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password must be at least 6 characters</p>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                <div className="mt-2">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-indigo-100 dark:border-gray-600 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-700 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:border-indigo-500"
                />
                <Label htmlFor="terms" className="text-gray-600 dark:text-gray-400 text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-indigo-100 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-indigo-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2" 
                  disabled={isGoogleLoading || isLoading}
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

