"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import ProjectsPage from "@/components/kokonutui/project-page/projects-page"
import Layout from "@/components/kokonutui/layout"

export default function Projects() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access your projects.",
    requireAuth: true
  })

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />
  }

  // Show redirect message if not authenticated
  if (showRedirectMessage) {
    return (
      <AuthRedirect 
        title="Authentication Required"
        description="You need to be signed in to access your projects."
        redirectMessage="Redirecting to sign-in..."
      />
    )
  }

  // Only render the main content if authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <ProjectsPage />
    </Layout>
  )
}
