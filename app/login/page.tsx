"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { LoginForm } from "@/components/auth/login-form" // Import LoginForm

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Logo at top left */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 left-8"
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"}
            alt="logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-medium font-montserrat bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            zooptics
          </span>
        </Link>
      </motion.div>

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
