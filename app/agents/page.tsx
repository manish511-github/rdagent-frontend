"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import AgentsPage from "@/components/kokonutui/agents-page"
import Layout from "@/components/kokonutui/layout"

export default function Agents() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access your agents.",
    requireAuth: true
  })

  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />
  }

  if (showRedirectMessage) {
    return (
      <AuthRedirect 
        title="Authentication Required"
        description="You need to be signed in to access your agents."
        redirectMessage="Redirecting to sign-in..."
      />
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <AgentsPage />
    </Layout>
  )
}
