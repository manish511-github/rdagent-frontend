"use client";

import { AuthLoading } from "@/components/auth/auth-loading";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { AgentChatPanel } from "@/components/agent-chat/agent-chat-panel";
import Layout from "@/components/kokonutui/layout";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AgentChatPage() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to use Agent Chat.",
    requireAuth: true,
  });

  const {
    blocks,
    isStreaming,
    error,
    activeExecutionId,
    isCancellingExecution,
    sendMessage,
    stop,
    cancelExecution,
    reset,
  } = useAgentChat({
    // Stopgap until workspace selector exists — keeps execute_code in one place.
    uiContext: { visible_workspace_id: "agent-chat" },
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
      <AgentChatPanel
        blocks={blocks}
        isStreaming={isStreaming}
        error={error}
        activeExecutionId={activeExecutionId}
        isCancellingExecution={isCancellingExecution}
        onSend={sendMessage}
        onStop={stop}
        onCancelExecution={cancelExecution}
        onReset={reset}
      />
    </Layout>
  );
}
