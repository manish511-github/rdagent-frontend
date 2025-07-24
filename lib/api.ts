import Cookies from "js-cookie";

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

  const response = await fetch(
    `http://localhost:8000/agents/${agentId}/results?${searchParams}`,
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

  // Apply client-side search filtering if provided
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(
      (post: any) =>
        post.post_title?.toLowerCase().includes(searchLower) ||
        post.post_body?.toLowerCase().includes(searchLower) ||
        post.text?.toLowerCase().includes(searchLower)
    );
  }

  // Determine if there's a next page
  // Since backend doesn't provide total count, we assume there's more if we got the full limit
  const hasNextPage = posts.length === limit;

  return {
    data: posts,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : undefined,
    totalCount: posts.length,
  };
}

export async function fetchAgentInfo(agentId: string) {
  const token = Cookies.get("access_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`http://localhost:8000/agents/${agentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agent info");
  }

  return response.json();
}
