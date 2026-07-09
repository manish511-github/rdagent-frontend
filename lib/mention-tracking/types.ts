export type AgentSignal = {
  platform?: string;
  source?: string;
  title?: string;
  url?: string;
  snippet?: string;
  text?: string;
  author?: string | null;
  author_name?: string | null;
  subreddit?: string | null;
  subx?: string | null;
  post_id?: string | null;
  overall_score?: number;
  category?: string;
  reason?: string;
  suggested_action?: string;
  query?: string;
  published_at?: string | null;
  created_at?: string | null;
  matched_terms?: string[];
  matched_keywords?: string[];
  sentiment?: string;
  signal_strength?: string;
  noise_type?: string | null;
  is_actionable?: boolean;
  metadata?: Record<string, unknown>;
  score?: number;
  relevance?: number;
  time?: number;
  relevant_comment_ids?: number[];
};

export type AgentToolCall = {
  name: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type AgentRunResponse = {
  answer: string;
  skill_used: string;
  tool_calls: AgentToolCall[];
  signals: AgentSignal[];
  reasoning?: string;
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

export type MentionKeywordPlan = {
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
      keywordPlan?: MentionKeywordPlan;
      reasoning?: string;
    };

export type AgentMode = "auto" | "reddit" | "hackernews" | "x" | "mention";

export type MentionWorkspaceEvent = {
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

export const SKILL_BY_MODE: Record<Exclude<AgentMode, "auto">, string> = {
  reddit: "reddit-lead-discovery",
  hackernews: "hackernews-lead-discovery",
  x: "x-lead-discovery",
  mention: "mention-tracking",
};
