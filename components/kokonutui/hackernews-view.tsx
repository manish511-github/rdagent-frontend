"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, ArrowUpRight, RefreshCw, Hash, Clock, ExternalLink } from "lucide-react";

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
  stories: HNStory[];
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
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  if (!res.ok) throw new Error("Failed to fetch HN item");
  return res.json();
}

async function fetchCommentsBatch(ids: number[], cache: Map<number, HNComment>): Promise<HNComment[]> {
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

function Comment({ id, depth = 0, commentsMap, setCommentsMap, highlightIds }: { id: number; depth?: number; commentsMap: Map<number, HNComment>; setCommentsMap: React.Dispatch<React.SetStateAction<Map<number, HNComment>>>; highlightIds: Set<number> }) {
  const node = commentsMap.get(id);
  const [expanded, setExpanded] = React.useState(false);
  const [childLoadedCount, setChildLoadedCount] = React.useState(0);
  const [childIdsLoaded, setChildIdsLoaded] = React.useState<number[]>([]);
  const [loadingChildren, setLoadingChildren] = React.useState(false);
  const CHILD_PAGE = 5;
  const isHighlighted = highlightIds.has(id);

  const loadMoreChildren = React.useCallback(async () => {
    if (!node?.kids || childLoadedCount >= node.kids.length) return;
    setLoadingChildren(true);
    try {
      const next = node.kids.slice(childLoadedCount, childLoadedCount + CHILD_PAGE);
      const fetched = await fetchCommentsBatch(next, commentsMap as Map<number, HNComment>);
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
    if (expanded && node?.kids && childLoadedCount === 0) {
      loadMoreChildren();
    }
  }, [expanded, node, childLoadedCount, loadMoreChildren]);

  if (!node) return null;
  return (
    <div id={`c-${id}`} className={cn("mt-2 rounded-md", isHighlighted && "bg-amber-50 dark:bg-amber-950/30") } style={{ marginLeft: depth * 12 }}>
      <div className={cn("text-xs text-muted-foreground flex items-center gap-2", isHighlighted && "px-2 pt-2") }>
        <button
          className="text-[11px] px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setExpanded((e) => !e)}
          aria-label="toggle"
        >
          {expanded ? "−" : "+"}
        </button>
        <span className="font-medium">{node.by || "unknown"}</span>
        <span>•</span>
        <span>{formatTime(node.time)}</span>
      </div>
      {expanded && (
        <div className={cn("prose prose-sm dark:prose-invert mt-1", isHighlighted && "px-2 pb-2") } dangerouslySetInnerHTML={{ __html: node.text || "" }} />
      )}
      {expanded && childIdsLoaded.length > 0 && (
        <div className="mt-1">
          {childIdsLoaded.map((cid) => (
            <Comment key={cid} id={cid} depth={depth + 1} commentsMap={commentsMap} setCommentsMap={setCommentsMap} highlightIds={highlightIds} />
          ))}
        </div>
      )}
      {expanded && node.kids && childLoadedCount < node.kids.length && (
        <div className="mt-1">
          <button
            className="text-[11px] px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={loadMoreChildren}
            disabled={loadingChildren}
          >
            {loadingChildren ? "Loading replies..." : "Load more replies"}
          </button>
        </div>
      )}
    </div>
  );
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function RelevantCommentsPanel({ ids }: { ids: number[] }) {
  const [items, setItems] = React.useState<HNComment[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ids || ids.length === 0) return setItems([]);
      const take = ids.slice(0, 10);
      const fetched = await Promise.all(
        take.map(async (id) => {
          try {
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (!res.ok) return null;
            return (await res.json()) as HNComment;
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) setItems(fetched.filter(Boolean) as HNComment[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (!ids || ids.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10">
      <CardContent className="p-3">
        <div className="text-sm font-medium mb-2">Relevant comments</div>
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="text-sm">
              <a href={`#c-${c.id}`} className="underline">
                {stripHtml(c.text || "").slice(0, 140)}{stripHtml(c.text || "").length > 140 ? "…" : ""}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function HackerNewsView({ stories }: Props) {
  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"top" | "newest" | "comments">("top");
  const [selectedId, setSelectedId] = React.useState<number | null>(stories[0]?.id ?? null);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [storyCache] = React.useState<Map<number, HNStory | HNComment>>(new Map());
  const [commentsMap, setCommentsMap] = React.useState<Map<number, HNComment>>(new Map());
  const [topKids, setTopKids] = React.useState<number[]>([]);
  const [topLoadedCount, setTopLoadedCount] = React.useState(0);
  const [topLoadedIds, setTopLoadedIds] = React.useState<number[]>([]);
  const TOP_PAGE = 10;
  const cacheRef = React.useRef<Map<number, HNComment>>(new Map());

  const filtered = React.useMemo(() => {
    let list = stories.slice(0);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || getDomain(s.url).toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "top":
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case "newest":
        list.sort((a, b) => (b.time || 0) - (a.time || 0));
        break;
      case "comments":
        list.sort((a, b) => (b.descendants || 0) - (a.descendants || 0));
        break;
    }
    return list;
  }, [stories, query, sortBy]);

  const selectedStory = React.useMemo(() => filtered.find((s) => s.id === selectedId) || filtered[0], [filtered, selectedId]);

  const loadStoryAndFirstComments = React.useCallback(async () => {
    if (!selectedStory) return;
    setLoadingComments(true);
    try {
      let kids: number[] = Array.isArray(selectedStory.children) ? selectedStory.children : [];
      if (!kids.length) {
        const full = (await fetchItem(selectedStory.id)) as any;
        kids = (full?.kids || []) as number[];
      }
      setTopKids(kids);
      setTopLoadedCount(0);
      setTopLoadedIds([]);
      setCommentsMap(new Map());
      const first = kids.slice(0, TOP_PAGE);
      const fetched = await fetchCommentsBatch(first, cacheRef.current);
      setCommentsMap((prev) => {
        const next = new Map(prev);
        fetched.forEach((c) => next.set(c.id, c));
        return next;
      });
      // update cache
      fetched.forEach((c) => cacheRef.current.set(c.id, c));
      setTopLoadedIds(fetched.map((c) => c.id));
      setTopLoadedCount(first.length);
    } finally {
      setLoadingComments(false);
    }
  }, [selectedStory]);

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

  React.useEffect(() => {
    if (selectedStory) {
      loadStoryAndFirstComments();
    }
  }, [selectedStory, loadStoryAndFirstComments]);

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
          <Button size="sm" variant={sortBy === "top" ? "default" : "outline"} className="h-8 px-2" onClick={() => setSortBy("top")}>
            <Hash className="h-3.5 w-3.5 mr-1" /> Top
          </Button>
          <Button size="sm" variant={sortBy === "newest" ? "default" : "outline"} className="h-8 px-2" onClick={() => setSortBy("newest")}>
            <Clock className="h-3.5 w-3.5 mr-1" /> New
          </Button>
          <Button size="sm" variant={sortBy === "comments" ? "default" : "outline"} className="h-8 px-2" onClick={() => setSortBy("comments")}>
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
                const isSelected = s.id === selectedStory?.id;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      isSelected && "bg-orange-50/40 dark:bg-orange-900/10"
                    )}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                      <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">HN</span>
                      <span className="truncate">{domain}</span>
                      <a
                        className="ml-auto inline-flex items-center gap-1 hover:underline"
                        href={s.url || `https://news.ycombinator.com/item?id=${s.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="font-medium text-sm mb-1 line-clamp-1">{s.title}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{s.score ?? 0} points</span>
                      <span>•</span>
                      <span>{s.descendants ?? 0} comments</span>
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
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50 text-[10px]">HN</Badge>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug line-clamp-2">{selectedStory.title}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{getDomain(selectedStory.url)}</span>
                      <span>•</span>
                      <span>{selectedStory.score ?? 0} points</span>
                      <span>•</span>
                      <span>{formatTime(selectedStory.time)}</span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="icon" className="ml-auto h-7 w-7">
                    <a href={selectedStory.url || `https://news.ycombinator.com/item?id=${selectedStory.id}`} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    {!!(selectedStory as any)?.relevant_comment_ids?.length && (
                      <RelevantCommentsPanel ids={(selectedStory as any).relevant_comment_ids as number[]} />
                    )}
                    <Card className="border-gray-200 dark:border-gray-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Comments</h3>
                          <div className="text-[11px] text-muted-foreground ml-auto">{selectedStory.descendants ?? 0} total</div>
                        </div>
                        {loadingComments && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" /> Loading comments...
                          </div>
                        )}
                        {!loadingComments && topLoadedIds.length === 0 && (
                          <div className="text-sm text-muted-foreground">No comments yet.</div>
                        )}
                        {!loadingComments && topLoadedIds.length > 0 && (
                          <div>
                            {topLoadedIds.map((cid) => (
                              <Comment
                                key={cid}
                                id={cid}
                                commentsMap={commentsMap}
                                setCommentsMap={setCommentsMap}
                                highlightIds={new Set((selectedStory as any)?.relevant_comment_ids || [])}
                              />
                            ))}
                          </div>
                        )}
                        {topLoadedCount < topKids.length && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={loadMoreTop} disabled={loadingComments}>
                              {loadingComments ? "Loading more..." : "Load more comments"}
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


