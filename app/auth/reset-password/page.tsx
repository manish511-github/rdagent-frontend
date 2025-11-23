"use client";

import { useState, Suspense } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { passwordSchema } from "@/lib/validation-schemas";
import { getApiUrl } from "@/lib/config";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  const { theme } = useTheme();
  
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="size-8 border-2 border-current border-t-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function ResetPasswordContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token || !userId) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl("auth/reset-password"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          id: parseInt(userId),
          password: values.password,
        }),
      });

      let data: { detail?: string; message?: string; error?: string } = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        // If JSON parsing fails, use the response text
        const responseText = await response.text();
        data = { detail: responseText || "Failed to reset password" };
      }

      if (!response.ok) {
        // FastAPI returns errors in the 'detail' field
        const errorMessage =
          data.detail ||
          data.message ||
          data.error ||
          "Failed to reset password";
        
        // Handle specific status codes
        if (response.status === 401) {
          toast.error("Invalid Token", {
            description: errorMessage,
          });
        } else if (response.status === 403) {
          toast.error("Account Issue", {
            description: errorMessage,
          });
        } else if (response.status === 404) {
          toast.error("Invalid Request", {
            description: errorMessage,
          });
        } else if (response.status >= 500) {
          toast.error("Server Error", {
            description: "Something went wrong on our end. Please try again in a moment.",
          });
        } else {
          toast.error("Reset Failed", {
            description: errorMessage,
          });
        }
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      // Network errors or other exceptions (toast already shown for HTTP errors)
      if (error instanceof Error && !error.message.includes("Failed to reset password") && !error.message.includes("Invalid") && !error.message.includes("Account")) {
      console.error("Error resetting password", error);
        toast.error("Connection Error", {
          description: "Unable to connect to the server. Please check your internet connection.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || !userId) {
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
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground text-red-600">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Token: {token ? "Present" : "Missing"} | User ID:{" "}
              {userId ? "Present" : "Missing"}
            </p>
          </div>

          <div className="text-center">
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
            <h3 className="text-xl font-semibold">
              Password Reset Successfully!
            </h3>
            <p className="text-muted-foreground">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button className="w-full">
                  <ArrowLeft className="size-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
                      </Button>
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="size-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
