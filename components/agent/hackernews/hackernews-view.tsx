"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchAgentData,
  selectHackerNewsPosts,
  selectAgentType,
  selectAgentStatus,
} from "@/store/features/agentSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Hash,
  Clock,
  ExternalLink,
} from "lucide-react";

type HNStory = {
  id: number;
  title: string;
  url?: string | null;
  score?: number;
  time?: number; // epoch seconds
  by?: string;
  descendants?: number; // total comments
  // Optional pre-supplied children and relevant ids from upstream payload
  children?: number[];
  relevant_comment_ids?: number[];
  kids?: number[]; // Comments
};

type HNComment = {
  id: number;
  by?: string;
  time?: number;
  text?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
};

type Props = {
  agentId: string;
};

function formatTime(timestamp?: number) {
  if (!timestamp) return "";
  const d = new Date(timestamp * 1000);
  return d.toLocaleString();
}

function getDomain(url?: string | null) {
  if (!url) return "news.ycombinator.com";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

async function fetchItem(id: number): Promise<HNStory | HNComment> {
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`
  );
  if (!res.ok) throw new Error("Failed to fetch HN item");
  return res.json();
}

async function fetchCommentsBatch(
  ids: number[],
  cache: Map<number, HNComment>
): Promise<HNComment[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const cached = cache.get(id);
      if (cached) return cached;
      const data = (await fetchItem(id)) as HNComment;
      cache.set(id, data);
      return data;
    })
  );
  return results.filter((c) => c && !c.deleted && !c.dead);
}

function Comment({
  id,
  depth = 0,
  commentsMap,
  setCommentsMap,
  highlightIds,
  expandedCommentId,
  setExpandedCommentId,
}: {
  id: number;
  depth?: number;
  commentsMap: Map<number, HNComment>;
  setCommentsMap: React.Dispatch<React.SetStateAction<Map<number, HNComment>>>;
  highlightIds: Set<number>;
  expandedCommentId: number | null;
  setExpandedCommentId: (id: number | null) => void;
}) {
  const node = commentsMap.get(id);
  const [childLoadedCount, setChildLoadedCount] = React.useState(0);
  const [childIdsLoaded, setChildIdsLoaded] = React.useState<number[]>([]);
  const [loadingChildren, setLoadingChildren] = React.useState(false);
  const CHILD_PAGE = 5;
  const isHighlighted = highlightIds.has(id);
  const isExpanded = expandedCommentId === id;

  // Function to get preview text (first 2-3 lines)
  const getPreviewText = (text: string) => {
    const stripped = stripHtml(text);
    // Split by newlines and get first 3 non-empty lines
    const lines = stripped.split("\n").filter((line) => line.trim());
    const previewLines = lines.slice(0, 3);
    const preview = previewLines.join(" ");
    // Limit to 200 characters for preview
    return preview.length > 200 ? preview.substring(0, 200) + "..." : preview;
  };

  // Function to check if text needs expansion
  const needsExpansion = (text: string) => {
    const stripped = stripHtml(text);
    const lines = stripped.split("\n").filter((line) => line.trim());
    return lines.length > 3 || stripped.length > 200;
  };

  const loadMoreChildren = React.useCallback(async () => {
    if (!node?.kids || childLoadedCount >= node.kids.length) return;
    setLoadingChildren(true);
    try {
      const next = node.kids.slice(
        childLoadedCount,
        childLoadedCount + CHILD_PAGE
      );
      const fetched = await fetchCommentsBatch(
        next,
        commentsMap as Map<number, HNComment>
      );
      setCommentsMap((prev) => {
        const nextMap = new Map(prev);
        fetched.forEach((c) => nextMap.set(c.id, c));
        return nextMap;
      });
      setChildIdsLoaded((prev) => [...prev, ...fetched.map((c) => c.id)]);
      setChildLoadedCount((n) => n + next.length);
    } finally {
      setLoadingChildren(false);
    }
  }, [node, childLoadedCount, commentsMap, setCommentsMap]);

  React.useEffect(() => {
    if (isExpanded && node?.kids && childLoadedCount === 0) {
      loadMoreChildren();
    }
  }, [isExpanded, node, childLoadedCount, loadMoreChildren]);

  if (!node) return null;

  const commentText = node.text || "";
  const hasMoreText = needsExpansion(commentText);
  const previewText = getPreviewText(commentText);

  return (
    <div
      id={`c-${id}`}
      className={cn(
        "mt-3 rounded-lg border border-gray-100 dark:border-gray-800 max-w-full",
        isHighlighted &&
          "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      )}
      style={{ marginLeft: depth * 16 }}
    >
      {/* Comment Header */}
      <div
        className={cn(
          "px-4 py-3 border-b border-gray-100 dark:border-gray-800",
          isHighlighted && "border-amber-200 dark:border-amber-800"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  {node.by ? node.by.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {node.by || "unknown"}
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(node.time)}
            </span>
          </div>

          <button
            className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            onClick={() => setExpandedCommentId(isExpanded ? null : id)}
            aria-label={isExpanded ? "Collapse comment" : "Expand comment"}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Comment Content */}
      <div
        className={cn(
          "px-4 py-3 overflow-hidden",
          isHighlighted && "bg-amber-50/50 dark:bg-amber-950/20"
        )}
      >
        {isExpanded ? (
          // Full expanded content
          <div className="space-y-3">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed overflow-hidden break-words"
              dangerouslySetInnerHTML={{ __html: commentText }}
            />

            {/* Child comments */}
            {childIdsLoaded.length > 0 && (
              <div className="mt-4 space-y-2 max-w-full">
                {childIdsLoaded.map((cid) => (
                  <Comment
                    key={cid}
                    id={cid}
                    depth={depth + 1}
                    commentsMap={commentsMap}
                    setCommentsMap={setCommentsMap}
                    highlightIds={highlightIds}
                    expandedCommentId={expandedCommentId}
                    setExpandedCommentId={setExpandedCommentId}
                  />
                ))}
              </div>
            )}

            {/* Load more replies button */}
            {node.kids && childLoadedCount < node.kids.length && (
              <div className="mt-3">
                <button
                  className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                  onClick={loadMoreChildren}
                  disabled={loadingChildren}
                >
                  {loadingChildren ? "Loading replies..." : "Load more replies"}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Preview content
          <div className="space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {hasMoreText ? (
                <div
                  className="overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    lineHeight: "1.5",
                  }}
                >
                  {previewText}
                  {previewText.length < stripHtml(commentText).length && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    lineHeight: "1.5",
                  }}
                >
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none overflow-hidden break-words"
                    dangerouslySetInnerHTML={{ __html: commentText }}
                  />
                </div>
              )}
            </div>

            {hasMoreText && (
              <button
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                onClick={() => setExpandedCommentId(id)}
              >
                Read more
              </button>
            )}

            {/* Show reply count if available */}
            {node.kids && node.kids.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {node.kids.length} repl{node.kids.length === 1 ? "y" : "ies"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function stripHtml(s: string) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function RelevantCommentsPanel({
  relevantComments,
}: {
  relevantComments: any[];
}) {
  if (!relevantComments || relevantComments.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              ★
            </span>
          </div>
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Relevant Comments
          </h3>
        </div>
        <div className="space-y-3">
          {relevantComments.slice(0, 10).map((c) => (
            <div
              key={c.comment_id}
              className="bg-white dark:bg-gray-900/50 rounded-lg border border-amber-200 dark:border-amber-800 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      {c.by ? c.by.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {c.by || "unknown"}
                  </span>
                </div>
                <a
                  href={`https://news.ycombinator.com/item?id=${c.comment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View on HN →
                </a>
              </div>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: c.text || "" }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HackerNewsView({ agentId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const agentType = useSelector(selectAgentType);
  const loadStatus = useSelector(selectAgentStatus);
  const hnPosts = useSelector(selectHackerNewsPosts);

  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"top" | "newest" | "comments">(
    "top"
  );

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const isLoading =
    loadStatus === "loading" && (!hnPosts || hnPosts.length === 0);

  React.useEffect(() => {
    if (!agentId) return;
    dispatch(fetchAgentData(agentId));
  }, [dispatch, agentId]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [loadingStoryDetails, setLoadingStoryDetails] = React.useState(false);
  const [fullStoryDetails, setFullStoryDetails] = React.useState<any>(null);
  const [commentsMap, setCommentsMap] = React.useState<Map<number, HNComment>>(
    new Map()
  );
  const [topKids, setTopKids] = React.useState<number[]>([]);
  const [topLoadedCount, setTopLoadedCount] = React.useState(0);
  const [topLoadedIds, setTopLoadedIds] = React.useState<number[]>([]);
  const [expandedCommentId, setExpandedCommentId] = React.useState<
    number | null
  >(null);
  const TOP_PAGE = 10;
  const cacheRef = React.useRef<Map<number, HNComment>>(new Map());
  const storyCacheRef = React.useRef<Map<number, any>>(new Map());

  const filtered = React.useMemo(() => {
    let list = (hnPosts || []).slice(0);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          getDomain(s.url).toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "top":
        list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
      case "newest":
        list.sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
        break;
      case "comments":
        list.sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0));
        break;
    }
    return list;
  }, [hnPosts, query, sortBy]);

  const selectedStory = React.useMemo(
    () =>
      filtered.find((s) => Number(s.story_id) === selectedId) || filtered[0],
    [filtered, selectedId]
  );

  const loadStoryAndFirstComments = React.useCallback(
    async (storyId: number) => {
      // Reset comment state immediately for better UX
      setTopKids([]);
      setTopLoadedCount(0);
      setTopLoadedIds([]);
      setCommentsMap(new Map());

      setLoadingComments(true);
      try {
        // Check cache first for immediate response
        const cached = storyCacheRef.current.get(storyId);
        let kids: number[] = [];

        if (cached && cached.kids) {
          kids = cached.kids as number[];
          setTopKids(kids);

          // Immediately show cached comments if available
          if (kids.length > 0) {
            const first = kids.slice(0, TOP_PAGE);
            const cachedComments = first.filter((id) =>
              cacheRef.current.has(id)
            );

            if (cachedComments.length > 0) {
              const cached = cachedComments.map(
                (id) => cacheRef.current.get(id)!
              );
              setCommentsMap((prev) => {
                const next = new Map(prev);
                cached.forEach((c) => next.set(c.id, c));
                return next;
              });
              setTopLoadedIds(cached.map((c) => c.id));
              setTopLoadedCount(cachedComments.length);
            }
          }
        } else {
          // Fetch story details if not cached
          const full = (await fetchItem(storyId)) as any;
          kids = (full?.kids || []) as number[];
          storyCacheRef.current.set(storyId, full);
          setTopKids(kids);
        }

        // Load any remaining comments that aren't cached
        if (kids.length > 0) {
          const first = kids.slice(0, TOP_PAGE);
          const uncachedComments = first.filter(
            (id) => !cacheRef.current.has(id)
          );

          if (uncachedComments.length > 0) {
            const fetched = await fetchCommentsBatch(
              uncachedComments,
              cacheRef.current
            );
            setCommentsMap((prev) => {
              const next = new Map(prev);
              fetched.forEach((c) => next.set(c.id, c));
              return next;
            });
            // update cache
            fetched.forEach((c) => cacheRef.current.set(c.id, c));
            setTopLoadedIds((prev) => [...prev, ...fetched.map((c) => c.id)]);
            setTopLoadedCount((prev) => prev + fetched.length);
          }
        }
      } finally {
        setLoadingComments(false);
      }
    },
    []
  );

  // Function to handle instant story selection
  const handleStorySelection = React.useCallback(
    (storyId: number) => {
      setSelectedId(storyId);
      setFullStoryDetails(null); // Reset full story details
      setExpandedCommentId(null); // Reset expanded comment when switching stories

      // Check if we have cached data for instant display
      const cached = storyCacheRef.current.get(storyId);
      if (cached && cached.kids) {
        // If cached, show comments immediately
        const kids = cached.kids as number[];
        setTopKids(kids);

        if (kids.length > 0) {
          const first = kids.slice(0, TOP_PAGE);
          const cachedComments = first.filter((id) => cacheRef.current.has(id));

          if (cachedComments.length > 0) {
            const cached = cachedComments.map(
              (id) => cacheRef.current.get(id)!
            );
            setCommentsMap((prev) => {
              const next = new Map(prev);
              cached.forEach((c) => next.set(c.id, c));
              return next;
            });
            setTopLoadedIds(cached.map((c) => c.id));
            setTopLoadedCount(cachedComments.length);
          }
        }

        // Load any remaining comments in background
        loadStoryAndFirstComments(storyId);
      } else {
        // If not cached, show loading and fetch
        setLoadingStoryDetails(true);
        setTopKids([]);
        setTopLoadedCount(0);
        setTopLoadedIds([]);
        setCommentsMap(new Map());

        loadStoryAndFirstComments(storyId).finally(() => {
          setLoadingStoryDetails(false);
        });
      }
    },
    [loadStoryAndFirstComments]
  );

  // Function to fetch full story details if text is missing
  const fetchFullStoryDetails = React.useCallback(async (storyId: number) => {
    try {
      const full = await fetchItem(storyId);
      storyCacheRef.current.set(storyId, full);
      return full;
    } catch (error) {
      console.error("Failed to fetch full story details:", error);
      return null;
    }
  }, []);

  // Set initial story when posts load
  React.useEffect(() => {
    if (hnPosts && hnPosts.length > 0 && !selectedId) {
      handleStorySelection(Number(hnPosts[0].story_id));
    }
  }, [hnPosts, selectedId, handleStorySelection]);

  // Auto-fetch full story details if text is missing
  React.useEffect(() => {
    if (
      selectedStory &&
      !selectedStory.text &&
      !selectedStory.summary &&
      !fullStoryDetails
    ) {
      // Auto-fetch full story details if we don't have text content
      fetchFullStoryDetails(Number(selectedStory.story_id)).then((full) => {
        if (full) setFullStoryDetails(full);
      });
    }
  }, [selectedStory, fullStoryDetails, fetchFullStoryDetails]);

  const loadMoreTop = React.useCallback(async () => {
    if (topLoadedCount >= topKids.length) return;
    setLoadingComments(true);
    try {
      const nextIds = topKids.slice(topLoadedCount, topLoadedCount + TOP_PAGE);
      const fetched = await fetchCommentsBatch(nextIds, cacheRef.current);
      setCommentsMap((prev) => {
        const next = new Map(prev);
        fetched.forEach((c) => next.set(c.id, c));
        return next;
      });
      fetched.forEach((c) => cacheRef.current.set(c.id, c));
      setTopLoadedIds((prev) => [...prev, ...fetched.map((c) => c.id)]);
      setTopLoadedCount((n) => n + nextIds.length);
    } finally {
      setLoadingComments(false);
    }
  }, [topKids, topLoadedCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <div className="text-sm">Loading Hacker News posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900/60">
        <div className="relative flex-1">
          <Input
            placeholder="Search stories or domains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={sortBy === "top" ? "default" : "outline"}
            className="h-8 px-2"
            onClick={() => setSortBy("top")}
          >
            <Hash className="h-3.5 w-3.5 mr-1" /> Top
          </Button>
          <Button
            size="sm"
            variant={sortBy === "newest" ? "default" : "outline"}
            className="h-8 px-2"
            onClick={() => setSortBy("newest")}
          >
            <Clock className="h-3.5 w-3.5 mr-1" /> New
          </Button>
          <Button
            size="sm"
            variant={sortBy === "comments" ? "default" : "outline"}
            className="h-8 px-2"
            onClick={() => setSortBy("comments")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comments
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-2 p-2">
        {/* Left: Stories */}
        <div className="flex-[2] min-w-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900/60">
          <ScrollArea className="h-full">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((s) => {
                const domain = getDomain(s.url);
                const isSelected = s.story_id === selectedStory?.story_id;
                return (
                  <div
                    key={s.story_id}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                      isSelected && "bg-orange-50/40 dark:bg-orange-900/10"
                    )}
                    onClick={() => handleStorySelection(Number(s.story_id))}
                    onMouseEnter={() => {
                      // Pre-fetch story details on hover for better UX
                      if (!storyCacheRef.current.has(Number(s.story_id))) {
                        fetchItem(Number(s.story_id))
                          .then((full) => {
                            storyCacheRef.current.set(Number(s.story_id), full);
                            // Also pre-fetch first few comments for instant loading
                            if (
                              (full as any)?.kids &&
                              (full as any).kids.length > 0
                            ) {
                              const firstComments = (full as any).kids.slice(
                                0,
                                5
                              );
                              fetchCommentsBatch(
                                firstComments,
                                cacheRef.current
                              ).catch(() => {
                                // Silently fail for pre-fetch
                              });
                            }
                          })
                          .catch(() => {
                            // Silently fail for pre-fetch
                          });
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                      <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                        HN
                      </span>
                      <span className="truncate">{domain}</span>
                      <a
                        className="ml-auto inline-flex items-center gap-1 hover:underline"
                        href={
                          s.url ||
                          `https://news.ycombinator.com/item?id=${s.story_id}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="font-medium text-sm mb-1 line-clamp-1">
                      {s.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{s.score ?? 0} points</span>
                      <span>•</span>
                      <span>{s.comment_count ?? 0} comments</span>
                      <span className="ml-auto">{formatTime(s.time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Details */}
        <div className="flex-[3] min-w-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900/60">
          {!selectedStory ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <div className="text-sm">Select a story to view details</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50 text-[10px]"
                  >
                    HN
                  </Badge>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug line-clamp-2">
                      {selectedStory.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{getDomain(selectedStory.url)}</span>
                      <span>•</span>
                      <span>{selectedStory.score ?? 0} points</span>
                      <span>•</span>
                      <span>{formatTime(selectedStory.time)}</span>
                      {loadingStoryDetails && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Loading...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-7 w-7"
                  >
                    <a
                      href={
                        selectedStory.url ||
                        `https://news.ycombinator.com/item?id=${selectedStory.story_id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {loadingStoryDetails ? (
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading story details...
                  </div>
                </div>
              ) : null}

              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    {/* Story Text Content */}
                    {selectedStory.text ||
                    selectedStory.summary ||
                    fullStoryDetails?.text ? (
                      <Card className="border-gray-200 dark:border-gray-800">
                        <CardContent className="p-3">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div
                              className="text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html:
                                  selectedStory.text ||
                                  selectedStory.summary ||
                                  fullStoryDetails?.text ||
                                  "",
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}

                    {/* Relevant Comments */}
                    {!!selectedStory.relevant_comments?.length && (
                      <RelevantCommentsPanel
                        relevantComments={selectedStory.relevant_comments || []}
                      />
                    )}

                    {/* All Comments */}
                    <Card className="border-gray-200 dark:border-gray-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Comments</h3>
                          <div className="text-[11px] text-muted-foreground ml-auto">
                            {selectedStory.comment_count ?? 0} total
                          </div>
                        </div>
                        {loadingComments && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading comments...
                          </div>
                        )}
                        {!loadingComments &&
                          topLoadedIds.length === 0 &&
                          topKids.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                              No comments yet.
                            </div>
                          )}
                        {!loadingComments &&
                          topLoadedIds.length === 0 &&
                          topKids.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Loading comments...
                            </div>
                          )}
                        {!loadingComments && topLoadedIds.length > 0 && (
                          <div className="space-y-3 max-w-full">
                            {topLoadedIds.map((cid) => (
                              <Comment
                                key={cid}
                                id={cid}
                                commentsMap={commentsMap}
                                setCommentsMap={setCommentsMap}
                                highlightIds={
                                  new Set(
                                    selectedStory.relevant_comments
                                      ?.map((c) => Number(c.comment_id))
                                      .filter((id) => !isNaN(id)) || []
                                  )
                                }
                                expandedCommentId={expandedCommentId}
                                setExpandedCommentId={setExpandedCommentId}
                              />
                            ))}
                          </div>
                        )}
                        {topLoadedCount < topKids.length && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={loadMoreTop}
                              disabled={loadingComments}
                            >
                              {loadingComments
                                ? "Loading more..."
                                : "Load more comments"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
