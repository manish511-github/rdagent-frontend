"use client";

import { AuthLoading } from "@/components/auth/auth-loading";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import AgentChatWorkspace from "@/components/kokonutui/agent-chat-workspace";
import Layout from "@/components/kokonutui/layout";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AgentChatPage() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to use Agent Chat.",
    requireAuth: true,
  });

  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />;
  }

  if (showRedirectMessage) {
    return (
      <AuthRedirect
        title="Authentication Required"
        description="You need to be signed in to use Agent Chat."
        redirectMessage="Redirecting to sign-in..."
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <AgentChatWorkspace />
    </Layout>
  );
}
