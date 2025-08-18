import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import Cookies from "js-cookie";
import { createSelector } from "@reduxjs/toolkit";
import { fetchAgentResults, AgentPostsParams } from "../../lib/api";
import { getApiUrl } from "../../lib/config";
import type { ApiAgent } from "../slices/agentsSlice";

// Types
export type AgentType = "twitter" | "reddit" | "hackernews" | "mixed";

export type PostStatus =
  | "pending"
  | "processed"
  | "failed"
  | "approved"
  | "needs_review"
  | "discarded"
  | "escalated";

export interface TwitterPost {
  tweet_id: string;
  text: string;
  user_name: string;
  user_screen_name: string;
  retweet_count: number;
  favorite_count: number;
  relevance_score: number;
  hashtags: string[];
  created_at: string;
  status: PostStatus;
}

export interface RedditPost {
  subreddit: string;
  post_id: string;
  post_title: string;
  post_body: string;
  post_url: string;
  post_author: string;
  upvotes: number;
  comment_count: number;
  created_utc: string;
  execution_id: number;
  relevance_score: number;
  keyword_relevance: number;
  semantic_relevance: number;
  combined_relevance: number;
  llm_relevance: number | null;
  matched_query: string;
  sort_method: string | null;
  comment_draft: string | null;
  status: PostStatus;
  analysis_created_at: string;
}

export interface ContentItem {
  id: string;
  platform: string;
  subreddit: string;
  author: string;
  time: string;
  status: string;
  title: string;
  content: string;
  tag: string;
  relevance: number;
  sentiment: string;
  keywords: string[];
  intent: string;
  aiResponse: string;
  aiConfidence: number;
  comments: number;
  upvotes: number;
  url: string;
  post_id?: string;
  post_title?: string;
  post_body?: string;
  post_url?: string;
  relevance_score?: number;
  sentiment_score?: number | null;
  comment_draft?: string | null;
  created_at?: string;
}

export interface AgentData {
  id: string;
  agent_name: string;
  platform: AgentType;
  description: string;
  goals: string[];
  status: "active" | "paused" | "completed" | "error";
  created_at: string;
  updated_at: string;
  results: {
    posts?: RedditPost[];
    twitter_posts?: TwitterPost[];
  };
}

export interface AgentState {
  agentId: string | null;
  name: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  agentType: AgentType;
  redditPosts: RedditPost[];
  twitterPosts: TwitterPost[];
  agentStatus: "active" | "paused" | "completed" | "error";
  lastUpdated: string | null;
  agentData: AgentData | null;
  // Infinite scroll state
  posts: DisplayPost[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    isLoadingMore: boolean;
    totalCount: number;
    limit: number;
  };
  filters: {
    sortBy: string;
    order: string;
    statusFilter: string;
    searchQuery: string;
  };
  // Post-specific reply drafts
  replyDrafts: Record<
    string,
    {
      content: string;
      generating: boolean;
    }
  >;
  // Details view/state
  agentDetails: AgentDetails | null;
  agentDetailsStatus: "idle" | "loading" | "succeeded" | "failed";
}

// Unified interface for displaying posts in the UI
export interface DisplayPost {
  id: string;
  platform: "reddit" | "twitter" | "hackernews";
  author: string;
  time: string;
  status: PostStatus;
  title: string;
  content: string;
  tag: string;
  relevance: number;
  sentiment: string;
  keywords: string[];
  intent: string;
  aiResponse: string;
  aiConfidence: number;
  comments: number;
  upvotes: number;
  url: string;
  created_at: string;
  subreddit?: string;
}

const initialState: AgentState = {
  agentId: null,
  name: "",
  status: "idle",
  error: null,
  agentType: "mixed",
  redditPosts: [],
  twitterPosts: [],
  agentStatus: "active",
  lastUpdated: null,
  agentData: null,
  // Infinite scroll state
  posts: [],
  pagination: {
    currentPage: 1,
    hasNextPage: false,
    isLoadingMore: false,
    totalCount: 0,
    limit: 50,
  },
  filters: {
    sortBy: "combined_relevance", // This will be set by component on first load
    order: "desc",
    statusFilter: "all",
    searchQuery: "",
  },
  // Post-specific reply drafts
  replyDrafts: {},
  // Details state
  agentDetails: null,
  agentDetailsStatus: "idle",
};

interface AgentConnection {
  eventSource: EventSource;
}

// Details types aligned with backend GET /agents/{agent_id}/details
export interface AgentScheduleDetails {
  schedule_type: string; // daily | weekly | monthly | cron | manual
  schedule_time: string | null; // ISO or time string
  days_of_week: string[] | null;
  day_of_month: number | null;
  id?: number;
  agent_id?: number;
  created_at?: string;
}

export interface AgentDetails {
  id: number;
  agent_name: string;
  description: string | null;
  agent_platform: string; // reddit | twitter | ...
  agent_status: string; // active | paused | etc
  goals: string; // e.g., lead_generation
  instructions: string | null;
  expectations: string | null;
  agent_keywords: string[];
  project_id: string;
  mode: string; // copilot | assisted | autonomous
  review_minutes: number | null;
  oauth_account_id: string | number | null;
  advanced_settings: Record<string, any>;
  platform_settings: Record<string, any>;
  created_at: string;
  last_run: string | null;
  schedule: AgentScheduleDetails | null;
}

// Helper function to transform posts to DisplayPost format
const transformPostsToDisplayPosts = (
  posts: any[],
  platform: string
): DisplayPost[] => {
  return posts.map((post: any, index: number) => {
    if (post.post_id || platform === "reddit") {
      // Reddit post
      return {
        id: post.post_id || `reddit_${index}`,
        platform: "reddit" as const,
        author: post.post_author || "Unknown",
        time: post.created_utc
          ? new Date(post.created_utc).toLocaleString()
          : "Unknown",
        status: post.status || "processed",
        title: post.post_title || "",
        content: post.post_body || "",
        tag: post.subreddit || "",
        relevance: Math.round((post.combined_relevance || 0) * 100),
        sentiment: "neutral",
        keywords: post.matched_query ? [post.matched_query] : [],
        intent: "Unknown",
        aiResponse: post.comment_draft || "",
        aiConfidence: 0,
        comments: post.comment_count || 0,
        upvotes: post.upvotes || 0,
        url: post.post_url || "",
        created_at: post.created_utc || "",
        subreddit: post.subreddit || "",
      };
    } else if (post.tweet_id || platform === "twitter") {
      // Twitter post
      return {
        id: post.tweet_id || `twitter_${index}`,
        platform: "twitter" as const,
        author: post.user_name || "Unknown",
        time: post.created_at
          ? new Date(post.created_at).toLocaleString()
          : "Unknown",
        status: post.status || "processed",
        title: "",
        content: post.text || "",
        tag: post.hashtags?.join(", ") || "",
        relevance: post.relevance_score || 0,
        sentiment: "neutral",
        keywords: post.hashtags || [],
        intent: "Unknown",
        aiResponse: "",
        aiConfidence: 0,
        comments: 0,
        upvotes: post.favorite_count || 0,
        url: `https://twitter.com/${post.user_screen_name}/status/${post.tweet_id}`,
        created_at: post.created_at || "",
      };
    } else if (platform === "hackernews") {
      // Hacker News normalized post (expects HN-like fields)
      return {
        id: String(post.id ?? `hn_${index}`),
        platform: "hackernews" as const,
        author: post.by || "Unknown",
        time: post.time ? new Date(post.time * 1000).toLocaleString() : "Unknown",
        status: "processed",
        title: post.title || "",
        content: post.text || post.story_text || post.comment_text || "",
        tag: ((): string => { try { return new URL(post.url).hostname; } catch { return "news.ycombinator.com"; } })(),
        relevance: post.score || 0,
        sentiment: "neutral",
        keywords: [],
        intent: "Unknown",
        aiResponse: "",
        aiConfidence: 0,
        comments: post.descendants || 0,
        upvotes: post.score || 0,
        url: post.url || `https://news.ycombinator.com/item?id=${post.id}`,
        created_at: post.time ? String(post.time) : "",
      };
    }

    // Fallback
    return {
      id: `unknown_${index}`,
      platform: "reddit" as const,
      author: "Unknown",
      time: "Unknown",
      status: "processed" as const,
      title: "Unknown post",
      content: "",
      tag: "",
      relevance: 0,
      sentiment: "neutral",
      keywords: [],
      intent: "Unknown",
      aiResponse: "",
      aiConfidence: 0,
      comments: 0,
      upvotes: 0,
      url: "",
      created_at: "",
    };
  });
};

// Thunks for infinite scroll
export const fetchAgentPosts = createAsyncThunk(
  "agent/fetchPosts",
  async (
    {
      agentId,
      sortBy,
      order,
      statusFilter,
      searchQuery,
    }: {
      agentId: string;
      sortBy?: string;
      order?: string;
      statusFilter?: string;
      searchQuery?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const params: AgentPostsParams = {
        agentId,
        page: 1,
        limit: 50,
        sort_by: sortBy || "combined_relevance",
        order: order || "desc",
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      };

      const response = await fetchAgentResults(params);

      // Transform posts to DisplayPost format
      const transformedPosts = transformPostsToDisplayPosts(
        response.data,
        "reddit"
      );

      return {
        posts: transformedPosts,
        hasNextPage: response.hasNextPage,
        totalCount: response.totalCount || 0,
        currentPage: 1,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch agent posts"
      );
    }
  }
);

export const loadMoreAgentPosts = createAsyncThunk(
  "agent/loadMorePosts",
  async (
    {
      agentId,
      currentPage,
      sortBy,
      order,
      statusFilter,
      searchQuery,
    }: {
      agentId: string;
      currentPage: number;
      sortBy: string;
      order: string;
      statusFilter: string;
      searchQuery: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const params: AgentPostsParams = {
        agentId,
        page: currentPage + 1,
        limit: 50,
        sort_by: sortBy,
        order,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      };

      const response = await fetchAgentResults(params);

      // Transform posts to DisplayPost format
      const transformedPosts = transformPostsToDisplayPosts(
        response.data,
        "reddit"
      );

      return {
        posts: transformedPosts,
        hasNextPage: response.hasNextPage,
        totalCount: response.totalCount || 0,
        currentPage: currentPage + 1,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to load more posts"
      );
    }
  }
);

// Thunks
export const fetchAgentData = createAsyncThunk(
  "agent/fetchData",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      console.log("Fetching agent data for agentId:", agentId);
      const idNum = Number(agentId);
      if (Number.isNaN(idNum)) {
        throw new Error("Invalid agentId");
      }

      const response = await fetch(getApiUrl(`agents/${idNum}/results`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch agent data");
      }

      const data = await response.json();
      const agentData = data[0]; // Get the first item from the response array

      console.log("Agent Data:", agentData); // Debug log
      console.log("Agent Platform:", agentData.results?.agent_platform); // Debug log

      // Determine agent type first
      let agentType: AgentType = "mixed";
      if (agentData.results?.agent_platform === "twitter") {
        agentType = "twitter";
      } else if (agentData.results?.agent_platform === "reddit") {
        agentType = "reddit";
      } else if (agentData.results?.agent_platform === "hackernews") {
        agentType = "hackernews";
      }

      // Transform posts based on agent type
      let transformedRedditPosts: RedditPost[] = [];
      let transformedTwitterPosts: TwitterPost[] = [];

      if (agentType === "twitter") {
        // For Twitter agents, transform posts into TwitterPost format
        transformedTwitterPosts =
          agentData.results?.posts?.map((post: any, index: number) => ({
            tweet_id: post.post_id || `twitter_${index}`,
            text: post.post_body || "",
            user_name: post.author || "Unknown",
            user_screen_name: post.author || "",
            retweet_count: post.upvotes || 0,
            favorite_count: post.comments || 0,
            relevance_score: post.relevance_score || 0,
            hashtags: post.keywords || [],
            created_at: post.created_at,
            status: post.status || "processed",
          })) || [];
      } else if (agentType === "reddit") {
        // For Reddit agents, use posts directly from API response
        transformedRedditPosts = agentData.results?.posts || [];
      }

      console.log("Determined Agent Type:", agentType); // Debug log
      console.log("Transformed Twitter Posts:", transformedTwitterPosts); // Debug log
      console.log("Transformed Reddit Posts:", transformedRedditPosts); // Debug log

      // Return the transformed data
      return {
        id: agentData.id,
        agent_id: agentData.agent_id,
        project_id: agentData.project_id,
        status: agentData.status,
        error: agentData.error,
        created_at: agentData.created_at,
        platform: agentType,
        posts: transformedRedditPosts,
        twitter_posts: transformedTwitterPosts,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch agent data"
      );
    }
  }
);

// Fetch agent details (/agents/{agent_id}/details)
export const fetchAgentDetails = createAsyncThunk(
  "agent/fetchDetails",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const idNum = Number(agentId);
      if (Number.isNaN(idNum)) {
        throw new Error("Invalid agentId");
      }

      const response = await fetch(getApiUrl(`agents/${idNum}/details`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(
          err.detail || err.message || "Failed to fetch agent details"
        );
      }

      const details: AgentDetails = await response.json();
      return details;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch agent details"
      );
    }
  }
);

// Update agent details (PUT /agents/{agent_id}) - payload inspired by create model
export type ApiAgentUpdate = Partial<ApiAgent> & {
  // allow status updates with details
  agent_status?: string;
  schedule?: Partial<AgentScheduleDetails> & { schedule_type?: string };
};

export const updateAgentDetails = createAsyncThunk(
  "agent/updateDetails",
  async (
    { agentId, updates }: { agentId: string; updates: ApiAgentUpdate },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const idNum = Number(agentId);
      if (Number.isNaN(idNum)) {
        throw new Error("Invalid agentId");
      }

      const response = await fetch(getApiUrl(`agents/${idNum}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(
          err.detail || err.message || "Failed to update agent details"
        );
      }

      return (await response.json()) as AgentDetails;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update agent details"
      );
    }
  }
);

export const connectToAgent = createAsyncThunk(
  "agent/connect",
  async (
    { projectId, agentId }: { projectId: string; agentId: string },
    { rejectWithValue }
  ) => {
    const token = Cookies.get("access_token");
    if (!token) {
      return rejectWithValue("Authentication required");
    }

    try {
      // Just return success, the EventSource will be handled in the component
      return { success: true };
    } catch (error) {
      return rejectWithValue("Failed to create connection");
    }
  }
);

export const updateAgentContent = createAsyncThunk(
  "agent/updateContent",
  async ({
    redditPosts,
    twitterPosts,
  }: {
    redditPosts: RedditPost[];
    twitterPosts: TwitterPost[];
  }) => {
    return { redditPosts, twitterPosts };
  }
);

export const updateAgentStatus = createAsyncThunk(
  "agent/updateStatus",
  async (
    {
      agentId,
      status,
    }: { agentId: string; status: "active" | "paused" | "completed" | "error" },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const idNum = Number(agentId);
      if (Number.isNaN(idNum)) {
        throw new Error("Invalid agentId");
      }

      const response = await fetch(getApiUrl(`agents/${idNum}/status`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update agent status"
      );
    }
  }
);

// Slice
const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setAgentId: (state, action) => {
      state.agentId = action.payload;
    },
    setAgentName: (state, action) => {
      state.name = action.payload;
    },
    setAgentStatus: (state, action) => {
      state.agentStatus = action.payload;
    },
    setAgentType: (state, action) => {
      state.agentType = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAgentData: (state, action) => {
      state.agentData = action.payload;
      state.name = action.payload.name;
      state.agentType = action.payload.platform;
      state.agentStatus = action.payload.status as
        | "active"
        | "paused"
        | "completed"
        | "error";
      state.lastUpdated = new Date().toISOString();
    },
    // Infinite scroll reducers
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPosts: (state) => {
      state.posts = [];
      state.pagination = {
        currentPage: 1,
        hasNextPage: false,
        isLoadingMore: false,
        totalCount: 0,
        limit: 50,
      };
    },
    // Reply draft management
    setReplyDraft: (state, action) => {
      const { postId, content } = action.payload;
      if (!state.replyDrafts[postId]) {
        state.replyDrafts[postId] = { content: "", generating: false };
      }
      state.replyDrafts[postId].content = content;
    },
    setReplyGenerating: (state, action) => {
      const { postId, generating } = action.payload;
      if (!state.replyDrafts[postId]) {
        state.replyDrafts[postId] = { content: "", generating: false };
      }
      state.replyDrafts[postId].generating = generating;
    },
    clearReplyDraft: (state, action) => {
      const { postId } = action.payload;
      if (state.replyDrafts[postId]) {
        state.replyDrafts[postId].content = "";
      }
    },
    removeReplyDraft: (state, action) => {
      const { postId } = action.payload;
      delete state.replyDrafts[postId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Infinite scroll reducers
      .addCase(fetchAgentPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.pagination.isLoadingMore = false;
      })
      .addCase(fetchAgentPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.pagination = {
          ...state.pagination,
          currentPage: action.payload.currentPage,
          hasNextPage: action.payload.hasNextPage,
          totalCount: action.payload.totalCount,
          isLoadingMore: false,
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAgentPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.pagination.isLoadingMore = false;
      })
      .addCase(loadMoreAgentPosts.pending, (state) => {
        state.pagination.isLoadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreAgentPosts.fulfilled, (state, action) => {
        state.posts = [...state.posts, ...action.payload.posts];
        state.pagination = {
          ...state.pagination,
          currentPage: action.payload.currentPage,
          hasNextPage: action.payload.hasNextPage,
          totalCount: action.payload.totalCount,
          isLoadingMore: false,
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadMoreAgentPosts.rejected, (state, action) => {
        state.pagination.isLoadingMore = false;
        state.error = action.payload as string;
      })
      // Existing reducers
      .addCase(fetchAgentData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAgentData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.agentId = action.payload.agent_id;
        state.agentType = action.payload.platform;
        state.redditPosts = action.payload.posts;
        state.twitterPosts = action.payload.twitter_posts;
        state.agentStatus = action.payload.status;
        state.lastUpdated = new Date().toISOString();
        state.agentData = {
          id: action.payload.id,
          agent_name: state.name,
          platform: action.payload.platform,
          description: "",
          goals: [],
          status: action.payload.status,
          created_at: action.payload.created_at,
          updated_at: new Date().toISOString(),
          results: {
            posts: action.payload.posts,
            twitter_posts: action.payload.twitter_posts,
          },
        };
      })
      .addCase(fetchAgentData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(connectToAgent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(connectToAgent.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(connectToAgent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to connect to agent";
      })
      .addCase(updateAgentContent.fulfilled, (state, action) => {
        state.redditPosts = action.payload.redditPosts;
        state.twitterPosts = action.payload.twitterPosts;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateAgentStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.agentStatus = action.payload.status;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateAgentStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Agent details reducers
      .addCase(fetchAgentDetails.pending, (state) => {
        state.agentDetailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchAgentDetails.fulfilled, (state, action) => {
        state.agentDetailsStatus = "succeeded";
        state.agentDetails = action.payload as AgentDetails;
      })
      .addCase(fetchAgentDetails.rejected, (state, action) => {
        state.agentDetailsStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateAgentDetails.pending, (state) => {
        // reuse status to show progress if needed
        state.agentDetailsStatus = "loading";
        state.error = null;
      })
      .addCase(updateAgentDetails.fulfilled, (state, action) => {
        state.agentDetailsStatus = "succeeded";
        state.agentDetails = action.payload as AgentDetails;
        // keep high-level name/status in sync if relevant
        if (state.agentDetails?.agent_name) {
          state.name = state.agentDetails.agent_name;
        }
        if (state.agentDetails?.agent_status) {
          state.agentStatus = state.agentDetails.agent_status as any;
        }
      })
      .addCase(updateAgentDetails.rejected, (state, action) => {
        state.agentDetailsStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setAgentId,
  setAgentName,
  setAgentStatus,
  setAgentType,
  clearError,
  updateAgentData,
  setFilters,
  resetPosts,
  setReplyDraft,
  setReplyGenerating,
  clearReplyDraft,
  removeReplyDraft,
} = agentSlice.actions;

// Selectors
export const selectAgentId = (state: RootState) => state.agent.agentId;
export const selectAgentName = (state: RootState) => state.agent.name;
export const selectAgentStatus = (state: RootState) => state.agent.status;
export const selectAgentError = (state: RootState) => state.agent.error;
export const selectAgentType = (state: RootState) => state.agent.agentType;
export const selectRedditPosts = (state: RootState) => state.agent.redditPosts;
export const selectTwitterPosts = (state: RootState) =>
  state.agent.twitterPosts;
export const selectAgentState = (state: RootState) => state.agent.agentStatus;
export const selectLastUpdated = (state: RootState) => state.agent.lastUpdated;
export const selectAgentData = (state: RootState) => state.agent.agentData;
export const selectAgentDetails = (state: RootState) =>
  state.agent.agentDetails;
export const selectAgentDetailsStatus = (state: RootState) =>
  state.agent.agentDetailsStatus;
export const selectPostById = (postId: string) => (state: RootState) => {
  const index = state.agent.redditPosts.findIndex(
    (post) => post.post_id === postId
  );
  if (index === -1) {
    return null;
  }
  return state.agent.redditPosts[index];
};

// Infinite scroll selectors
export const selectPosts = (state: RootState) => state.agent.posts;
export const selectPagination = (state: RootState) => state.agent.pagination;
export const selectFilters = (state: RootState) => state.agent.filters;
export const selectHasNextPage = (state: RootState) =>
  state.agent.pagination.hasNextPage;
export const selectIsLoadingMore = (state: RootState) =>
  state.agent.pagination.isLoadingMore;
export const selectCurrentPage = (state: RootState) =>
  state.agent.pagination.currentPage;
export const selectTotalCount = (state: RootState) =>
  state.agent.pagination.totalCount;

// Reply draft selectors
export const selectReplyDraft = (postId: string) => (state: RootState) =>
  state.agent.replyDrafts[postId]?.content || "";
export const selectReplyGenerating = (postId: string) => (state: RootState) =>
  state.agent.replyDrafts[postId]?.generating || false;
export const selectAllReplyDrafts = (state: RootState) =>
  state.agent.replyDrafts;

// Memoized selector for display posts (legacy - keeping for backward compatibility)
export const selectDisplayPosts = createSelector(
  [
    (state: RootState) => state.agent.redditPosts,
    (state: RootState) => state.agent.twitterPosts,
  ],
  (redditPosts, twitterPosts) => {
    const transformedRedditPosts = redditPosts.map((post) => ({
      id: `${post.post_id}`,
      platform: "reddit" as const,
      author: post.post_author,
      time: new Date(post.created_utc).toLocaleString(),
      status: post.status,
      title: post.post_title,
      content: post.post_body,
      tag: post.subreddit,
      relevance: Math.round(post.combined_relevance * 100),
      sentiment: "neutral",
      keywords: [post.matched_query].filter(Boolean),
      intent: "Unknown",
      aiResponse: post.comment_draft || "",
      aiConfidence: 0,
      comments: post.comment_count,
      upvotes: post.upvotes,
      url: post.post_url,
      created_at: post.created_utc,
      subreddit: post.subreddit,
    }));

    const transformedTwitterPosts = twitterPosts.map((post) => ({
      id: `twitter_${post.tweet_id}`,
      platform: "twitter" as const,
      author: post.user_name,
      time: new Date(post.created_at).toISOString(),
      status: post.status || "processed",
      title: "",
      content: post.text,
      tag: post.hashtags.join(", "),
      relevance: post.relevance_score,
      sentiment: "neutral",
      keywords: post.hashtags,
      intent: "Unknown",
      aiResponse: "",
      aiConfidence: 0,
      comments: 0,
      upvotes: post.favorite_count,
      url: `https://twitter.com/${post.user_screen_name}/status/${post.tweet_id}`,
      created_at: post.created_at,
    }));

    return [...transformedRedditPosts, ...transformedTwitterPosts];
  }
);
export default agentSlice.reducer;
