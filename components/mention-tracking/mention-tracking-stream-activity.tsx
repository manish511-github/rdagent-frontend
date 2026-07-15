"use client";

import { useMemo } from "react";
import { AlertCircle, Brain, CheckCircle2, Loader2 } from "lucide-react";

import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { cn } from "@/lib/utils";
import type { MentionWorkspaceEvent } from "@/lib/mention-tracking/types";

type MentionTrackingStreamActivityProps = {
  events: MentionWorkspaceEvent[];
  isSearching: boolean;
  streamStatus: string | null;
};

function formatTaskLabel(event: MentionWorkspaceEvent) {
  if (event.type === "mention_found") {
    const platform = event.platform ? ` on ${event.platform}` : "";
    return `Found mention${platform}`;
  }
  if (event.type === "tool_completed" && typeof event.count === "number") {
    return `${event.label} (${event.count})`;
  }
  return event.label;
}

export function MentionTrackingStreamActivity({
  events,
  isSearching,
  streamStatus,
}: MentionTrackingStreamActivityProps) {
  const currentThinking = useMemo(
    () => [...events].reverse().find((event) => event.type === "thinking"),
    [events]
  );
  const taskEvents = useMemo(() => {
    const seen = new Map<string, MentionWorkspaceEvent>();

    for (const event of events) {
      if (["thinking", "completed"].includes(event.type)) continue;

      const key =
        event.type === "error"
          ? `error:${event.label}`
          : `${event.type}:${event.platform || event.label}`;

      if (event.type === "tool_started") {
        seen.set(key, event);
        continue;
      }

      if (event.type === "tool_completed") {
        const startedKey = `tool_started:${event.platform || event.label}`;
        seen.delete(startedKey);
        seen.set(key, event);
        continue;
      }

      seen.set(key, event);
    }

    return Array.from(seen.values()).slice(-8);
  }, [events]);

  if (!isSearching && events.length === 0) return null;

  return (
    <div className="min-w-0 space-y-3 rounded-xl border bg-muted/10 p-3">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {isSearching ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        ) : (
          <Brain className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 truncate font-medium">
          {isSearching ? "Agent is working" : "Agent activity"}
        </span>
      </div>
      {(currentThinking?.label || streamStatus) && (
        <div className="flex min-w-0 items-start gap-2 border-l-2 border-primary/40 pl-3 text-xs leading-5 text-muted-foreground">
          <span className="min-w-0 break-words">
            {currentThinking?.label || streamStatus}
          </span>
        </div>
      )}
      {taskEvents.length > 0 && (
        <Task className="w-full" defaultOpen={isSearching}>
          <TaskTrigger title="Agent tasks" />
          <TaskContent>
            {taskEvents.map((event) => (
              <TaskItem
                key={event.id}
                className={cn(
                  event.type === "error" && "text-destructive",
                  event.type === "tool_completed" && "text-foreground"
                )}
              >
                <span className="flex items-start gap-2">
                  {event.type === "error" ? (
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  ) : event.type === "tool_completed" ? (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  ) : null}
                  <span>
                    <span className="font-medium">{formatTaskLabel(event)}</span>
                    {event.detail && event.type !== "error" && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {event.detail}
                      </span>
                    )}
                    {event.type === "error" && event.detail && (
                      <span className="mt-0.5 block text-xs">{event.detail}</span>
                    )}
                  </span>
                </span>
              </TaskItem>
            ))}
          </TaskContent>
        </Task>
      )}
    </div>
  );
}
