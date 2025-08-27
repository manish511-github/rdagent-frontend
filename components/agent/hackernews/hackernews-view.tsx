"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchAgentData,
  selectHackerNewsPosts,
  selectAgentType,
  selectAgentStatus,
  selectAgentData,
  selectAgentState,
  fetchAgentDetails,
  selectAgentDetails,
  selectAgentDetailsStatus,
  updateAgentDetails,
  type AgentDetails,
} from "@/store/features/agentSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Hash,
  Clock,
  ExternalLink,
  BarChart2,
  Settings,
  Search,
  XIcon,
  SlidersHorizontal,
} from "lucide-react";

// HN Icon Component
const HNIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 122.88 122.88" fill="currentColor">
    <path
      fill="#FF6600"
      d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43 C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0L18.43,0z"
    />
    <polygon
      fill="#FFFFFF"
      points="29.76,21.84 42,21.84 61.44,60.72 80.88,21.36 93.12,21.36 66.24,70.32 66.24,102.96 56.64,102.96 56.64,70.32 29.76,21.84"
    />
  </svg>
);

// Configuration Component
const ConfigurationSection = React.memo(function ConfigurationSection({
  agentId,
  setActiveView,
}: {
  agentId: string;
  setActiveView: (view: "content" | "performance" | "config") => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector(selectAgentDetails);
  const detailsStatus = useSelector(selectAgentDetailsStatus);

  const [form, setForm] = React.useState<Partial<AgentDetails> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [newKeyword, setNewKeyword] = React.useState("");

  React.useEffect(() => {
    if (!agentId) return;
    dispatch(fetchAgentDetails(agentId));
  }, [agentId, dispatch]);

  React.useEffect(() => {
    if (details) {
      setForm(details);
    }
  }, [details]);

  const onChange = <K extends keyof AgentDetails>(
    key: K,
    value: AgentDetails[K]
  ) => {
    setForm(
      (prev: Partial<AgentDetails> | null) =>
        ({ ...(prev || {}), [key]: value } as AgentDetails)
    );
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        agent_name: form.agent_name,
        agent_platform: form.agent_platform,
        agent_status: form.agent_status,
        goals: form.goals,
        instructions: form.instructions || "",
        expectations: form.expectations || "",
        project_id: form.project_id,
        mode: form.mode,
        advanced_settings: form.advanced_settings || {},
        platform_settings: form.platform_settings || {},
        agent_keywords: form.agent_keywords || [],
        schedule: form.schedule || undefined,
        description: form.description || "",
      } as any;

      await dispatch(
        updateAgentDetails({ agentId, updates: payload }) as any
      ).unwrap();
    } catch (e) {
      // handled by slice error
    } finally {
      setSaving(false);
    }
  };

  if (detailsStatus === "loading" || !form) {
    return (
      <div className="p-3 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Agent Configuration</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveView("content")}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Back to Content
            </Button>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Agent Configuration</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveView("content")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Back to Content
          </Button>
        </div>

        {/* Basic Settings */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="agent_name" className="text-sm">
                  Agent Name
                </Label>
                <Input
                  id="agent_name"
                  className="h-11"
                  value={form.agent_name || ""}
                  onChange={(e) => onChange("agent_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Platform</Label>
                <Input
                  id="agent_platform"
                  className="h-11"
                  value={form.agent_platform || ""}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={form.agent_status || "active"}
                  onValueChange={(v: string) =>
                    onChange("agent_status", v as any)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Mode</Label>
                <Select
                  value={form.mode || "copilot"}
                  onValueChange={(v: string) => onChange("mode", v as any)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copilot">Copilot</SelectItem>
                    <SelectItem value="assisted">Assisted</SelectItem>
                    <SelectItem value="autonomous">Autonomous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                className="min-h-[100px]"
                value={form.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onChange("description", e.target.value)
                }
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  className="min-h-[100px]"
                  value={form.instructions || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange("instructions", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectations" className="text-sm">
                  Expectations
                </Label>
                <Textarea
                  id="expectations"
                  className="min-h-[100px]"
                  value={form.expectations || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange("expectations", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agent Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-3 border rounded-md bg-background/60 dark:bg-card/60">
              {(form.agent_keywords || []).map((kw: string) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                >
                  {kw}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                    onClick={() =>
                      onChange(
                        "agent_keywords",
                        (form.agent_keywords || []).filter(
                          (k: string) => k !== kw
                        )
                      )
                    }
                    tabIndex={-1}
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                className="h-11 flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newKeyword.trim()) {
                    e.preventDefault();
                    const currentKeywords = form.agent_keywords || [];
                    if (!currentKeywords.includes(newKeyword.trim())) {
                      onChange("agent_keywords", [
                        ...currentKeywords,
                        newKeyword.trim(),
                      ]);
                    }
                    setNewKeyword("");
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (newKeyword.trim()) {
                    const currentKeywords = form.agent_keywords || [];
                    if (!currentKeywords.includes(newKeyword.trim())) {
                      onChange("agent_keywords", [
                        ...currentKeywords,
                        newKeyword.trim(),
                      ]);
                    }
                    setNewKeyword("");
                  }
                }}
                className="h-11 px-4"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-1">
          <Button
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
});

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

// HN Content List Item Component
interface HNContentListItemProps {
  item: any; // HN story item
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const HNContentListItem = React.memo(function HNContentListItem({
  item,
  isSelected,
  onSelect,
}: HNContentListItemProps) {
  const handleClick = React.useCallback(() => {
    onSelect(Number(item.story_id));
  }, [onSelect, item.story_id]);

  const handleExternalLinkClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const domain = getDomain(item.url);

  return (
    <div
      className={cn(
        "p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 w-full min-w-0",
        isSelected &&
          "bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400"
      )}
      onClick={handleClick}
      id="hn-content-list-item"
    >
      <div
        className="flex items-center gap-1 mb-1 w-full min-w-0"
        id="hn-content-list-item-header"
      >
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-0.5 rounded-full flex-shrink-0">
          <div className="h-4 w-4 flex items-center justify-center font-bold text-xs">
            H
          </div>
        </div>
        <span className="text-xs font-medium truncate min-w-0 max-w-[120px]">
          {domain}
        </span>
        {/* <div className="ml-auto px-1.5 py-0.5 rounded-full text-xs flex-shrink-0 bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
          HN
        </div> */}
      </div>

      <h4 className="text-sm font-medium mb-1 line-clamp-1 w-full min-w-0 break-words overflow-hidden">
        {item.title}
      </h4>

      <div className="flex items-center text-xs text-muted-foreground w-full min-w-0">
        <span className="font-medium truncate max-w-[80px]">
          {item.by || "unknown"}
        </span>
        <span className="mx-1 flex-shrink-0">•</span>
        <span className="flex-shrink-0">{formatTime(item.time)}</span>
        <div className="flex items-center gap-2 ml-auto mr-1 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3 flex-shrink-0" />
            <span className="min-w-0">{item.comment_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
            <span className="min-w-0">{item.score ?? 0}</span>
          </div>
        </div>
        <a
          href={
            item.url || `https://news.ycombinator.com/item?id=${item.story_id}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          onClick={handleExternalLinkClick}
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
});

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
        "mt-3 rounded-lg border border-gray-200 dark:border-gray-800 max-w-full bg-white dark:bg-gray-900/60",
        isHighlighted &&
          "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
      )}
      style={{ marginLeft: depth * 16 }}
    >
      {/* Comment Header */}
      <div
        className={cn(
          "px-4 py-3 border-b border-gray-200 dark:border-gray-800",
          isHighlighted && "border-gray-300 dark:border-gray-700"
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

          {depth === 0 && (
            <button
              className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              onClick={() => setExpandedCommentId(isExpanded ? null : id)}
              aria-label={isExpanded ? "Collapse comment" : "Expand comment"}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          )}
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
    <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800/60 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              ★
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Relevant Comments
          </h3>
        </div>
        <div className="space-y-3">
          {relevantComments.slice(0, 10).map((c) => (
            <div
              key={c.comment_id}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800/60 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
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

interface HackerNewsContentManagementProps {
  filteredPosts: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "top" | "newest" | "comments";
  setSortBy: (sort: "top" | "newest" | "comments") => void;
  selectedStoryId: number | null;
  onSelectStory: (id: number) => void;
  storyCacheRef: React.MutableRefObject<Map<number, any>>;
  fetchItem: (id: number) => Promise<HNStory | HNComment>;
  fetchCommentsBatch: (
    ids: number[],
    cache: Map<number, HNComment>
  ) => Promise<HNComment[]>;
  cacheRef: React.MutableRefObject<Map<number, HNComment>>;
  selectedStory: any;
  fullStoryDetails: any;
  loadingStoryDetails: boolean;
  loadingComments: boolean;
  topLoadedIds: number[];
  commentsMap: Map<number, HNComment>;
  setCommentsMap: React.Dispatch<React.SetStateAction<Map<number, HNComment>>>;
  highlightIds: Set<number>; // This should probably be derived or passed from parent
  expandedCommentId: number | null;
  setExpandedCommentId: (id: number | null) => void;
  loadMoreTop: () => Promise<void>;
  topLoadedCount: number;
  topKids: number[];
}

const HackerNewsContentManagement = React.memo(
  function HackerNewsContentManagement({
    filteredPosts: initialFilteredPosts,
    selectedStoryId,
    onSelectStory,
    storyCacheRef,
    fetchItem,
    fetchCommentsBatch,
    cacheRef,
    selectedStory,
    fullStoryDetails,
    loadingStoryDetails,
    loadingComments,
    topLoadedIds,
    commentsMap,
    setCommentsMap,
    highlightIds,
    expandedCommentId,
    setExpandedCommentId,
    loadMoreTop,
    topLoadedCount,
    topKids,
  }: Omit<
    HackerNewsContentManagementProps,
    "searchQuery" | "setSearchQuery" | "sortBy" | "setSortBy"
  >) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"top" | "newest" | "comments">("top");

    const filteredPosts = React.useMemo(() => {
      let list = (initialFilteredPosts || []).slice(0);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (s: any) =>
            s.title.toLowerCase().includes(q) ||
            getDomain(s.url).toLowerCase().includes(q)
        );
      }
      switch (sortBy) {
        case "top":
          list.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
          break;
        case "newest":
          list.sort((a: any, b: any) => (b.time ?? 0) - (a.time ?? 0));
          break;
        case "comments":
          list.sort(
            (a: any, b: any) => (b.comment_count ?? 0) - (a.comment_count ?? 0)
          );
          break;
      }
      return list;
    }, [initialFilteredPosts, searchQuery, sortBy]);

    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-1 min-h-0 mx-3 overflow-hidden">
          <div className="flex flex-col min-h-0 min-w-0 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60 flex-[2]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search stories or domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-9 text-sm bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      title="Sort Posts"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => setSortBy("top")}>
                      <Hash className="h-4 w-4 mr-2" />
                      Top
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("comments")}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Most Comments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ScrollArea className="h-full">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPosts.map((s) => {
                    const domain = getDomain(s.url);
                    const isSelected = Number(s.story_id) === selectedStoryId;
                    return (
                      <div
                        key={s.story_id}
                        onMouseEnter={() => {
                          // Pre-fetch story details on hover for better UX
                          if (!storyCacheRef.current.has(Number(s.story_id))) {
                            fetchItem(Number(s.story_id))
                              .then((full) => {
                                storyCacheRef.current.set(
                                  Number(s.story_id),
                                  full
                                );
                                // Also pre-fetch first few comments for instant loading
                                if (
                                  (full as any)?.kids &&
                                  (full as any).kids.length > 0
                                ) {
                                  const firstComments = (
                                    full as any
                                  ).kids.slice(0, 5);
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
                        <HNContentListItem
                          item={s}
                          isSelected={isSelected}
                          onSelect={onSelectStory}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right: Details */}
          {!selectedStoryId ? (
            <div className="flex-[3] min-w-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900/60 flex items-center justify-center p-6 ml-2">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="text-sm">Select a story to view details</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col min-w-0 min-h-0 ml-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60 overflow-hidden flex-[3]">
              <HackerNewsStoryDetails
                selectedStoryId={selectedStoryId}
                selectedStory={selectedStory}
                fullStoryDetails={fullStoryDetails}
                loadingStoryDetails={loadingStoryDetails}
                formatTime={formatTime}
                getDomain={getDomain}
                loadingComments={loadingComments}
                topLoadedIds={topLoadedIds}
                commentsMap={commentsMap}
                setCommentsMap={setCommentsMap}
                highlightIds={
                  new Set(
                    selectedStory.relevant_comments
                      ?.map((c: { comment_id: string }) => Number(c.comment_id))
                      .filter((id: number) => !isNaN(id)) || []
                  )
                }
                expandedCommentId={expandedCommentId}
                setExpandedCommentId={setExpandedCommentId}
                loadMoreTop={loadMoreTop}
                topLoadedCount={topLoadedCount}
                topKids={topKids}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

interface HackerNewsStoryDetailsProps {
  selectedStoryId: number;
  selectedStory: any;
  fullStoryDetails: any;
  loadingStoryDetails: boolean;
  formatTime: (timestamp?: number) => string;
  getDomain: (url?: string | null) => string;
  loadingComments: boolean;
  topLoadedIds: number[];
  commentsMap: Map<number, HNComment>;
  setCommentsMap: React.Dispatch<React.SetStateAction<Map<number, HNComment>>>;
  highlightIds: Set<number>;
  expandedCommentId: number | null;
  setExpandedCommentId: (id: number | null) => void;
  loadMoreTop: () => Promise<void>;
  topLoadedCount: number;
  topKids: number[];
}

const HackerNewsStoryDetails = React.memo(function HackerNewsStoryDetails({
  selectedStoryId,
  selectedStory,
  fullStoryDetails,
  loadingStoryDetails,
  formatTime,
  getDomain,
  loadingComments,
  topLoadedIds,
  commentsMap,
  setCommentsMap,
  highlightIds,
  expandedCommentId,
  setExpandedCommentId,
  loadMoreTop,
  topLoadedCount,
  topKids,
}: HackerNewsStoryDetailsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-2">
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 text-[10px]"
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
              <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
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
            <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
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
                              ?.map((c: { comment_id: string }) =>
                                Number(c.comment_id)
                              )
                              .filter((id: number) => !isNaN(id)) || []
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
  );
});

export default function HackerNewsView({ agentId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const agentType = useSelector(selectAgentType);
  const loadStatus = useSelector(selectAgentStatus);
  const hnPosts = useSelector(selectHackerNewsPosts);
  const agentData = useSelector(selectAgentData);
  const agentState = useSelector(selectAgentState);
  const agentDetails = useSelector(selectAgentDetails);
  const agentDetailsStatus = useSelector(selectAgentDetailsStatus);
  const isMobile = useIsMobile();

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [activeView, setActiveView] = React.useState<
    "content" | "performance" | "config"
  >("content");
  const [hasInitialData, setHasInitialData] = React.useState(false);

  const isLoading =
    loadStatus === "loading" && (!hnPosts || hnPosts.length === 0);

  React.useEffect(() => {
    const fetchData = async () => {
      if (hasInitialData) return;
      try {
        await dispatch(fetchAgentData(agentId));
        await dispatch(fetchAgentDetails(agentId));
        setHasInitialData(true);
      } catch (error) {
        console.error("Failed to fetch agent data:", error);
      }
    };
    if (agentId) fetchData();
  }, [dispatch, agentId, hasInitialData]);
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
    // Sorting and filtering will now be handled within HackerNewsContentManagement
    return list;
  }, [hnPosts]);

  const selectedStory = React.useMemo(
    () =>
      selectedId
        ? filtered.find((s) => Number(s.story_id) === selectedId)
        : null,
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

  // Set initial story when posts load - removed auto-selection
  // React.useEffect(() => {
  //   if (hnPosts && hnPosts.length > 0 && !selectedId) {
  //     handleStorySelection(Number(hnPosts[0].story_id));
  //   }
  // }, [hnPosts, selectedId, handleStorySelection]);

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
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-1 flex-shrink-0 bg-white dark:bg-gray-900/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                <HNIcon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {agentDetails?.agent_name || agentData?.agent_name || "Agent"}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5 h-5",
                    (agentDetails?.agent_status || agentState) === "active"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      (agentDetails?.agent_status || agentState) === "active"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    )}
                  />
                  {(agentDetails?.agent_status || agentState) === "active"
                    ? "Active"
                    : "Paused"}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {hnPosts?.length || 0} posts
                </span>
              </div>
            </div>
            <div className="flex-1" />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={activeView === "content" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  activeView === "content"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
                onClick={() => setActiveView("content")}
                title="Content"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant={activeView === "performance" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  activeView === "performance"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
                onClick={() => setActiveView("performance")}
                title="Analytics"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button
                variant={activeView === "config" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  activeView === "config"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
                onClick={() => setActiveView("config")}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 max-w-full overflow-hidden">
        {activeView === "content" && (
          <>
            <HackerNewsContentManagement
              filteredPosts={filtered}
              selectedStoryId={selectedId}
              onSelectStory={handleStorySelection}
              storyCacheRef={storyCacheRef}
              fetchItem={fetchItem}
              fetchCommentsBatch={fetchCommentsBatch}
              cacheRef={cacheRef}
              selectedStory={selectedStory}
              fullStoryDetails={fullStoryDetails}
              loadingStoryDetails={loadingStoryDetails}
              loadingComments={loadingComments}
              topLoadedIds={topLoadedIds}
              commentsMap={commentsMap}
              setCommentsMap={setCommentsMap}
              highlightIds={
                new Set(
                  selectedStory?.relevant_comments
                    ?.map((c: { comment_id: string }) => Number(c.comment_id))
                    .filter((id: number) => !isNaN(id)) || []
                )
              }
              expandedCommentId={expandedCommentId}
              setExpandedCommentId={setExpandedCommentId}
              loadMoreTop={loadMoreTop}
              topLoadedCount={topLoadedCount}
              topKids={topKids}
            />
          </>
        )}

        {activeView === "performance" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-6 text-center">
              <div className="text-muted-foreground mb-2">
                <BarChart2 className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                Performance Analytics
              </h3>
              <p className="text-xs text-muted-foreground">
                Analytics data is not available for HackerNews agents yet.
              </p>
            </div>
          </div>
        )}

        {activeView === "config" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ConfigurationSection
              agentId={agentId}
              setActiveView={setActiveView}
            />
          </div>
        )}
      </div>
    </div>
  );
}
