'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { forgotPasswordSchema } from '@/lib/validation-schemas'
import { getApiUrl } from '@/lib/config'

export default function ForgotPasswordPage() {
  const { theme } = useTheme()

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsSubmitting(true)
    
    try {
      // Call your API endpoint for password reset
      const response = await fetch(getApiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to send reset email";
        
        try {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        } catch {
          // Handle non-JSON responses
        }
        
        // Handle specific status codes
        if (response.status === 401) {
          toast.error("Email Not Found", {
            description: errorMessage,
          });
        } else if (response.status === 403) {
          toast.error("Account Issue", {
            description: errorMessage,
          });
        } else if (response.status >= 500) {
          toast.error("Server Error", {
            description: "Something went wrong on our end. Please try again in a moment.",
          });
        } else {
          toast.error("Request Failed", {
            description: errorMessage,
          });
        }
        return;
      }

      setIsSubmitted(true)
      toast.success('Password reset email sent. Please check your inbox.')
    } catch (error) {
      // Network errors or other exceptions
      if (error instanceof Error && !error.message.includes("Failed to send reset email")) {
      console.error('Error sending password reset email', error)
        toast.error("Connection Error", {
          description: "Unable to connect to the server. Please check your internet connection.",
        });
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center space-y-4"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ duration: 0.6 }}
            >
              <CheckCircle className="size-16 text-green-500" />
            </motion.div>
            <h3 className="text-xl font-semibold">Check Your Email</h3>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Forgot Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email address to receive a password reset link.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="johndoe@mail.com"
                        type="email"
                        autoComplete="email"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="size-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 