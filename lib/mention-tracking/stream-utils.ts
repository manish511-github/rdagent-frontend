import { formatPlatformLabel } from "./signal-utils";
import type {
  AgentSignal,
  AgentStreamEvent,
  MentionWorkspaceEvent,
} from "./types";

export function parseSseChunk(chunk: string): AgentStreamEvent | null {
  const line = chunk.split("\n").find((item) => item.startsWith("data: "));
  if (!line) return null;

  try {
    return JSON.parse(line.slice(6)) as AgentStreamEvent;
  } catch {
    return null;
  }
}

export function mergeMentionSignal(
  current: AgentSignal[],
  mention: AgentSignal
) {
  const incomingKey = mentionSignalKey(mention);
  if (!incomingKey) return [...current, mention];
  const existingIndex = current.findIndex((item) => {
    const itemKey = mentionSignalKey(item);
    return itemKey === incomingKey;
  });
  if (existingIndex === -1) return [...current, mention];
  return current.map((item, index) =>
    index === existingIndex ? mention : item
  );
}

export function mentionSignalKey(mention: AgentSignal) {
  return (
    mention.url ||
    mention.post_id ||
    `${mention.platform || mention.source || "mention"}-${mention.title || ""}`
  );
}

export function normalizeStreamEvent(
  event: AgentStreamEvent
): Omit<MentionWorkspaceEvent, "id" | "createdAt"> | null {
  if (event.type === "mention_found" && event.mention) {
    return {
      type: "mention_found",
      label: event.mention.title || "New mention found",
      detail: event.mention.platform || event.mention.source,
      platform: event.mention.platform,
      signalKey: mentionSignalKey(event.mention),
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
  // Status-based events from the Origami-style agent loop.
  // The backend emits { status, message, data } instead of { type, ... }.
  // ---------------------------------------------------------------

  // tool_call → tool_started: the LLM chose a fetcher to invoke.
  if (event.status === "tool_call") {
    const data = event.data as Record<string, unknown> | undefined;
    const tool = (data?.tool as string) || "";
    const platform = formatPlatformLabel(undefined, tool);
    return {
      type: "tool_started",
      label: event.message || `Searching ${platform}...`,
      detail: tool,
      platform: tool,
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
      detail: tool,
      platform: tool,
      count,
    };
  }

  // planning / running → thinking (activity indicator)
  if (
    event.status === "planning" ||
    event.status === "running"
  ) {
    if (event.message) {
      return {
        type: "thinking",
        label: event.message,
      };
    }
  }

  // Quality/repair events are internal orchestration state. Surface a calm
  // progress message instead of exposing evaluator codes to the user.
  if (event.status === "quality") {
    return { type: "thinking", label: "Checking the result quality..." };
  }
  if (event.status === "repairing") {
    return { type: "thinking", label: "Trying broader searches for better matches..." };
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
