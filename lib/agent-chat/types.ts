export type AgentSignal = {
  id?: string | number;
  story_id?: string | number;
  video_id?: string | number;
  platform?: string;
  source?: string;
  title?: string;
  url?: string;
  hn_url?: string;
  permalink?: string;
  external_url?: string;
  snippet?: string;
  text?: string;
  content?: string;
  body?: string;
  description?: string;
  author?: string | null;
  author_name?: string | null;
  subreddit?: string | null;
  subx?: string | null;
  post_id?: string | null;
  tweet_id?: string | number | null;
  status_id?: string | number | null;
  overall_score?: number;
  category?: string;
  reason?: string;
  match_reason?: string;
  suggested_action?: string;
  query?: string;
  published_at?: string | number | null;
  created_at?: string | number | null;
  matched_terms?: string[];
  matched_keywords?: string[];
  sentiment?: string;
  signal_strength?: string;
  noise_type?: string | null;
  is_actionable?: boolean;
  metadata?: Record<string, unknown>;
  score?: number;
  relevance?: number;
  likes?: number | string | null;
  retweets?: number | string | null;
  replies?: number | string | null;
  author_id?: string | number | null;
  author_username?: string | null;
  channel?: string | null;
  channel_id?: string | number | null;
  channel_name?: string | null;
  time?: number;
  relevant_comment_ids?: number[];
  view_count?: number | string | null;
  like_count?: number | string | null;
  comment_count?: number | string | null;
  duration?: string | number | null;
  thumbnail_url?: string | null;
};

export type AgentArtifactRow = {
  item_id: string;
  fields: Record<string, unknown>;
};

export type AgentWorkspaceRow = {
  row_key: string;
  source?: string | null;
  fields: Record<string, unknown>;
  raw_signal?: AgentSignal | null;
};

export type AgentWorkspaceArtifact = {
  artifact_id?: string;
  version?: number;
  title?: string;
  artifact_type?: string;
  summary?: string;
  schema?: {
    columns?: ResearchPlanColumn[];
    [key: string]: unknown;
  } | null;
  columns?: ResearchPlanColumn[];
  rows?: AgentWorkspaceRow[];
  source_coverage?: Record<string, unknown> | null;
  query_history?: Record<string, unknown>[] | null;
  view_state?: Record<string, unknown> | null;
};

export type AgentToolCall = {
  name: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type AgentRunTraceItem = {
  sequence: number;
  kind:
    | "progress"
    | "tool_call"
    | "tool_result"
    | "quality"
    | "repair"
    | "complete"
    | "error";
  message: string;
  status?: string;
  tool?: string | null;
  source?: string | null;
  query?: string | null;
  count?: number | null;
  step?: number | null;
  phase?:
    | "planning"
    | "search"
    | "evaluation"
    | "repair"
    | "synthesis"
    | "complete"
    | null;
  operation_id?: string | null;
  duration_ms?: number | null;
  failed?: boolean;
  created_at: string;
};

export type AgentTokenUsage = {
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  cached_input_tokens: number;
  total_tokens: number;
  /** Tokens occupying the window on the most recent model call. */
  context_tokens: number;
  context_window: number;
  model_id: string;
  /** Empty when the active model has no entry in the pricing catalog. */
  pricing_model_id: string;
  llm_calls: number;
};

export type AgentExecutionMemory = {
  sources_searched: string[];
  queries_tried: string[];
  result_count: number;
  tool_call_count: number;
  repairs_attempted: number;
  stop_reason?: string | null;
  outcome: string;
};

export type AgentRunResponse = {
  answer: string;
  chat_summary?: string;
  skill_used: string;
  tool_calls: AgentToolCall[];
  signals: AgentSignal[];
  artifact_id?: string;
  artifact_version?: number;
  workspace?: AgentWorkspaceArtifact | null;
  run_id?: string;
  reasoning?: string;
  activity_trace?: AgentRunTraceItem[];
  execution_memory?: AgentExecutionMemory | null;
  token_usage?: AgentTokenUsage | null;
  steps_taken?: number;
};

export type AgentStreamEvent = {
  status?: string;
  message?: string;
  data?: unknown;
  type?: string;
  mention?: AgentSignal;
  platform?: string;
  tool?: string;
  label?: string;
  detail?: string;
  count?: number;
  summary?: string;
};

export type AgentTurnEvent = {
  type?:
    | "conversation.ready"
    | "conversation.compaction.started"
    | "turn.routed"
    | "context.answer.started"
    | "context.answer.completed"
    | "plan.started"
    | "plan.created"
    | "plan.approved"
    | "plan.rejected"
    | "run.started"
    | "run.status"
    | "run.usage"
    | "tool.called"
    | "tool.completed"
    | "quality.checked"
    | "repair.started"
    | "answer.completed"
    | "artifact.update_started"
    | "artifact.updated"
    | "artifact.conflict"
    | "clarification.requested"
    | "turn.failed";
  mode?: AgentRuntimeMode;
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
  conversation_id?: string | null;
  terminal?: boolean;
};

export type AgentRuntimeMode =
  | "chat"
  | "planning"
  | "awaiting_approval"
  | "executing";

export type PlanApproval = {
  plan_id: string;
  version: number;
  decision: "approve" | "reject";
  plan: ResearchPlan;
};

export type AgentTurnRequest = {
  message: string;
  conversation_id?: string | null;
  ui_context?: {
    visible_panel?: "chat" | "plan" | "results";
    visible_artifact_id?: string;
    selected_row_key?: string;
  };
  plan_approval?: PlanApproval;
  approved_keywords?: string[];
  tool_options?: Record<string, unknown>;
};

export type AgentConversationMessage = {
  id: number;
  role: string;
  content: string;
  event_type?: string | null;
  payload?: AgentTurnEvent | null;
  created_at: string;
};

export type AgentConversationDetail = {
  conversation_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  last_message_at: string;
  messages: AgentConversationMessage[];
};

export type AgentConversationSummary = Omit<AgentConversationDetail, "messages">;

export type AgentArtifactRecordRow = {
  id: number;
  row_key: string;
  source?: string | null;
  fields: Record<string, unknown>;
  raw_signal?: AgentSignal | null;
  created_at: string;
};

export type AgentArtifactDetail = {
  artifact_id: string;
  root_artifact_id: string;
  parent_artifact_id?: string | null;
  conversation_id: string;
  plan_id?: string | null;
  run_id?: string | null;
  activity_trace?: AgentRunTraceItem[];
  version: number;
  title: string;
  artifact_type: string;
  schema?: Record<string, unknown> | null;
  workspace?: AgentWorkspaceArtifact | null;
  summary: string;
  source_coverage?: Record<string, unknown> | null;
  query_history?: Record<string, unknown>[] | null;
  operation?: Record<string, unknown> | null;
  view_state?: Record<string, unknown> | null;
  row_count: number;
  created_at: string;
  updated_at?: string | null;
  rows: AgentArtifactRecordRow[];
};

export type ResearchPlanSource = {
  source: string;
  query: string;
  recency_days: number;
  limit: number;
  rationale?: string;
};

export type ResearchPlanColumn = {
  key: string;
  label: string;
  type: "text" | "number" | "score" | "date" | "url" | "badge";
  description?: string;
};

export type ResearchPlanStep = {
  id: string;
  title: string;
  description: string;
  kind: "search" | "quality" | "enrich" | "present";
  source?: string | null;
};

export type ResearchPlanScoutFinding = {
  source: string;
  candidates_checked: number;
  observation: string;
  sample_titles: string[];
};

export type ResearchPlan = {
  plan_id: string;
  version: number;
  status: "draft" | "approved" | "running" | "complete" | "rejected";
  message: string;
  skill: string;
  title: string;
  objective: string;
  overview: string;
  sources: ResearchPlanSource[];
  intent: string;
  output: {
    table_name: string;
    columns: ResearchPlanColumn[];
  };
  steps: ResearchPlanStep[];
  scout_findings: ResearchPlanScoutFinding[];
  generation_mode: "llm";
  warnings: string[];
  requested_count?: number | null;
};

export type AgentKeywordPlan = {
  message: string;
  extracted_keywords: string[];
  suggested_keywords: string[];
};

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      data?: AgentRunResponse;
      keywordPlan?: AgentKeywordPlan;
      researchPlan?: ResearchPlan;
      resultTitle?: string;
      reasoning?: string;
      activityTrace?: AgentRunTraceItem[];
      artifactId?: string;
    };

export type AgentMode = "auto" | "reddit" | "hackernews" | "x" | "mention";

export type AgentWorkspaceEvent = {
  id: string;
  type:
    | "thinking"
    | "progress"
    | "tool_started"
    | "mention_found"
    | "tool_completed"
    | "completed"
    | "cancelled"
    | "error";
  label: string;
  detail?: string;
  platform?: string;
  query?: string;
  count?: number;
  phase?: AgentRunTraceItem["phase"];
  operationId?: string;
  durationMs?: number;
  failed?: boolean;
  signalKey?: string;
  createdAt: number;
};

export const EXAMPLE_PROMPTS = [
  "Track Apollo complaints from the last 30 days",
  "Track invoice automation mentions from the last 60 days",
  "Find Reddit posts about customer support automation for SaaS teams",
  "Find HN discussions about observability tools for startups",
];
