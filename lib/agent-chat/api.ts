/** Authenticated Agent Chat API helpers. */

import Cookies from "js-cookie";

import { getApiUrl } from "@/lib/config";

import { iterateSseJson } from "./sse";
import type {
  AgentConversationDetail,
  AgentConversationSummary,
  AgentColumnBatchEventPage,
  AgentColumnBatchStatus,
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

export async function listAgentWorkspaceColumnBatches(
  workspaceId: string,
  options?: { activeOnly?: boolean; limit?: number }
): Promise<AgentColumnBatchStatus[]> {
  const params = new URLSearchParams({
    active_only: String(options?.activeOnly ?? true),
    limit: String(options?.limit ?? 50),
  });
  const response = await fetch(
    getApiUrl(
      `agent-runtime/workspaces/${encodeURIComponent(workspaceId)}/column-batches?${params}`
    ),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load calculated-column batches");
  }
  return response.json();
}

export async function getAgentColumnBatch(
  batchId: string
): Promise<AgentColumnBatchStatus> {
  const response = await fetch(
    getApiUrl(`agent-runtime/column-batches/${encodeURIComponent(batchId)}`),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to load calculated-column progress");
  }
  return response.json();
}

export async function cancelAgentColumnBatch(
  batchId: string
): Promise<AgentColumnBatchStatus> {
  const response = await fetch(
    getApiUrl(`agent-runtime/column-batches/${encodeURIComponent(batchId)}/cancel`),
    { method: "POST", headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to cancel calculated-column work");
  }
  return response.json();
}

export async function retryFailedAgentColumnBatch(
  batchId: string
): Promise<AgentColumnBatchStatus> {
  const response = await fetch(
    getApiUrl(
      `agent-runtime/column-batches/${encodeURIComponent(batchId)}/retry-failed`
    ),
    { method: "POST", headers: authHeaders() }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || "Failed to retry failed cells");
  }
  return response.json();
}

export async function getAgentColumnBatchEvents(
  batchId: string,
  after = 0
): Promise<AgentColumnBatchEventPage> {
  const params = new URLSearchParams({ after: String(after), limit: "200" });
  const response = await fetch(
    getApiUrl(
      `agent-runtime/column-batches/${encodeURIComponent(batchId)}/events?${params}`
    ),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw new Error("Failed to replay calculated-column progress");
  }
  return response.json();
}
