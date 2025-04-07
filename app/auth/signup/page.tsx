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
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-800">Create your account</h2>
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
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <div className="mt-2">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>
              
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
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-gray-700">Confirm Password</Label>
                <div className="mt-2">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted} 
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
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
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

