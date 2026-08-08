/** Authenticated Agent Chat API helpers. */

import Cookies from "js-cookie";

import { getApiUrl } from "@/lib/config";

import { iterateSseJson } from "./sse";
import type {
  AgentConversationDetail,
  AgentConversationSummary,
  AgentTurnEvent,
  AgentTurnRequestPayload,
  AgentWorkspaceTablePage,
  AgentWorkspaceTableSummary,
} from "./types";

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = Cookies.get("access_token");
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...(extra || {}),
  };
}

export async function streamAgentTurn(
  payload: AgentTurnRequestPayload,
  options?: { signal?: AbortSignal }
): Promise<AsyncGenerator<AgentTurnEvent, void, unknown>> {
  const response = await fetch(getApiUrl("agent-runtime/turn"), {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    }),
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail || `Agent turn failed with status ${response.status}`
    );
  }

  return iterateSseJson(response);
}

export async function cancelAgentExecution(
  executionId: string
): Promise<{ status: string; execution_id: string }> {
  const response = await fetch(
    getApiUrl(`agent-runtime/executions/${executionId}/cancel`),
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    }
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Cancel failed with status ${response.status}`);
  }
  return response.json();
}

export async function listAgentConversations(
  limit = 30
): Promise<AgentConversationSummary[]> {
  const response = await fetch(
    getApiUrl(`agent-runtime/conversations?limit=${limit}`),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load conversations");
  }
  return response.json();
}

export async function getAgentConversation(
  conversationId: string
): Promise<AgentConversationDetail> {
  const response = await fetch(
    getApiUrl(`agent-runtime/conversations/${conversationId}`),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load conversation");
  }
  return response.json();
}

export async function listAgentWorkspaceTables(
  workspaceId: string
): Promise<AgentWorkspaceTableSummary[]> {
  const response = await fetch(
    getApiUrl(`agent-runtime/workspaces/${encodeURIComponent(workspaceId)}/tables`),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load workspace tables");
  }
  return response.json();
}

export async function getAgentWorkspaceTable(
  workspaceId: string,
  tableSlug: string,
  options?: { limit?: number; offset?: number }
): Promise<AgentWorkspaceTablePage> {
  const params = new URLSearchParams({
    limit: String(options?.limit ?? 100),
    offset: String(options?.offset ?? 0),
  });
  const response = await fetch(
    getApiUrl(
      `agent-runtime/workspaces/${encodeURIComponent(workspaceId)}/tables/${encodeURIComponent(tableSlug)}?${params}`
    ),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load workspace table");
  }
  return response.json();
}
