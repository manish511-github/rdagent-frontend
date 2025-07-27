"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchAgentPosts,
  loadMoreAgentPosts,
  setFilters,
  resetPosts,
  selectPosts,
  selectPagination,
  selectFilters,
  selectHasNextPage,
  selectIsLoadingMore,
  selectCurrentPage,
  selectAgentStatus,
  DisplayPost,
  PostStatus,
} from "@/store/features/agentSlice";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfinitePostsListProps {
  agentId: string;
  searchQuery: string;
  sortBy: string;
  statusFilter: string;
  selectedContentId: string | null;
  onSelectContent: (id: string) => void;
  onSelectedPostChange?: (post: DisplayPost | null) => void;
  showDetailPane: boolean;
  getStatusBadgeClass: (status: PostStatus) => string;
  getStatusLabel: (status: PostStatus) => string;
  ContentListItem: React.ComponentType<{
    item: DisplayPost;
    isSelected: boolean;
    onSelect: (id: string) => void;
    showDetailPane: boolean;
    getStatusBadgeClass: (status: PostStatus) => string;
    getStatusLabel: (status: PostStatus) => string;
  }>;
}

export function InfinitePostsList({
  agentId,
  searchQuery,
  sortBy,
  statusFilter,
  selectedContentId,
  onSelectContent,
  onSelectedPostChange,
  showDetailPane,
  getStatusBadgeClass,
  getStatusLabel,
  ContentListItem,
}: InfinitePostsListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Redux selectors
  const posts = useSelector(selectPosts);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const hasNextPage = useSelector(selectHasNextPage);
  const isLoadingMore = useSelector(selectIsLoadingMore);
  const agentStatus = useSelector((state: RootState) => state.agent.status); // Use the loading status, not agent status
  const currentPage = useSelector(selectCurrentPage);

  // Map sortBy values to backend format
  const mapSortBy = (sort: string) => {
    switch (sort) {
      case "relevance":
        return { sort_by: "combined_relevance", order: "desc" };
      case "newest":
        return { sort_by: "created_utc", order: "desc" };
      case "oldest":
        return { sort_by: "created_utc", order: "asc" };
      case "most_comments":
        return { sort_by: "comment_count", order: "desc" };
      case "least_comments":
        return { sort_by: "comment_count", order: "asc" };
      case "most_upvotes":
        return { sort_by: "upvotes", order: "desc" };
      case "least_upvotes":
        return { sort_by: "upvotes", order: "asc" };
      default:
        return { sort_by: "combined_relevance", order: "desc" };
    }
  };

  const { sort_by, order } = mapSortBy(sortBy);

  // Loading and error states
  const isLoading = agentStatus === "loading" && posts.length === 0;
  const isError = agentStatus === "failed";
  const error = { message: "Failed to load posts" }; // Simplified error for now

  // Apply local filtering and sorting to posts
  const filteredAndSortedPosts = React.useMemo(() => {
    let processedPosts = [...posts];

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      processedPosts = processedPosts.filter(
        (post) => post.status === statusFilter
      );
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      processedPosts = processedPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.author.toLowerCase().includes(searchLower) ||
          post.tag.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    processedPosts.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sort_by) {
        case "combined_relevance":
          valueA = a.relevance;
          valueB = b.relevance;
          break;
        case "created_utc":
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        case "comment_count":
          valueA = a.comments;
          valueB = b.comments;
          break;
        case "upvotes":
          valueA = a.upvotes;
          valueB = b.upvotes;
          break;
        default:
          valueA = a.relevance;
          valueB = b.relevance;
      }

      // Handle null/undefined values
      if (valueA == null) valueA = 0;
      if (valueB == null) valueB = 0;

      // Apply sort order
      if (order === "desc") {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });

    return processedPosts;
  }, [posts, statusFilter, searchQuery, sort_by, order]);

  // Update Redux filters for consistency (but don't trigger API calls)
  useEffect(() => {
    dispatch(
      setFilters({
        sortBy: sort_by,
        order,
        statusFilter,
        searchQuery,
      })
    );
  }, [dispatch, sort_by, order, statusFilter, searchQuery]);

  // Initial data fetch (only when no posts exist)
  useEffect(() => {
    if (!agentId || posts.length > 0) return;

    console.log("Initial fetch - no posts exist");
    dispatch(
      fetchAgentPosts({
        agentId,
        sortBy: sort_by,
        order,
        statusFilter: "all", // Always fetch all posts initially
        searchQuery: "", // No search filter on initial fetch
      })
    );
  }, [dispatch, agentId, posts.length, sort_by, order]);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Load more when the load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isLoadingMore && agentId) {
      dispatch(
        loadMoreAgentPosts({
          agentId,
          currentPage,
          sortBy: "combined_relevance", // Always use relevance for backend pagination
          order: "desc",
          statusFilter: "all", // Fetch all posts, filter locally
          searchQuery: "", // No search on backend, filter locally
        })
      );
    }
  }, [dispatch, inView, hasNextPage, isLoadingMore, agentId, currentPage]);

  // Auto-select first post when filtered posts change
  useEffect(() => {
    if (filteredAndSortedPosts.length > 0 && !selectedContentId) {
      onSelectContent(filteredAndSortedPosts[0].id);
    }
  }, [filteredAndSortedPosts, selectedContentId, onSelectContent]);

  // Update selected post data when selection changes
  useEffect(() => {
    const selectedPost = filteredAndSortedPosts.find(
      (post: DisplayPost) => post.id === selectedContentId
    );
    onSelectedPostChange?.(selectedPost || null);
  }, [filteredAndSortedPosts, selectedContentId, onSelectedPostChange]);

  const handleRetry = useCallback(() => {
    if (agentId) {
      dispatch(
        fetchAgentPosts({
          agentId,
          sortBy: "combined_relevance",
          order: "desc",
          statusFilter: "all",
          searchQuery: "",
        })
      );
    }
  }, [dispatch, agentId]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && agentId) {
      dispatch(
        loadMoreAgentPosts({
          agentId,
          currentPage,
          sortBy: "combined_relevance",
          order: "desc",
          statusFilter: "all",
          searchQuery: "",
        })
      );
    }
  }, [dispatch, hasNextPage, isLoadingMore, agentId, currentPage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-3">
          <Search className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-sm font-medium mb-1 text-red-600 dark:text-red-400">
          Error loading posts
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {error?.message || "Something went wrong"}
        </p>
        <button
          onClick={handleRetry}
          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (filteredAndSortedPosts.length === 0 && posts.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">
          No posts match your filters
        </h3>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  // Loading state when no posts at all
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-w-0 h-full overflow-y-auto">
      {/* Posts List */}
      <div className="w-full min-w-0">
        {filteredAndSortedPosts.map((item: DisplayPost, index: number) => (
          <ContentListItem
            key={`${item.id}-${index}`}
            item={item}
            isSelected={item.id === selectedContentId}
            onSelect={onSelectContent}
            showDetailPane={showDetailPane}
            getStatusBadgeClass={getStatusBadgeClass}
            getStatusLabel={getStatusLabel}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-800"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more posts...</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End of List Indicator */}
      {!hasNextPage && filteredAndSortedPosts.length > 0 && (
        <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-xs text-muted-foreground">
            You've reached the end of the list
          </span>
        </div>
      )}
    </div>
  );
}
