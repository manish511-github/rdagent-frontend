"use client";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { AgentContextUsage } from "@/components/agent-chat/agent-context-usage";
import type { AgentTokenUsage } from "@/lib/agent-chat/types";

type AgentChatInputProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (value?: string) => void;
  onStopSearch: () => void;
  canSearch: boolean;
  isSearching: boolean;
  tokenUsage?: AgentTokenUsage | null;
};

export function AgentChatInput({
  prompt,
  setPrompt,
  onSubmit,
  onStopSearch,
  canSearch,
  isSearching,
  tokenUsage,
}: AgentChatInputProps) {
  return (
    <div className="border-t bg-background px-4 py-4">
      <div className="mx-auto max-w-2xl">
        <PromptInput
          onSubmit={(message) => {
            onSubmit(message.text);
          }}
        >
          <PromptInputTextarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: Find X posts where founders complain Apollo is not working for cold outreach"
            className="min-h-[60px] resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit(prompt);
              }
            }}
          />
          <PromptInputFooter>
            <PromptInputTools>
              <AgentContextUsage usage={tokenUsage} />
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!isSearching && !canSearch}
              onStop={onStopSearch}
              status={isSearching ? "streaming" : "ready"}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
