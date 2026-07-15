"use client";

import { SlidersHorizontal } from "lucide-react";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import type { AgentMode } from "@/lib/agent-chat/types";
import { EXAMPLE_PROMPTS } from "@/lib/agent-chat/types";

type AgentChatInputProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (value?: string) => void;
  onStopSearch: () => void;
  canSearch: boolean;
  isSearching: boolean;
  showSettings: boolean;
  setShowSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  aiExpandKeywords: boolean;
  setAiExpandKeywords: (value: boolean) => void;
  productName: string;
  setProductName: (value: string) => void;
  competitors: string;
  setCompetitors: (value: string) => void;
};

export function AgentChatInput({
  prompt,
  setPrompt,
  onSubmit,
  onStopSearch,
  canSearch,
  isSearching,
  showSettings,
  setShowSettings,
  agentMode,
  setAgentMode,
  aiExpandKeywords,
  setAiExpandKeywords,
  productName,
  setProductName,
  competitors,
  setCompetitors,
}: AgentChatInputProps) {
  return (
    <div className="border-t bg-background px-4 py-4">
      <div className="mx-auto max-w-2xl space-y-3">
        <Suggestions>
          {EXAMPLE_PROMPTS.map((example) => (
            <Suggestion
              key={example}
              suggestion={example}
              onClick={(value) => setPrompt(value)}
            />
          ))}
        </Suggestions>

        {showSettings && (
          <div className="grid gap-3 rounded-lg border bg-secondary/30 p-3">
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                    Search mode
              </label>
              <select
                value={agentMode}
                onChange={(event) =>
                  setAgentMode(event.target.value as AgentMode)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="auto">Auto select from prompt</option>
                <option value="reddit">Reddit mentions</option>
                <option value="hackernews">Hacker News mentions</option>
                <option value="x">X / Twitter mentions</option>
                <option value="mention">Mention tracking</option>
              </select>
            </div>

            {(agentMode === "mention" || agentMode === "auto") && (
              <>
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Product name (optional)
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="e.g. Zooptics"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Competitors (optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={competitors}
                    onChange={(event) => setCompetitors(event.target.value)}
                    placeholder="e.g. HubSpot, Apollo"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <label className="flex items-start gap-2 rounded-lg border bg-secondary/30 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={aiExpandKeywords}
            onChange={(event) => setAiExpandKeywords(event.target.checked)}
            className="mt-0.5 size-4 rounded border-input"
          />
          <span>
            <span className="block font-medium">Suggest extra mention keywords</span>
            <span className="block text-xs text-muted-foreground">
              You approve the final keyword list before tracking starts.
            </span>
          </span>
        </label>

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
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowSettings((value) => !value)}
                aria-label="Toggle agent settings"
              >
                <SlidersHorizontal className="size-4" />
              </Button>
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
