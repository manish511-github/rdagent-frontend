"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

import { EyeIcon, EyeOffIcon, LoaderCircleIcon, AlertCircleIcon } from "lucide-react"

export default function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.fullName) {
      setError("Full name is required")
      return
    }

    if (!formData.email) {
      setError("Email is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!formData.password) {
      setError("Password is required")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Submit form
    await handleSignUp()
  }

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName, // Backend expects full_name
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        // Attempt to read error message from response body if available
        const errorBody = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: "Your account has been created. Please check your email to verify your account before signing in.",
        variant: "default",
      });
      router.push("/login"); // Redirect to sign-in page

    } catch (err: any) {
      console.error("Sign up failed:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = () => {
    // Redirect to FastAPI Google OAuth endpoint for signup
    window.location.href = "http://localhost:8000/auth/google";
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-300">
          <AlertCircleIcon className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Full name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className="h-9 bg-gray-50 dark:bg-gray-900 text-sm"
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="h-9 bg-gray-50 dark:bg-gray-900 text-sm"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-9 bg-gray-50 dark:bg-gray-900 pr-10 text-sm"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-9 bg-gray-50 dark:bg-gray-900 pr-10 text-sm"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-1 text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderCircleIcon className="mr-2 h-3 w-3 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center justify-center gap-2 text-sm"
          onClick={handleGoogleSignUp}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18">
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
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Sign up with Google</span>
        </Button>
      </form>
    </div>
  )
}
