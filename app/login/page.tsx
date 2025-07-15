import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form" // Import LoginForm

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Welcome back!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue.</p>
        </div>
        <LoginForm /> {/* Use LoginForm component */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
