"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import PostGeneratorPage from "@/components/kokonutui/post-generator-page"
import Layout from "@/components/kokonutui/layout"

export default function PostGenerator() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access the post generator.",
    requireAuth: true
  })

  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />
  }

  if (showRedirectMessage) {
    return (
      <AuthRedirect 
        title="Authentication Required"
        description="You need to be signed in to access the post generator."
        redirectMessage="Redirecting to sign-in..."
      />
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <PostGeneratorPage />
    </Layout>
  )
}
