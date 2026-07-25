"use client";

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
import type { AgentTokenUsage } from "@/lib/agent-chat/types";

type AgentContextUsageProps = {
  usage?: AgentTokenUsage | null;
};

export function AgentContextUsage({ usage }: AgentContextUsageProps) {
  if (!usage?.context_window) return null;

  // context_tokens is the peak single call, not a turn total. Falling back to
  // the summed counters would report window pressure that never happened on
  // turns that make several independent calls.
  const usedTokens = usage.context_tokens;

  // The pricing catalog only knows some models. Passing an unknown id would
  // render "Total cost $0.00", which reads as free rather than unavailable.
  const pricingModelId = usage.pricing_model_id || undefined;

  return (
    <Context
      maxTokens={usage.context_window}
      modelId={pricingModelId}
      usage={{
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.total_tokens,
        reasoningTokens: usage.reasoning_tokens,
        cachedInputTokens: usage.cached_input_tokens,
      }}
      usedTokens={usedTokens}
    >
      <ContextTrigger
        aria-label="Model context usage"
        className="h-8 gap-1.5 px-2"
        size="sm"
      />
      <ContextContent align="start" side="top">
        <ContextContentHeader />
        <ContextContentBody>
          <div className="space-y-2">
            <ContextInputUsage />
            <ContextOutputUsage />
            <ContextReasoningUsage />
            <ContextCacheUsage />
          </div>
        </ContextContentBody>
        {pricingModelId ? (
          <ContextContentFooter />
        ) : (
          <ContextContentFooter>
            <span className="text-muted-foreground">Model</span>
            <span className="font-mono">{usage.model_id || "unknown"}</span>
          </ContextContentFooter>
        )}
      </ContextContent>
    </Context>
  );
}
