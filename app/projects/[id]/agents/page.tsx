"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import AgentsPage from "@/components/kokonutui/agents-page"

export default function ProjectAgentsPage() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access your agents.",
    requireAuth: true
  })

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />
  }

  // Show redirect message if not authenticated
  if (showRedirectMessage) {
    return <AuthRedirect />
  }

  // Only render the agents page if authenticated
  if (!isAuthenticated) {
    return null
  }

  return <AgentsPage />
}
