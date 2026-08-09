/** Shared types for Origami-style Agent Chat (Phase 6D). */

export type AgentTurnEventType =
  | "turn.started"
  | "thought"
  | "text"
  | "tool_start"
  | "tool_result"
  | "ask_questions"
  | "plan"
  | "summary"
  | "next_actions"
  | "execution.queued"
  | "execution.validating"
  | "execution.started"
  | "execution.log"
  | "execution.service_called"
  | "execution.service_completed"
  | "execution.workspace_updated"
  | "execution.completed"
  | "execution.failed"
  | "execution.cancelled"
  | "column.run.started"
  | "column.cell.started"
  | "column.cell.completed"
  | "column.cell.failed"
  | "column.run.progress"
  | "column.run.completed"
  | "context.compressed"
  | "compaction.scheduled"
  | "done"
  | "error"
  | string;

export interface AgentTurnEvent {
  type: AgentTurnEventType;
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
  conversation_id?: string | null;
  terminal?: boolean;
}

export interface AgentUIContextPayload {
  visible_panel?: string | null;
  visible_workspace_id?: string | null;
  visible_table_id?: string | null;
  selected_row_key?: string | null;
}

export interface AgentTurnRequestPayload {
  message: string;
  conversation_id?: string | null;
  ui_context?: AgentUIContextPayload | null;
  tool_options?: Record<string, unknown>;
}

export type ChatBlock =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "thought"; text: string; streaming?: boolean }
  | { id: string; kind: "text"; text: string; streaming?: boolean }
  | {
      id: string;
      kind: "plan";
      title: string;
      summary: string;
      steps: string[];
      parameters?: Record<string, unknown>;
    }
  | {
      id: string;
      kind: "summary";
      title: string;
      summary: string;
      highlights: string[];
      metrics?: Record<string, unknown>;
    }
  | {
      id: string;
      kind: "questions";
      title: string;
      questions: Array<{
        id: string;
        prompt: string;
        allow_free_text?: boolean;
        options?: string[];
      }>;
    }
  | { id: string; kind: "next_actions"; actions: string[] }
  | {
      id: string;
      kind: "tool";
      tool: string;
      phase: "start" | "result";
      detail?: string;
    }
  | {
      id: string;
      kind: "activity";
      steps: Array<{
        id: string;
        tool: string;
        callId?: string;
        phase: "start" | "result";
        detail?: string;
      }>;
    }
  | { id: string; kind: "status"; text: string }
  | { id: string; kind: "error"; text: string }
  | {
      id: string;
      kind: "execution";
      executionId: string;
      status:
        | "queued"
        | "validating"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
        | "partial";
      message: string;
      logs: string[];
      serviceCalls: string[];
      /** Program return value from execution.completed — shown as a simple table/JSON. */
      returnValue?: unknown;
      /** TypeScript source the sandbox validated/ran. */
      code?: string;
      errorCode?: string;
      errorMessage?: string;
      issues?: unknown[];
    };

export interface AgentConversationSummary {
  conversation_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  last_message_at: string;
}

export interface AgentConversationMessage {
  id: number;
  role: string;
  content: string;
  event_type?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface AgentConversationDetail extends AgentConversationSummary {
  messages: AgentConversationMessage[];
}

export interface AgentWorkspaceTableState {
  id: number;
  public_id: string;
  workspace_id: string;
  slug: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  column_order: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AgentWorkspaceTableSummary {
  table: AgentWorkspaceTableState;
  row_count: number;
}

export interface AgentWorkspaceColumn {
  id: number;
  slug: string;
  name: string;
  column_type: string;
  output_schema?: Record<string, unknown> | null;
  main_field?: string | null;
  required: boolean;
  position: number;
  config: Record<string, unknown>;
}

export interface AgentWorkspaceRow {
  id: number;
  source_key: string;
  qualification_status: string;
  values: Record<string, unknown>;
  cells: Record<string, AgentWorkspaceCellState>;
}

export interface AgentWorkspaceCellState {
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled" | "skipped" | "stale";
  attempts: number;
  error?: Record<string, unknown> | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface AgentColumnRunProgress {
  batchId?: string;
  batchStatus?: AgentColumnBatchStatusValue;
  tableSlug: string;
  columns: string[];
  processedCells: number;
  totalCells: number;
  cellsCompleted: number;
  cellsFailed: number;
  cellsCancelled: number;
  cellsSkipped: number;
  status: "running" | "completed";
}

export type AgentColumnBatchStatusValue =
  | "queued"
  | "running"
  | "complete"
  | "partial"
  | "failed"
  | "cancelled";

export interface AgentColumnBatchStatus {
  batch_id: string;
  execution_id: string;
  workspace_id: string;
  table_id: string;
  table_slug: string;
  status: AgentColumnBatchStatusValue;
  requested_columns: string[];
  cells_total: number;
  cells_completed: number;
  cells_failed: number;
  cells_cancelled: number;
  cells_skipped: number;
  still_running: number;
  latest_event_id: number;
  run_result: Record<string, unknown>;
  queued_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  updated_at: string;
}

export interface AgentColumnBatchEvent {
  id: number;
  batch_id: string;
  type: AgentTurnEventType;
  data: Record<string, unknown>;
  created_at: string;
}

export interface AgentColumnBatchEventPage {
  events: AgentColumnBatchEvent[];
  next_after: number;
  terminal: boolean;
}

export interface AgentWorkspaceTablePage {
  table: AgentWorkspaceTableState;
  columns: AgentWorkspaceColumn[];
  rows: AgentWorkspaceRow[];
  total: number;
  limit: number;
  offset: number;
}
