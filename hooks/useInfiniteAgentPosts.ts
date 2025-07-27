import {
  useInfiniteQuery,
  QueryFunctionContext,
  InfiniteData,
} from "@tanstack/react-query";
import {
  fetchAgentResults,
  AgentPostsParams,
  PaginatedResponse,
} from "@/lib/api";
import { useMemo } from "react";

export interface UseInfiniteAgentPostsParams {
  agentId: string;
  sortBy?: string;
  order?: string;
  statusFilter?: string;
  searchQuery?: string;
  enabled?: boolean;
}

export function useInfiniteAgentPosts({
  agentId,
  sortBy = "relevance",
  order = "desc",
  statusFilter = "all",
  searchQuery = "",
  enabled = true,
}: UseInfiniteAgentPostsParams) {
  const queryKey = [
    "agent-posts",
    agentId,
    sortBy,
    order,
    statusFilter,
    searchQuery,
  ];

  const query = useInfiniteQuery<
    PaginatedResponse<any>,
    Error,
    PaginatedResponse<any>,
    [string, string, string, string, string, string],
    number
  >({
    queryKey: queryKey as [string, string, string, string, string, string],
    queryFn: async (
      ctx: QueryFunctionContext<
        [string, string, string, string, string, string],
        number
      >
    ) => {
      const pageParam = ctx.pageParam ?? 1;
      const params: AgentPostsParams = {
        agentId,
        page: pageParam,
        limit: 50,
        sort_by: sortBy,
        order,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      return fetchAgentResults(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<any>) => lastPage.nextPage,
    enabled: enabled && !!agentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transform the data into a flat array of posts
  const posts = useMemo(() => {
    const infiniteData = query.data as
      | InfiniteData<PaginatedResponse<any>, number>
      | undefined;
    return infiniteData?.pages.flatMap((page) => page.data) || [];
  }, [query.data]);

  // Transform posts to match DisplayPost interface
  const transformedPosts = useMemo(() => {
    return posts.map((post: any, index: number) => {
      if (post.post_id) {
        // Reddit post
        return {
          id: post.post_id,
          platform: "reddit" as const,
          author: "Unknown", // Reddit API doesn't provide author in this endpoint
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
          // Additional fields for detail view
          post_id: post.post_id,
          post_title: post.post_title,
          post_body: post.post_body,
          post_url: post.post_url,
        };
      } else if (post.tweet_id) {
        // Twitter post
        return {
          id: `twitter_${post.tweet_id}`,
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
      }

      // Fallback for unknown post type
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
  }, [posts]);

  return {
    posts: transformedPosts,
    ...query,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}
