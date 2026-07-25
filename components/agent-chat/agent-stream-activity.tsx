"use client";

import { useMemo } from "react";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { formatPlatformLabel } from "@/lib/agent-chat/signal-utils";
import type { AgentWorkspaceEvent } from "@/lib/agent-chat/types";

type AgentStreamActivityProps = {
  events: AgentWorkspaceEvent[];
  isSearching: boolean;
  streamStatus: string | null;
};

function eventStatus(
  event: AgentWorkspaceEvent,
  events: AgentWorkspaceEvent[],
  isSearching: boolean
): "complete" | "active" | "pending" {
  if (!isSearching || event.type === "completed" || event.type === "error") {
    return "complete";
  }
  if (event.type === "tool_started") {
    const hasResult = events.some(
      (candidate) =>
        candidate.type === "tool_completed" &&
        (event.operationId
          ? candidate.operationId === event.operationId
          : candidate.platform === event.platform &&
            candidate.createdAt >= event.createdAt)
    );
    return hasResult ? "complete" : "active";
  }
  if (event.type === "thinking" || event.type === "progress") {
    return event === events.at(-1) ? "active" : "complete";
  }
  return "complete";
}

function durationSeconds(events: AgentWorkspaceEvent[]) {
  if (events.length < 2) return null;
  const startedAt = Math.min(...events.map((event) => event.createdAt));
  const completedAt = Math.max(...events.map((event) => event.createdAt));
  return Math.max(1, Math.round((completedAt - startedAt) / 1000));
}

function eventDescription(event: AgentWorkspaceEvent) {
  const parts = [event.detail];
  if (typeof event.durationMs === "number") {
    const seconds = Math.max(0.1, event.durationMs / 1000);
    parts.push(`${seconds.toFixed(seconds < 10 ? 1 : 0)}s`);
  }
  return parts.filter(Boolean).join(" · ") || undefined;
}

function escapeMarkdownText(value: string) {
  return value.replace(/([\\`*_{}\[\]()#+\-.!|>])/g, "\\$1");
}

function eventReasoningLine(
  event: AgentWorkspaceEvent,
  events: AgentWorkspaceEvent[],
  isSearching: boolean
) {
  const status = eventStatus(event, events, isSearching);
  const platform = event.platform ? formatPlatformLabel(event.platform) : null;
  const prefix =
    event.type === "error" || event.failed
      ? "Could not complete"
      : status === "active"
        ? "Working on"
        : "Done";
  const details = [
    platform ? `source: ${platform}` : null,
    event.query ? `query: "${event.query}"` : null,
    typeof event.count === "number" ? `${event.count} result(s)` : null,
    eventDescription(event),
  ].filter(Boolean);

  return [
    `- ${escapeMarkdownText(prefix)}: ${escapeMarkdownText(event.label)}`,
    details.length
      ? `  ${escapeMarkdownText(details.join(" · "))}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function AgentStreamActivity({
  events,
  isSearching,
  streamStatus,
}: AgentStreamActivityProps) {
  const visibleEvents = useMemo(() => {
    const visible: AgentWorkspaceEvent[] = [];
    for (const event of events) {
      if (event.type === "mention_found" || event.type === "cancelled") continue;
      const previous = visible.at(-1);
      if (
        previous?.type === event.type &&
        previous.label === event.label &&
        previous.operationId === event.operationId
      ) {
        continue;
      }
      visible.push(event);
    }
    return visible.slice(-30);
  }, [events]);

  if (!isSearching && visibleEvents.length === 0) return null;

  const currentEvent = visibleEvents.at(-1);
  const duration = durationSeconds(visibleEvents);
  const reasoningText =
    visibleEvents.length > 0
      ? visibleEvents
          .map((event) => eventReasoningLine(event, visibleEvents, isSearching))
          .join("\n")
      : streamStatus || "Preparing the run...";

  return (
    <Reasoning
      className="mb-0 min-w-0 rounded-xl border bg-muted/10 p-3"
      defaultOpen={isSearching}
      duration={duration ?? undefined}
      isStreaming={isSearching}
    >
      <ReasoningTrigger
        aria-label="Toggle agent activity"
        getThinkingMessage={(streaming, seconds) => {
          if (streaming) {
            return (
              <span className="min-w-0 truncate">
                Agent is working
                {currentEvent?.label ? ` · ${currentEvent.label}` : ""}
              </span>
            );
          }
          return (
            <span>
              Agent worked
              {seconds ? ` for ${seconds} seconds` : ""}
            </span>
          );
        }}
      />
      <ReasoningContent className="mt-3 leading-relaxed">
        {reasoningText}
      </ReasoningContent>
    </Reasoning>
  );
}
