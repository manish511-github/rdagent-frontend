import Cookies from "js-cookie";
import { getApiUrl } from "./config";

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  nextPage?: number;
  totalCount?: number;
}

export interface AgentPostsParams {
  agentId: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: string;
  status?: string;
  search?: string;
}

export interface AgentResult {
  id: number;
  agent_id: number;
  project_id: number;
  status: string;
  results: {
    agent_platform: string;
    posts: any[];
    pagination?: {
      current_page: number;
      limit: number;
      total_posts: number;
      total_pages: number;
      has_next_page: boolean;
      has_previous_page: boolean;
      posts_in_current_page: number;
    };
  };
  error: string | null;
  created_at: string;
}

export async function fetchAgentResults({
  agentId,
  page = 1,
  limit = 50,
  sort_by = "relevance",
  order = "desc",
  status,
  search,
}: AgentPostsParams): Promise<PaginatedResponse<any>> {
  const token = Cookies.get("access_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by,
    order,
  });

  if (status && status !== "all") {
    searchParams.append("status", status);
  }

  // Note: Backend doesn't currently support search parameter
  // Search filtering will be handled client-side for now
  if (search && search.trim()) {
    searchParams.append("search", search);
  }

  const response = await fetch(
    getApiUrl(`agents/${agentId}/results?${searchParams}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch agent results");
  }

  const data: AgentResult[] = await response.json();
  const agentResult = data[0]; // Backend returns array with single result

  if (!agentResult || !agentResult.results) {
    return {
      data: [],
      hasNextPage: false,
      totalCount: 0,
    };
  }

  let posts = agentResult.results.posts || [];
  const pagination = agentResult.results.pagination;

  // Apply client-side search filtering if provided (fallback until backend implements search)
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(
      (post: any) =>
        post.post_title?.toLowerCase().includes(searchLower) ||
        post.post_body?.toLowerCase().includes(searchLower) ||
        post.text?.toLowerCase().includes(searchLower)
    );
  }

  // Get pagination info from backend response
  const hasNextPage = pagination?.has_next_page || false;
  const totalCount = pagination?.total_posts || 0;
  const currentPage = pagination?.current_page || page;

  return {
    data: posts,
    hasNextPage,
    nextPage: hasNextPage ? currentPage + 1 : undefined,
    totalCount,
  };
}

export async function fetchAgentInfo(agentId: string) {
  const token = Cookies.get("access_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(getApiUrl(`agents/${agentId}`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agent info");
  }

  return response.json();
}
