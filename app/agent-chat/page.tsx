"use client";

import { AuthLoading } from "@/components/auth/auth-loading";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { AgentChatPanel } from "@/components/agent-chat/agent-chat-panel";
import { AgentWorkspaceTable } from "@/components/agent-chat/agent-workspace-table";
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
    conversationId,
    blocks,
    isStreaming,
    error,
    activeExecutionId,
    isCancellingExecution,
    workspaceTables,
    activeTableSlug,
    activeTable,
    isWorkspaceLoading,
    workspaceError,
    columnRunProgress,
    recentConversations,
    isLoadingConversations,
    currentConversationTitle,
    selectWorkspaceTable,
    openConversation,
    refreshRecentConversations,
    sendMessage,
    stop,
    cancelExecution,
    reset,
  } = useAgentChat();

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
      <div className="flex h-[calc(100vh-2.5rem)] min-h-0 overflow-hidden">
        <div
          className={
            workspaceTables.length > 0
              ? "h-full w-[38%] min-w-[420px] max-w-[560px] shrink-0"
              : "h-full w-full"
          }
        >
          <AgentChatPanel
            blocks={blocks}
            isStreaming={isStreaming}
            error={error}
            activeExecutionId={activeExecutionId}
            isCancellingExecution={isCancellingExecution}
            conversationId={conversationId}
            conversationTitle={currentConversationTitle}
            recentConversations={recentConversations}
            isLoadingConversations={isLoadingConversations}
            onSend={sendMessage}
            onStop={stop}
            onCancelExecution={cancelExecution}
            onOpenConversation={openConversation}
            onRefreshConversations={refreshRecentConversations}
            onReset={reset}
          />
        </div>
        <AgentWorkspaceTable
          tables={workspaceTables}
          activeTableSlug={activeTableSlug}
          activeTable={activeTable}
          isLoading={isWorkspaceLoading}
          isStreaming={isStreaming}
          runProgress={
            activeTableSlug ? columnRunProgress[activeTableSlug] : undefined
          }
          error={workspaceError}
          onSelectTable={selectWorkspaceTable}
          onRetryCell={({ tableName, row, column }) => {
            void sendMessage(
              `Retry ${column.name} for ${row.source_key} in ${tableName}. Only retry this failed cell.`
            );
          }}
        />
      </div>
    </Layout>
  );
}
