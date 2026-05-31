"use client"

import { use } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import IndividualAgentPage from "@/components/kokonutui/individual-agent-page"
import Layout from "@/components/kokonutui/layout"

export default function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access this agent.",
    requireAuth: true
  })

  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />
  }

  if (showRedirectMessage) {
    return (
      <AuthRedirect 
        title="Authentication Required"
        description="You need to be signed in to access this agent."
        redirectMessage="Redirecting to sign-in..."
      />
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <IndividualAgentPage agentId={agentId} />
    </Layout>
  )
}
