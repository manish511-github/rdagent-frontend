"use client"

import { use } from "react"
import Layout from "@/components/kokonutui/layout"
import CompetitorsPage from "@/components/kokonutui/competitors-page"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"

export default function Competitors({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access competitors.",
    requireAuth: true,
  })

  if (isLoading) return <AuthLoading message="Checking authentication..." />
  if (showRedirectMessage)
    return (
      <AuthRedirect
        title="Authentication Required"
        description="You need to be signed in to access competitors."
        redirectMessage="Redirecting to sign-in..."
      />
    )
  if (!isAuthenticated) return null

  return (
    <Layout>
      <CompetitorsPage projectId={id} />
    </Layout>
  )
}

