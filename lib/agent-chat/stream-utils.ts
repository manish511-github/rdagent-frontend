import { formatPlatformLabel } from "./signal-utils";
import type {
  AgentRunTraceItem,
  AgentSignal,
  AgentStreamEvent,
  AgentWorkspaceEvent,
} from "./types";

/** Convert a durable backend trace into the same shape used by live SSE UI. */
export function activityTraceToWorkspaceEvents(
  trace: AgentRunTraceItem[] | undefined
): AgentWorkspaceEvent[] {
  if (!Array.isArray(trace)) return [];

  return trace.map((item) => {
    const createdAt = Date.parse(item.created_at);
    const base = {
      id: `trace-${item.sequence}`,
      label: item.message,
      platform: item.source || undefined,
      query: item.query || undefined,
      count: item.count ?? undefined,
      phase: item.phase || undefined,
      operationId: item.operation_id || undefined,
      durationMs: item.duration_ms ?? undefined,
      failed: item.failed || undefined,
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    };

    if (item.kind === "tool_call") {
      return { ...base, type: "tool_started" as const };
    }
    if (item.kind === "tool_result") {
      return { ...base, type: "tool_completed" as const };
    }
    if (item.kind === "complete") {
      return { ...base, type: "completed" as const };
    }
    if (item.kind === "error") {
      return { ...base, type: "error" as const };
    }
    return { ...base, type: "progress" as const };
  });
}

export function parseSseChunk(chunk: string): AgentStreamEvent | null {
  const line = chunk.split("\n").find((item) => item.startsWith("data: "));
  if (!line) return null;

  try {
    return JSON.parse(line.slice(6)) as AgentStreamEvent;
  } catch {
    return null;
  }
}

export function mergeAgentSignal(
  current: AgentSignal[],
  signal: AgentSignal
) {
  const incomingKey = agentSignalKey(signal);
  if (!incomingKey) return [...current, signal];
  const existingIndex = current.findIndex((item) => {
    const itemKey = agentSignalKey(item);
    return itemKey === incomingKey;
  });
  if (existingIndex === -1) return [...current, signal];
  return current.map((item, index) =>
    index === existingIndex ? signal : item
  );
}

export function agentSignalKey(signal: AgentSignal) {
  return (
    signal.url ||
    signal.post_id ||
    `${signal.platform || signal.source || "signal"}-${signal.title || ""}`
  );
}

export function normalizeStreamEvent(
  event: AgentStreamEvent
): Omit<AgentWorkspaceEvent, "id" | "createdAt"> | null {
  if (event.type === "mention_found" && event.mention) {
    return {
      type: "mention_found",
      label: event.mention.title || "New mention found",
      detail: event.mention.platform || event.mention.source,
      platform: event.mention.platform,
      signalKey: agentSignalKey(event.mention),
    };
  }

  if (event.type === "tool_started" || event.type === "platform_started") {
    const platform = formatPlatformLabel(event.platform, event.tool);
    return {
      type: "tool_started",
      label: event.label || event.message || `Searching ${platform}...`,
      detail: event.detail,
      platform: event.platform,
    };
  }

  if (event.type === "tool_completed" || event.type === "platform_completed") {
    const platform = formatPlatformLabel(event.platform, event.tool);
    return {
      type: "tool_completed",
      label:
        event.label ||
        `${platform} complete${
          typeof event.count === "number" ? `: ${event.count} found` : ""
        }`,
      detail: event.detail,
      platform: event.platform,
      count: event.count,
    };
  }

  if (event.type === "error" || event.status === "error") {
    return {
      type: "error",
      label: event.message || "Run failed",
      detail: event.detail,
    };
  }

  // ---------------------------------------------------------------
  // Status-based events from the agent loop.
  // The backend emits { status, message, data } instead of { type, ... }.
  // ---------------------------------------------------------------

  // tool_call → tool_started: the LLM chose a fetcher to invoke.
  if (event.status === "tool_call") {
    const data = event.data as Record<string, unknown> | undefined;
    const tool = (data?.tool as string) || "";
    const args = data?.args as Record<string, unknown> | undefined;
    const platform = formatPlatformLabel(undefined, tool);
    return {
      type: "tool_started",
      label: event.message || `Searching ${platform}...`,
      platform,
      query: typeof args?.query === "string" ? args.query : undefined,
      phase: "search",
      operationId:
        typeof data?.operation_id === "string" ? data.operation_id : undefined,
    };
  }

  // tool_result → tool_completed: the fetcher returned signals.
  if (event.status === "tool_result") {
    const data = event.data as Record<string, unknown> | undefined;
    const tool = (data?.tool as string) || "";
    const count = data?.count as number | undefined;
    const platform = formatPlatformLabel(undefined, tool);
    return {
      type: "tool_completed",
      label: event.message || `${platform} complete`,
      platform,
      phase: "search",
      operationId:
        typeof data?.operation_id === "string" ? data.operation_id : undefined,
      count,
      failed: Boolean(data?.error),
    };
  }

  // planning / running → thinking (activity indicator)
  if (
    event.status === "planning" ||
    event.status === "running"
  ) {
    if (event.message) {
      if (isLoopBookkeepingMessage(event.message)) {
        return null;
      }
      return {
        type: "thinking",
        label: event.message,
        phase: "planning",
      };
    }
  }

  // Quality/repair events are internal orchestration state. Surface a calm
  // progress message instead of exposing evaluator codes to the user.
  if (event.status === "quality") {
    return {
      type: "progress",
      label: "Reviewing result quality",
      phase: "evaluation",
    };
  }
  if (event.status === "repairing") {
    return {
      type: "progress",
      label: "Broadening the search for better matches",
      phase: "repair",
    };
  }

  // Legacy fallback: any event with a message becomes a thinking entry.
  if (event.message) {
    return {
      type: "thinking",
      label: event.message,
    };
  }

  return null;
}

function isLoopBookkeepingMessage(message: string) {
  return /^Step\s+\d+:\s+(starting the approved plan|checking whether to search again or summarize|asking the model what to do next)/i.test(
    message.trim()
  );
}

export async function readError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail[0]?.msg;
    return data.message;
  } catch {
    return response.statusText;
  }
}
