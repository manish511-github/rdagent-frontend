"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  PanelRightClose,
  PanelRightOpen,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { MentionTrackingBottomToolbar } from "@/components/mention-tracking/mention-tracking-bottom-toolbar";
import { MentionTrackingChatInput } from "@/components/mention-tracking/mention-tracking-chat-input";
import { MentionTrackingChatMessages } from "@/components/mention-tracking/mention-tracking-chat-messages";
import { MentionWorkspacePanel } from "@/components/mentions/mention-workspace-panel";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMentionTrackingChat } from "@/hooks/useMentionTrackingChat";
import { EXAMPLE_PROMPTS } from "@/lib/mention-tracking/types";
import { cn } from "@/lib/utils";

const platformOptions = [
  { id: "x", label: "X" },
  { id: "reddit", label: "Reddit" },
  { id: "hackernews", label: "HN" },
  { id: "youtube", label: "YouTube" },
  { id: "github", label: "GitHub" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "newsletter", label: "Newsletters" },
];

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
  const chat = useMentionTrackingChat({
    includeWelcomeMessage: false,
    persistKey: "zooptics:agent-chat:current-session",
  });
  const [landingPrompt, setLandingPrompt] = useState("");
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showMentionsPanel, setShowMentionsPanel] = useState(true);
  const [activePanel, setActivePanel] = useState<"chat" | "workspace">("chat");
  const wasSearchingRef = useRef(false);

  const resultCount = chat.workspaceData?.signals.length ?? 0;
  const hasWorkspace =
    showWorkspace ||
    chat.isSearching ||
    resultCount > 0 ||
    chat.workspaceEvents.length > 0;

  useEffect(() => {
    if (chat.hasSessionActivity) {
      setShowWorkspace(true);
    }
    if (wasSearchingRef.current && !chat.isSearching && resultCount > 0) {
      setActivePanel("workspace");
    }
    wasSearchingRef.current = chat.isSearching;
  }, [chat.hasSessionActivity, chat.isSearching, resultCount]);

  const startRun = async (value: string) => {
    const prompt = value.trim();
    if (prompt.length < 8 || chat.isSearching) return;

    setLandingPrompt("");
    setShowWorkspace(true);
    setActivePanel("chat");
    const didStart = await chat.submitPrompt(prompt);
    if (!didStart) {
      setLandingPrompt(prompt);
      setShowWorkspace(false);
    }
  };

  const chatPanel = (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-hidden">
        <MentionTrackingChatMessages
          messages={chat.messages}
          isSearching={chat.isSearching}
          streamStatus={chat.streamStatus}
          workspaceEvents={chat.workspaceEvents}
          liveReasoning={chat.liveReasoning}
          onConfirmKeywordPlan={chat.confirmMentionKeywords}
        />
      </div>
      <MentionTrackingChatInput
        prompt={chat.prompt}
        setPrompt={chat.setPrompt}
        onSubmit={(value) => chat.submitPrompt(value ?? chat.prompt)}
        onStopSearch={chat.stopSearch}
        canSearch={chat.canSearch}
        isSearching={chat.isSearching}
        showSettings={chat.showSettings}
        setShowSettings={chat.setShowSettings}
        agentMode={chat.agentMode}
        setAgentMode={chat.setAgentMode}
        aiExpandKeywords={chat.aiExpandKeywords}
        setAiExpandKeywords={chat.setAiExpandKeywords}
        productName={chat.productName}
        setProductName={chat.setProductName}
        competitors={chat.competitors}
        setCompetitors={chat.setCompetitors}
        selectedPlatforms={chat.selectedPlatforms}
        setSelectedPlatforms={chat.setSelectedPlatforms}
      />
    </div>
  );

  const workspacePanel = (
    <MentionWorkspacePanel
      data={chat.workspaceData}
      liveSignals={chat.liveMentionSignals}
      workspaceEvents={chat.workspaceEvents}
      isSearching={chat.isSearching}
      selectedPlatforms={chat.selectedPlatforms}
      trackerPrompt={chat.initialPrompt}
      sessionTitle={chat.sessionTitle}
    />
  );

  const startNewRun = () => {
    chat.resetSession();
    onNewRun();
  };

  if (!showWorkspace) {
    return (
      <div className="flex h-full min-h-[calc(100vh-2.5rem)] flex-col bg-gray-50 dark:bg-black">
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
                <PromptInputTools>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => chat.setShowSettings((value) => !value)}
                  >
                    <SlidersHorizontal className="size-4" />
                    Sources
                  </Button>
                </PromptInputTools>
                <PromptInputSubmit
                  disabled={landingPrompt.trim().length < 8 || chat.isSearching}
                  onStop={chat.stopSearch}
                  status={chat.isSearching ? "streaming" : "ready"}
                />
              </PromptInputFooter>
            </PromptInput>

            {chat.showSettings && (
              <PlatformSelector
                selectedPlatforms={chat.selectedPlatforms}
                onChange={chat.setSelectedPlatforms}
              />
            )}

            <div className="mx-auto mt-4 max-w-2xl">
              <Suggestions>
                {EXAMPLE_PROMPTS.map((example) => (
                  <Suggestion
                    key={example}
                    suggestion={example}
                    onClick={() => {
                      setLandingPrompt(example);
                      void startRun(example);
                    }}
                  />
                ))}
              </Suggestions>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[calc(100vh-2.5rem)] flex-col bg-gray-50 dark:bg-black">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute right-3 top-3 z-10 hidden h-8 gap-1.5 px-2 lg:flex"
        onClick={() => setShowMentionsPanel((v) => !v)}
        title={showMentionsPanel ? "Hide panel" : "Show panel"}
      >
        {showMentionsPanel ? (
          <PanelRightClose className="size-4" />
        ) : (
          <PanelRightOpen className="size-4" />
        )}
        <span className="text-xs">{showMentionsPanel ? "Hide" : "Show"}</span>
      </Button>

      <div className="hidden min-h-0 flex-1 lg:flex">
        {showMentionsPanel ? (
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
        <MentionTrackingBottomToolbar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          hasWorkspace={hasWorkspace}
          resultCount={resultCount}
        />
      </div>
    </div>
  );
}

function PlatformSelector({
  selectedPlatforms,
  onChange,
}: {
  selectedPlatforms: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <div className="mx-auto mt-3 flex max-w-2xl flex-wrap justify-center gap-2">
      {platformOptions.map((platform) => {
        const selected = selectedPlatforms.includes(platform.id);
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => {
              onChange((current) =>
                selected
                  ? current.filter((id) => id !== platform.id)
                  : [...current, platform.id]
              );
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {platform.label}
          </button>
        );
      })}
    </div>
  );
}
