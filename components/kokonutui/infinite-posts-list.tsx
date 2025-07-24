"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteAgentPosts } from "@/hooks/useInfiniteAgentPosts";
import { DisplayPost, PostStatus } from "@/store/features/agentSlice";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const {
    posts,
    isLoading,
    isError,
    error,
    hasMore,
    loadMore,
    isLoadingMore,
    refetch,
  } = useInfiniteAgentPosts({
    agentId,
    sortBy: sort_by,
    order,
    statusFilter,
    searchQuery,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Load more when the load more element comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoadingMore, loadMore]);

  // Auto-select first post when posts change
  useEffect(() => {
    if (posts.length > 0 && !selectedContentId) {
      onSelectContent(posts[0].id);
    }
  }, [posts, selectedContentId, onSelectContent]);

  // Update selected post data when selection changes
  useEffect(() => {
    const selectedPost = posts.find((post) => post.id === selectedContentId);
    onSelectedPostChange?.(selectedPost || null);
  }, [posts, selectedContentId, onSelectedPostChange]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

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
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No posts found</h3>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-w-0 h-full overflow-hidden">
      {/* Posts List */}
      <div className="w-full min-w-0">
        {posts.map((item, index) => (
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
      {hasMore && (
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
              onClick={() => loadMore()}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End of List Indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-xs text-muted-foreground">
            You've reached the end of the list
          </span>
        </div>
      )}
    </div>
  );
}
