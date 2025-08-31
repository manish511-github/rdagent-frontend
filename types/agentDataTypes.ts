// OAuth Account interface for nested oauth_account object
export interface OAuthAccount {
  id: number;
  provider: string;
  provider_user_id: string;
  provider_username: string | null;
  image_url: string | null;
}

// Platform settings types
export type PlatformSettings = {
  reddit?: {
    subreddit: string;
    timeRange: string;
    relevanceThreshold: number;
    minUpvotes: number;
    monitorComments: boolean;
  };
  twitter?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    language: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  instagram?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  linkedin?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    industryFilter: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  tiktok?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    soundFilter: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
};

// Main Agent interface matching API response
export interface Agent {
  id: number;
  agent_name: string;
  description: string | null;
  agent_platform: string;
  agent_status: string;
  goals: string;
  instructions: string;
  expectations: string;
  agent_keywords: string[];
  project_id: string;
  mode: string | null;
  review_minutes: number;
  oauth_account_id: number;
  advanced_settings: Record<string, any>;
  platform_settings: PlatformSettings;
  created_at: string;
  last_run: string | null;
  oauth_account: OAuthAccount;
}

// API Agent interface for creating new agents
export interface ApiAgent {
  agent_name: string;
  description?: string | null;
  agent_platform: string;
  agent_status: string;
  goals: string;
  instructions: string;
  expectations: string;
  agent_keywords?: string[];
  project_id: string;
  mode?: string | null;
  review_minutes: number;
  oauth_account_id: number;
  advanced_settings?: Record<string, any>;
  platform_settings: PlatformSettings;
}

// Agent creation payload interface
export interface CreateAgentPayload {
  agent_name: string;
  description?: string | null;
  agent_platform: string;
  agent_status: string;
  goals: string;
  instructions: string;
  expectations: string;
  agent_keywords?: string[];
  project_id: string;
  mode?: string | null;
  review_minutes: number;
  oauth_account_id: number;
  advanced_settings?: Record<string, any>;
  platform_settings: PlatformSettings;
}

// Legacy HackerNews types (keeping for backward compatibility)
export interface HackerNewsPostType {
  story_id: string;
  title: string;
  text: string | null;
  url: string | null;
  score: number;
  time: number;
  created_utc: string;
  comment_count: number;
  children: number[];
  execution_id: number;
  relevance_score: number;
  keyword_relevance: number | null;
  semantic_relevance: number | null;
  combined_relevance: number | null;
  llm_relevance: number | null;
  matched_query: string | null;
  sort_method: string | null;
  summary: string | null;
  status: string;
  analysis_created_at: string;
  relevant_comments: HackerNewsCommentType[];
}

export interface HackerNewsCommentType {
  comment_id: string;
  text: string;
  time: number | null;
  created_utc: string | null;
  children: number[];
  execution_id: number;
  relevance_score: number | null;
  keyword_relevance: number | null;
  semantic_relevance: number | null;
  combined_relevance: number | null;
  llm_relevance: number | null;
  matched_query: string | null;
  sort_method: string | null;
  summary: string | null;
  status: string;
  analysis_created_at: string;
  relevant_comments: HackerNewsCommentType[];
}
