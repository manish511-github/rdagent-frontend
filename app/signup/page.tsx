import SignupForm from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Create Your Account | Relative",
  description: "Create your Relative account and start optimizing your workflows today.",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-300 hover:bg-transparent">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Signup Form */}
        <div className="bg-card border rounded-lg p-8 shadow-sm py-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-2">Get started with your free account</p>
          </div>

          <SignupForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
