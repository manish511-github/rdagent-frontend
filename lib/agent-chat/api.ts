/** Authenticated Agent Chat API helpers. */

import Cookies from "js-cookie";

import { getApiUrl } from "@/lib/config";

import { iterateSseJson } from "./sse";
import type {
  AgentConversationDetail,
  AgentConversationSummary,
  AgentColumnBatchEventPage,
  AgentColumnBatchStatus,
  AgentAutomationAction,
  AgentAutomationActionResult,
  AgentAutomationLibraryItem,
  AgentAutomationDetail,
  AgentAutomationPatch,
  AgentAutomationTask,
  AgentAutomationRunDetail,
  AgentTurnEvent,
  AgentTurnRequestPayload,
  AgentWorkspaceTablePage,
  AgentWorkspaceTableSummary,
} from "./types";

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  const detail =
    body && typeof body === "object" && typeof body.detail === "string"
      ? body.detail
      : fallback;
  return new Error(detail);
}

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

export async function getAgentAutomation(slug: string): Promise<AgentAutomationTask> {
  const response = await fetch(
    getApiUrl(`agent-runtime/automations/${encodeURIComponent(slug)}`),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw await responseError(response, "Failed to load automation");
  }
  return response.json();
}

export async function listAgentAutomations(): Promise<AgentAutomationLibraryItem[]> {
  const response = await fetch(getApiUrl("agent-runtime/automations?limit=100&offset=0"), {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw await responseError(response, "Failed to load automations");
  }
  return response.json();
}

export async function getAgentAutomationDetail(
  slug: string
): Promise<AgentAutomationDetail> {
  const response = await fetch(
    getApiUrl(
      `agent-runtime/automations/${encodeURIComponent(slug)}/detail?limit=100&offset=0`
    ),
    { headers: authHeaders() }
  );
  if (!response.ok) {
    throw await responseError(response, "Failed to load automation history");
  }
  return response.json();
}

export async function cancelAgentAutomationRun(
  slug: string,
  runId: string
): Promise<AgentAutomationRunDetail> {
  const response = await fetch(
    getApiUrl(
      `agent-runtime/automations/${encodeURIComponent(slug)}/runs/${encodeURIComponent(runId)}/cancel`
    ),
    { method: "POST", headers: authHeaders({ "Content-Type": "application/json" }) }
  );
  if (!response.ok) {
    throw await responseError(response, "Failed to cancel automation run");
  }
  return response.json();
}

export async function updateAgentAutomation(
  slug: string,
  input:
    | { expected_version: number; patch: AgentAutomationPatch }
    | { expected_version: number; pause: true }
): Promise<AgentAutomationActionResult> {
  const response = await fetch(
    getApiUrl(`agent-runtime/automations/${encodeURIComponent(slug)}`),
    {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(input),
    }
  );
  if (!response.ok) {
    throw await responseError(response, "Failed to update automation");
  }
  return response.json();
}

export async function confirmAgentAutomation(
  slug: string,
  input: {
    expected_version: number;
    action: AgentAutomationAction;
    confirmed: true;
    patch?: AgentAutomationPatch;
  }
): Promise<AgentAutomationActionResult> {
  const response = await fetch(
    getApiUrl(`agent-runtime/automations/${encodeURIComponent(slug)}/confirm`),
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(input),
    }
  );
  if (!response.ok) {
    throw await responseError(response, "Failed to confirm automation action");
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
