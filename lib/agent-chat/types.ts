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
