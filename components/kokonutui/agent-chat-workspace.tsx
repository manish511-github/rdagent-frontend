"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  MessageSquarePlus,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { AgentBottomToolbar } from "@/components/agent-chat/agent-bottom-toolbar";
import { AgentChatInput } from "@/components/agent-chat/agent-chat-input";
import { AgentChatMessages } from "@/components/agent-chat/agent-chat-messages";
import { AgentConversationMenu } from "@/components/agent-chat/agent-conversation-menu";
import { AgentWorkspacePanel } from "@/components/agent-chat/agent-workspace-panel";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAgentChat } from "@/hooks/useAgentChat";
import { resultDisplayCount } from "@/lib/agent-chat/signal-utils";
import type { AgentRunResponse } from "@/lib/agent-chat/types";
import { cn } from "@/lib/utils";

export default function AgentChatWorkspace() {
  const [runKey, setRunKey] = useState(0);

  return (
    <AgentChatRun
      key={runKey}
      onNewRun={() => setRunKey((current) => current + 1)}
    />
  );
}

function AgentChatRun({ onNewRun }: { onNewRun: () => void }) {
  const chat = useAgentChat({
    includeWelcomeMessage: false,
    persistKey: "zooptics:agent-chat:current-session",
  });
  const [landingPrompt, setLandingPrompt] = useState("");
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showWorkspacePanel, setShowWorkspacePanel] = useState(false);
  const [activePanel, setActivePanel] = useState<"chat" | "workspace">("chat");
  const [workspaceViewMode, setWorkspaceViewMode] = useState<"plan" | "results">("results");
  const [selectedResultData, setSelectedResultData] = useState<AgentRunResponse | null>(null);
  const [selectedResultTitle, setSelectedResultTitle] = useState<string | null>(null);

  const workspaceData = selectedResultData || chat.workspaceData;
  const resultCount = resultDisplayCount(workspaceData);
  const hasResearchPlan = Boolean(chat.researchPlan);
  const workspaceLabel =
    workspaceViewMode === "plan" && chat.researchPlan?.title ? "Plan" : "Results";
  const hasWorkspace =
    showWorkspace ||
    chat.isSearching ||
    resultCount > 0 ||
    chat.workspaceEvents.length > 0;

  useEffect(() => {
    if (chat.hasSessionActivity) {
      setShowWorkspace(true);
    }
  }, [chat.hasSessionActivity]);

  useEffect(() => {
    if (
      showWorkspacePanel &&
      workspaceViewMode === "results" &&
      workspaceData?.artifact_id
    ) {
      chat.setVisibleArtifactId(workspaceData.artifact_id);
    }
  }, [showWorkspacePanel, workspaceData?.artifact_id, workspaceViewMode]);

  const startRun = async (value: string) => {
    const prompt = value.trim();
    if (prompt.length < 8 || chat.isSearching) return;

    setLandingPrompt("");
    setSelectedResultData(null);
    setSelectedResultTitle(null);
    setShowWorkspace(true);
    setShowWorkspacePanel(false);
    setActivePanel("chat");
    setWorkspaceViewMode("plan");
    const didStart = await chat.submitPrompt(prompt);
    if (!didStart) {
      setLandingPrompt(prompt);
      setShowWorkspace(false);
    }
  };

  const chatPanel = (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-hidden">
        {chat.isRestoringConversation ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Opening conversation…
          </div>
        ) : (
          <AgentChatMessages
            messages={chat.messages}
            isSearching={chat.isSearching}
            streamStatus={chat.streamStatus}
            workspaceEvents={chat.workspaceEvents}
            liveReasoning={chat.liveReasoning}
            onConfirmKeywordPlan={chat.confirmMentionKeywords}
            onConfirmResearchPlan={(message, plan) => {
              setSelectedResultData(null);
              setSelectedResultTitle(null);
              chat.confirmResearchPlan(message, plan);
            }}
            onRejectResearchPlan={chat.rejectResearchPlan}
            onViewResearchPlan={(plan) => {
              chat.openResearchPlan(plan);
              chat.setVisibleArtifactId(null);
              chat.setSelectedArtifactRowKey(null);
              setSelectedResultData(null);
              setSelectedResultTitle(null);
              setShowWorkspace(true);
              setShowWorkspacePanel(true);
              setActivePanel("workspace");
              setWorkspaceViewMode("plan");
            }}
            onViewResults={(data, title) => {
              chat.setVisibleArtifactId(data.artifact_id || null);
              chat.setSelectedArtifactRowKey(null);
              setSelectedResultData(data);
              setSelectedResultTitle(title || null);
              setShowWorkspace(true);
              setShowWorkspacePanel(true);
              setActivePanel("workspace");
              setWorkspaceViewMode("results");
            }}
          />
        )}
      </div>
      <AgentChatInput
        prompt={chat.prompt}
        setPrompt={chat.setPrompt}
        onSubmit={(value) => {
          setSelectedResultData(null);
          setSelectedResultTitle(null);
          return chat.submitPrompt(value ?? chat.prompt);
        }}
        onStopSearch={chat.stopSearch}
        canSearch={chat.canSearch}
        isSearching={chat.isSearching}
      />
    </div>
  );

  const workspacePanel = (
    <AgentWorkspacePanel
      data={workspaceData}
      liveSignals={chat.liveAgentSignals}
      workspaceEvents={chat.workspaceEvents}
      isSearching={chat.isSearching}
      viewMode={workspaceViewMode}
      trackerPrompt={chat.initialPrompt}
      sessionTitle={selectedResultTitle || chat.sessionTitle}
      researchPlan={chat.researchPlan}
      onExecutePlan={(message, plan) => {
        setSelectedResultData(null);
        setSelectedResultTitle(null);
        chat.confirmResearchPlan(message, plan);
      }}
      onRejectPlan={chat.rejectResearchPlan}
      onSelectedRowChange={chat.setSelectedArtifactRowKey}
    />
  );

  const startNewRun = () => {
    setSelectedResultData(null);
    setSelectedResultTitle(null);
    chat.resetSession();
    onNewRun();
  };

  const openConversation = (conversationId: string) => {
    setSelectedResultData(null);
    setSelectedResultTitle(null);
    setShowWorkspace(true);
    setShowWorkspacePanel(false);
    setActivePanel("chat");
    setWorkspaceViewMode("results");
    chat.setVisibleArtifactId(null);
    chat.setSelectedArtifactRowKey(null);
    chat.selectConversation(conversationId);
  };

  const chatControls = (
    <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur">
      <div className="min-w-0 max-w-52 px-2 sm:max-w-80">
        <span className="block truncate text-sm font-medium">
          {chat.sessionTitle || "New agent chat"}
        </span>
      </div>

      <AgentConversationMenu
        activeConversationId={chat.conversationId}
        disabled={chat.isSearching}
        onNewChat={startNewRun}
        onSelectConversation={openConversation}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={startNewRun}
        title="Start a new chat"
        aria-label="Start a new chat"
      >
        <MessageSquarePlus className="size-4" />
      </Button>
    </div>
  );

  const workspaceControl = hasResearchPlan && showWorkspace && (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="absolute right-3 top-3 z-20 hidden h-8 gap-1.5 bg-background/95 px-2 shadow-sm backdrop-blur lg:flex"
      onClick={() =>
        setShowWorkspacePanel((visible) => {
          if (visible) chat.setVisibleArtifactId(null);
          if (visible) chat.setSelectedArtifactRowKey(null);
          return !visible;
        })
      }
      title={showWorkspacePanel ? "Hide workspace" : "Show plan"}
    >
      {showWorkspacePanel ? (
        <PanelRightClose className="size-4" />
      ) : (
        <PanelRightOpen className="size-4" />
      )}
      <span className="text-xs">
        {showWorkspacePanel ? "Hide" : "Show plan"}
      </span>
    </Button>
  );

  if (!showWorkspace) {
    return (
      <div className="relative flex h-full min-h-[calc(100vh-2.5rem)] flex-col bg-gray-50 dark:bg-black">
        {chatControls}
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles className="size-5" />
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                What should Zooptics monitor?
              </h1>
            </div>

            <PromptInput
              className="mx-auto w-full max-w-2xl"
              onSubmit={(message) => startRun(message.text)}
            >
              <PromptInputTextarea
                value={landingPrompt}
                onChange={(event) => setLandingPrompt(event.target.value)}
                placeholder="Track MDM on Reddit, Hacker News, and newsletters"
                className="min-h-[92px] resize-none text-base"
                disabled={chat.isSearching}
              />
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit
                  disabled={landingPrompt.trim().length < 8 || chat.isSearching}
                  onStop={chat.stopSearch}
                  status={chat.isSearching ? "streaming" : "ready"}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-gray-50 dark:bg-black">
      {chatControls}
      {workspaceControl}

      <div className="hidden min-h-0 flex-1 lg:flex">
        {showWorkspacePanel ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={42} minSize={30}>
              {chatPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={58} minSize={35}>
              {workspacePanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="min-h-0 flex-1">{chatPanel}</div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div
          className={cn(
            "min-h-0 flex-1",
            activePanel === "chat" ? "flex flex-col" : "hidden"
          )}
        >
          {chatPanel}
        </div>
        <div
          className={cn(
            "min-h-0 flex-1",
            activePanel === "workspace" ? "flex flex-col" : "hidden"
          )}
        >
          {workspacePanel}
        </div>
        <AgentBottomToolbar
          activePanel={activePanel}
          onPanelChange={(panel) => {
            setActivePanel(panel);
            if (panel === "chat") chat.setVisibleArtifactId(null);
            if (panel === "chat") chat.setSelectedArtifactRowKey(null);
          }}
          hasWorkspace={hasWorkspace}
          resultCount={resultCount}
          workspaceLabel={workspaceLabel}
        />
      </div>
    </div>
  );
}
