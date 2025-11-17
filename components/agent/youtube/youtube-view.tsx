"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchAgentDetails,
  selectAgentDetails,
  selectAgentDetailsStatus,
  selectAgentState,
  setCurrentAgentId,
  updateAgentDetails,
  selectYoutubePosts,
  fetchAgentData,
  type AgentDetails,
} from "@/store/features/agentSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  BarChart2,
  Settings,
  ExternalLink,
  PlayCircle,
  Clock,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

type YoutubeVideo = {
  video_id: string;
  title: string;
  description: string;
  channel_name: string;
  channel_id: string;
  published_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number | null;
  duration: string | null;
  thumbnail_url: string;
  video_url: string;
  caption_text?: string | null;
  execution_id?: number;
  relevance_score?: number | null;
  keyword_relevance?: number | null;
  semantic_relevance?: number | null;
  matched_query?: string | null;
  search_method?: string | null;
  brand_mentions?: string[];
  sentiment?: string | null;
};

interface YoutubeViewProps {
  agentId: string;
}

// Simple YouTube icon
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M23.5 6.2s-.2-1.7-.9-2.5c-.8-.9-1.7-.9-2.1-1C16.7 2.3 12 2.3 12 2.3h0s-4.7 0-8.5.4c-.4.1-1.3.1-2.1 1C.7 4.5.5 6.2.5 6.2S.3 8.1.3 10v1.9c0 1.9.2 3.8.2 3.8s.2 1.7.9 2.5c.8.9 1.9.8 2.4.9 1.7.2 7.3.4 8.2.4 0 0 4.7 0 8.5-.4.4-.1 1.3-.1 2.1-1 .7-.8.9-2.5.9-2.5s.2-1.9.2-3.8V10c0-1.9-.2-3.8-.2-3.8zM9.8 14.7V7.5l6.1 3.6-6.1 3.6z"
    />
  </svg>
);

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

const YoutubeContentView = ({
  videos,
  selectedVideoId,
  onSelectVideo,
}: {
  videos: YoutubeVideo[];
  selectedVideoId: string | null;
  onSelectVideo: (id: string) => void;
}) => {
  return (
    <div className="flex flex-1 min-h-0 mx-3 overflow-hidden gap-2">
      <div className="flex flex-col min-h-0 min-w-0 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60 flex-[2]">
        <ScrollArea className="h-full">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {videos.map((video) => {
              const isSelected = video.video_id === selectedVideoId;
              return (
                <button
                  key={video.video_id}
                  type="button"
                  onClick={() => onSelectVideo(video.video_id)}
                  className={cn(
                    "w-full text-left p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors",
                    isSelected &&
                      "bg-blue-50/60 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                  )}
                >
                  <div className="relative w-32 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="h-7 w-7 text-white drop-shadow" />
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate max-w-[140px]">
                        {video.channel_name}
                      </span>
                      {video.view_count != null && (
                        <>
                          <span>•</span>
                          <span>
                            {video.view_count.toLocaleString()} views
                          </span>
                        </>
                      )}
                      {video.engagement_rate != null && (
                        <>
                          <span>•</span>
                          <span>
                            {(video.engagement_rate * 100).toFixed(1)}% ER
                          </span>
                        </>
                      )}
                    </div>
                    {video.matched_query && (
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 truncate">
                        Matched: {video.matched_query}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-col min-w-0 min-h-0 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60 overflow-hidden flex-[3]">
        {!selectedVideoId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            Select a video to view details
          </div>
        ) : null}
        {selectedVideoId && (
          <YoutubeVideoDetails
            video={videos.find((v) => v.video_id === selectedVideoId) || null}
          />
        )}
      </div>
    </div>
  );
};

const YoutubeVideoDetails = ({ video }: { video: YoutubeVideo | null }) => {
  if (!video) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Video not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-3">
          <div className="relative w-44 h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-9 w-9 text-white drop-shadow-lg" />
            </div>
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded">
                {video.duration}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">
              {video.title}
            </h2>
            <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="font-medium">{video.channel_name}</span>
              {video.view_count != null && (
                <>
                  <span>•</span>
                  <span>{video.view_count.toLocaleString()} views</span>
                </>
              )}
              {video.published_at && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(video.published_at).toLocaleDateString()}
                  </span>
                </>
              )}
              {video.engagement_rate != null && (
                <>
                  <span>•</span>
                  <span>
                    Engagement{" "}
                    {(video.engagement_rate * 100).toFixed(1).toString()}%
                  </span>
                </>
              )}
            </div>
            {video.video_url && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 h-8 text-xs"
              >
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open on YouTube
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">
                      {video.duration || "Unknown"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Likes</div>
                    <div className="font-medium">
                      {video.like_count != null
                        ? video.like_count.toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Comments</div>
                    <div className="font-medium">
                      {video.comment_count != null
                        ? video.comment_count.toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>
                {video.matched_query && (
                  <div>
                    <div className="text-muted-foreground">Matched Query</div>
                    <div className="font-medium truncate">
                      {video.matched_query}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {video.description && (
            <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Description</h3>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          )}

          {video.caption_text && (
            <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Transcript Snippet</h3>
                <p className="text-xs text-muted-foreground line-clamp-6">
                  {video.caption_text}
                </p>
              </CardContent>
            </Card>
          )}

          {video.brand_mentions && video.brand_mentions.length > 0 && (
            <Card className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2">Brand Mentions</h3>
                <div className="flex flex-wrap gap-1.5">
                  {video.brand_mentions.map((b) => (
                    <Badge
                      key={b}
                      variant="outline"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const YoutubeView: React.FC<YoutubeViewProps> = ({ agentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const agentDetails = useSelector(selectAgentDetails);
  const youtubePosts = useSelector(selectYoutubePosts) as YoutubeVideo[];
  const agentState = useSelector(selectAgentState);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    "content" | "performance" | "config"
  >("content");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const currentAgentIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (currentAgentIdRef.current === agentId) return;
      try {
        dispatch(setCurrentAgentId(agentId));
        await dispatch(fetchAgentDetails(agentId));
        await dispatch(fetchAgentData(agentId));
        currentAgentIdRef.current = agentId;
      } catch (e) {
        // ignore here; details errors handled in slice
      }
    };
    if (agentId && currentAgentIdRef.current !== agentId) {
      fetchData();
    }
  }, [agentId, dispatch]);

  // Initialize selection from store data
  useEffect(() => {
    if (youtubePosts && youtubePosts.length > 0 && !selectedVideoId) {
      setSelectedVideoId(youtubePosts[0].video_id);
    }
  }, [youtubePosts, selectedVideoId]);

  const videos = youtubePosts || [];

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <PlayCircle className="h-8 w-8 animate-pulse text-red-500" />
          <p className="text-sm">Loading YouTube videos...</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Could not load YouTube videos</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {error}
          </p>
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
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-red-600 dark:text-red-500">
                <YoutubeIcon className="h-5 w-5" />
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
                  <span
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
                  {videos.length} videos
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
          <YoutubeContentView
            videos={videos}
            selectedVideoId={selectedVideoId}
            onSelectVideo={setSelectedVideoId}
          />
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
                Analytics data is not available for YouTube agents yet.
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
};

export default YoutubeView;


