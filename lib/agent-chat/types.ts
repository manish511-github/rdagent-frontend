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

export type AgentToolCall = {
  name: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type AgentRunResponse = {
  answer: string;
  chat_summary?: string;
  skill_used: string;
  tool_calls: AgentToolCall[];
  signals: AgentSignal[];
  artifact_rows?: AgentArtifactRow[];
  artifact_id?: string;
  artifact_version?: number;
  run_id?: string;
  reasoning?: string;
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
    | "turn.routed"
    | "plan.started"
    | "plan.created"
    | "plan.approved"
    | "plan.rejected"
    | "run.started"
    | "run.status"
    | "tool.called"
    | "tool.completed"
    | "quality.checked"
    | "repair.started"
    | "answer.completed"
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
  version: number;
  title: string;
  artifact_type: string;
  schema?: Record<string, unknown> | null;
  summary: string;
  source_coverage?: Record<string, unknown> | null;
  query_history?: Record<string, unknown>[] | null;
  operation?: Record<string, unknown> | null;
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
    };

export type AgentMode = "auto" | "reddit" | "hackernews" | "x" | "mention";

export type AgentWorkspaceEvent = {
  id: string;
  type:
    | "thinking"
    | "tool_started"
    | "mention_found"
    | "tool_completed"
    | "completed"
    | "cancelled"
    | "error";
  label: string;
  detail?: string;
  platform?: string;
  count?: number;
  signalKey?: string;
  createdAt: number;
};

export const EXAMPLE_PROMPTS = [
  "Track Apollo complaints from the last 30 days",
  "Track invoice automation mentions from the last 60 days",
  "Find Reddit posts about customer support automation for SaaS teams",
  "Find HN discussions about observability tools for startups",
];
