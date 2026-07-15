"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  FilterIcon,
  ListChecks,
  Loader2,
  MessageSquare,
  Radio,
  Search,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AgentArtifactRow,
  ResearchPlan,
  ResearchPlanColumn,
} from "@/lib/agent-chat/types";
import {
  formatPlatformLabel,
  signalPlatform,
} from "@/lib/agent-chat/signal-utils";
import { cn } from "@/lib/utils";

export type AgentSignal = {
  id?: string | number;
  story_id?: string | number;
  video_id?: string | number;
  platform?: string;
  source?: string;
  title?: string;
  url?: string;
  hn_url?: string;
  permalink?: string;
  external_url?: string;
  snippet?: string;
  text?: string;
  content?: string;
  body?: string;
  description?: string;
  author?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  author_id?: string | number | null;
  channel?: string | null;
  channel_id?: string | number | null;
  channel_name?: string | null;
  subreddit?: string | null;
  subx?: string | null;
  post_id?: string | null;
  tweet_id?: string | number | null;
  status_id?: string | number | null;
  overall_score?: number;
  category?: string;
  reason?: string;
  match_reason?: string;
  suggested_action?: string;
  query?: string;
  published_at?: string | number | null;
  created_at?: string | number | null;
  matched_terms?: string[];
  matched_keywords?: string[];
  sentiment?: string;
  signal_strength?: string;
  noise_type?: string | null;
  is_actionable?: boolean;
  metadata?: Record<string, unknown>;
  score?: number;
  relevance?: number;
  likes?: number | string | null;
  retweets?: number | string | null;
  replies?: number | string | null;
  view_count?: number | string | null;
  like_count?: number | string | null;
  comment_count?: number | string | null;
  duration?: string | number | null;
  thumbnail_url?: string | null;
  time?: number;
  relevant_comment_ids?: number[];
};

export type AgentWorkspaceEvent = {
  id: string;
  type:
    | "thinking"
    | "tool_started"
    | "mention_found"
    | "tool_completed"
    | "completed"
    | "cancelled"
    | "error";
  label: string;
  detail?: string;
  platform?: string;
  count?: number;
  signalKey?: string;
  createdAt: number;
};

type AgentWorkspaceData = {
  answer: string;
  skill_used: string;
  tool_calls: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  signals: AgentSignal[];
  artifact_rows?: AgentArtifactRow[];
};

type StatusFilter = "all" | "actionable" | "comments" | "news" | "promo" | "low_relevance";
type SortOrder = "relevance" | "newest" | "oldest";

type AgentDisplayRecord = {
  id: string;
  signal: AgentSignal;
  artifactRow?: AgentArtifactRow;
};

type AgentWorkspacePanelProps = {
  data?: AgentWorkspaceData;
  liveSignals: AgentSignal[];
  workspaceEvents?: AgentWorkspaceEvent[];
  isSearching: boolean;
  viewMode?: "plan" | "results";
  trackerPrompt?: string;
  sessionTitle?: string;
  researchPlan?: ResearchPlan | null;
  onExecutePlan?: (message: string, plan: ResearchPlan) => void;
  onRejectPlan?: (message: string, plan: ResearchPlan) => void;
};

export function AgentWorkspacePanel({
  data,
  liveSignals,
  workspaceEvents = [],
  isSearching,
  viewMode = "results",
  trackerPrompt,
  sessionTitle,
  researchPlan,
  onExecutePlan,
  onRejectPlan,
}: AgentWorkspacePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("relevance");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const signals = useMemo(() => {
    const finalSignals = data?.signals || [];
    // Reddit can surface the same post through multiple expanded queries.
    // Keep every distinct post, but render each canonical URL only once.
    return dedupeSignals(finalSignals.length ? finalSignals : liveSignals);
  }, [data?.signals, liveSignals]);

  const displayRecords = useMemo<AgentDisplayRecord[]>(() => {
    const rows = data?.artifact_rows || [];
    if (!rows.length) {
      return signals.map((signal, index) => ({
        id: `${signalId(signal)}-${index}`,
        signal,
      }));
    }

    const signalsByIdentity = buildSignalIdentityMap(signals);
    return rows.map((row, index) => {
      const signal = signalForArtifactRow(row, signalsByIdentity) || signalFromArtifactRow(row);
      return {
        id: `${row.item_id || signalId(signal)}-${index}`,
        signal,
        artifactRow: row,
      };
    });
  }, [data?.artifact_rows, signals]);

  const artifactColumns = useMemo(
    () => researchPlan?.output?.columns || [],
    [researchPlan?.output?.columns]
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = displayRecords.filter((record) => {
      const { signal, artifactRow } = record;
      if (!matchesStatusFilter(signal, statusFilter)) return false;
      if (!query) return true;
      return [
        signal.title,
        signal.snippet,
        signal.text,
        signal.content,
        signal.body,
        signal.description,
        signal.author,
        signal.author_name,
        signal.author_username,
        signal.subreddit,
        signal.source,
        signalPlatform(signal),
        ...Object.values(artifactRow?.fields || {}),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "newest") return signalTime(b.signal) - signalTime(a.signal);
      if (sortOrder === "oldest") return signalTime(a.signal) - signalTime(b.signal);
      const aRelevance = artifactRelevanceScore(a.signal, a.artifactRow);
      const bRelevance = artifactRelevanceScore(b.signal, b.artifactRow);
      return (bRelevance ?? signalScore(b.signal)) - (aRelevance ?? signalScore(a.signal));
    });
  }, [displayRecords, searchQuery, sortOrder, statusFilter]);

  useEffect(() => {
    if (!filteredRecords.length) {
      setSelectedId(null);
      setIsDetailsOpen(false);
      return;
    }
    if (!selectedId || !filteredRecords.some((record) => record.id === selectedId)) {
      setSelectedId(filteredRecords[0].id);
    }
  }, [filteredRecords, selectedId]);

  const selectedRecord = filteredRecords.find((record) => record.id === selectedId) || null;
  const selectedSignal = selectedRecord?.signal || null;
  const selectedArtifactRow = selectedRecord?.artifactRow;
  const latestSignalKeys = useMemo(() => {
    return new Set(
      workspaceEvents
        .filter((event) => event.type === "mention_found" && event.signalKey)
        .slice(-6)
        .map((event) => event.signalKey as string)
    );
  }, [workspaceEvents]);
  const platformSummaries = useMemo(
    () => summarizePlatforms(displayRecords.map((record) => record.signal), workspaceEvents, isSearching),
    [displayRecords, isSearching, workspaceEvents]
  );
  const trackerTerms = useMemo(() => {
    return Array.from(new Set(signals.flatMap(matchedTerms))).slice(0, 16);
  }, [signals]);
  const workspaceTitle =
    viewMode === "plan"
      ? researchPlan?.title || sessionTitle || trackerPrompt || "Research plan"
      : sessionTitle || researchPlan?.title || trackerPrompt || "Research results";
  const shouldShowPlanReview =
    Boolean(researchPlan && onExecutePlan) &&
    viewMode === "plan" &&
    researchPlan?.status !== "rejected";

  if (researchPlan && onExecutePlan && shouldShowPlanReview) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-gray-50 dark:bg-black">
        <div className="border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{researchPlan.title}</h2>
              <p className="truncate text-xs text-muted-foreground">Review the plan, then run the search loop.</p>
            </div>
            <div className="flex items-center gap-2">
              {onRejectPlan && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isSearching}
                  onClick={() => onRejectPlan(researchPlan.message, researchPlan)}
                >
                  Reject
                </Button>
              )}
              <Button
                size="sm"
                disabled={isSearching}
                onClick={() => onExecutePlan(researchPlan.message, researchPlan)}
              >
                {isSearching ? "Running..." : "Execute plan"}
              </Button>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Objective</p>
              <p className="mt-1 text-sm leading-relaxed">{researchPlan.objective || researchPlan.overview}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sources</p>
              <div className="mt-2 space-y-2">
                {researchPlan.sources.map((source, index) => (
                  <div key={`${source.source}-${source.query}-${index}`} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{formatPlatformLabel(source.source)}</Badge>
                      <span className="font-medium">{source.query}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last {source.recency_days} days · limit {source.limit}
                    </p>
                    {source.rationale && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.rationale}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {researchPlan.steps.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Loop</p>
                <ol className="mt-2 space-y-2 text-sm">
                  {researchPlan.steps.map((step) => (
                    <li key={step.id} className="rounded-md bg-muted/40 p-3">
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-gray-50 dark:bg-black">
      <div className="border-b bg-background px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Radio className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{workspaceTitle}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {displayRecords.length} result{displayRecords.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
          {isSearching && (
            <Badge variant="outline" className="gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Working
            </Badge>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="m-0 min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 overflow-hidden p-3">
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-background",
            isDetailsOpen && selectedSignal ? "w-[42%] min-w-[320px] max-w-[520px]" : "w-full"
          )}
        >
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search results..."
                  className="h-9 bg-muted/40 pl-9 pr-9 text-sm"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                )}
              </div>
              <label className="relative">
                <FilterIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="h-9 rounded-md border border-input bg-background pl-7 pr-7 text-xs"
                >
                  <option value="all">All</option>
                  <option value="actionable">Actionable</option>
                  <option value="comments">Comments</option>
                  <option value="news">News</option>
                  <option value="promo">Promo</option>
                  <option value="low_relevance">Low relevance</option>
                </select>
              </label>
              <label className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="h-9 rounded-md border border-input bg-background pl-7 pr-7 text-xs"
                >
                  <option value="relevance">Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredRecords.length ? (
              filteredRecords.map((record) => (
                <MentionListItem
                  key={record.id}
                  signal={record.signal}
                  artifactRow={record.artifactRow}
                  columns={artifactColumns}
                  isNew={latestSignalKeys.has(signalId(record.signal))}
                  isSelected={record.id === selectedId}
                  onSelect={() => {
                    setSelectedId(record.id);
                    setIsDetailsOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <Search className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No results yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isSearching
                      ? "Waiting for results..."
                      : "Run a research search."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isDetailsOpen && selectedSignal && (
          <div className="relative ml-2 hidden min-h-0 min-w-0 flex-[3] flex-col lg:flex">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background">
              <MentionDetails
                signal={selectedSignal}
                artifactRow={selectedArtifactRow}
                columns={artifactColumns}
              />
            </div>
            <button
              type="button"
              className="absolute -left-3 top-1/2 z-50 flex h-16 w-5 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-muted"
              onClick={() => setIsDetailsOpen(false)}
            >
              <ChevronRight className="h-3 w-3 text-gray-600 transition-transform duration-300 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>
        </div>
      </div>

      {!isDetailsOpen && selectedSignal && (
        <button
          type="button"
          className="absolute right-0 top-1/2 z-50 flex h-16 w-5 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-border bg-background shadow-sm transition-colors hover:bg-muted"
          onClick={() => setIsDetailsOpen(true)}
        >
          <ChevronLeft className="h-3 w-3 text-gray-600 transition-transform duration-300 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
}

type PlatformSummary = {
  id: string;
  label: string;
  count: number;
  status: "queued" | "searching" | "complete" | "error" | "idle";
  detail: string;
};

function SourceSummaryPanel({ summaries }: { summaries: PlatformSummary[] }) {
  if (!summaries.length) {
    return (
      <EmptyPanel
        icon={<Radio className="size-5" />}
        title="No sources selected"
        description="Choose platforms in the chat settings before running a tracker."
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {summaries.map((source) => (
        <div
          key={source.id}
          className="rounded-lg border bg-background p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PlatformMark platform={source.label} />
                <h3 className="truncate text-sm font-semibold">{source.label}</h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {source.detail}
              </p>
            </div>
            <SourceStatusBadge status={source.status} />
          </div>
          <div className="mt-4 text-2xl font-semibold">{source.count}</div>
          <p className="text-xs text-muted-foreground">results in this run</p>
        </div>
      ))}
    </div>
  );
}

function TrackerSummaryPanel({
  title,
  prompt,
  platforms,
  terms,
  signalCount,
}: {
  title?: string;
  prompt?: string;
  platforms: string[];
  terms: string[];
  signalCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-background p-4">
        <h3 className="text-sm font-semibold">{title || "Research workspace"}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {prompt || "The tracker configuration will appear after the first prompt."}
        </p>
      </div>

      <div className="rounded-lg border bg-background p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Tracking setup</h3>
          <Badge variant="outline">{signalCount} results</Badge>
        </div>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Platforms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {platforms.length ? (
                platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {formatPlatformLabel(platform)}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No platform selection saved.
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Matched terms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {terms.length ? (
                terms.map((term) => (
                  <Badge key={term} variant="outline">
                    {term}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Terms will appear as results stream in.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTimeline({
  events,
  isSearching,
}: {
  events: AgentWorkspaceEvent[];
  isSearching: boolean;
}) {
  if (!events.length) {
    return (
      <EmptyPanel
        icon={<Activity className="size-5" />}
        title={isSearching ? "Starting activity" : "No activity yet"}
        description={
          isSearching
            ? "The run is starting and events will appear here."
            : "Run a tracker to see platform searches and mention events."
        }
      />
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      {events
        .slice()
        .reverse()
        .map((event) => (
          <div
            key={event.id}
            className="flex gap-3 border-b p-3 last:border-b-0"
          >
            <ActivityIcon event={event} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{event.label}</p>
                {event.platform && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {formatPlatformLabel(event.platform)}
                  </Badge>
                )}
              </div>
              {event.detail && (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {event.detail}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatEventTime(event.createdAt)}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border bg-background p-6 text-center">
      <div>
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <p className="mt-3 text-sm font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function MentionListItem({
  signal,
  artifactRow,
  columns,
  isNew,
  isSelected,
  onSelect,
}: {
  signal: AgentSignal;
  artifactRow?: AgentArtifactRow;
  columns: ResearchPlanColumn[];
  isNew: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const body = signalBody(signal) || artifactBody(artifactRow);
  const platform = signalPlatform(signal);
  const createdAt = signal.created_at || signal.published_at || signal.time;
  const title = artifactFieldText(artifactRow, "title") || signal.title || "Untitled result";
  const listFields = artifactListFields(signal, artifactRow, columns);
  const narrativeFields = listFields.filter(artifactListFieldIsNarrative);
  const compactFields = listFields.filter((field) => !artifactListFieldIsNarrative(field));
  const preview = artifactRow
    ? ""
    : signal.match_reason || signal.reason || body;
  const relevance = artifactRelevanceScore(signal, artifactRow);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "block w-full border-b border-border p-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "border-l-4 border-l-primary bg-primary/5"
      )}
    >
      <div className="mb-1 flex min-w-0 items-center gap-1.5">
        <PlatformMark platform={platform} />
        <span className="truncate text-xs font-medium text-foreground">
          {platform}
        </span>
        {relevance !== undefined && (
          <Badge className={cn("ml-auto px-1.5 py-0 text-[10px]", scoreColor(relevance))}>
            {formatRelevance(relevance)} relevant
          </Badge>
        )}
        {isNew && (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            New
          </Badge>
        )}
      </div>
      <h3 className="line-clamp-1 text-sm font-medium text-foreground">
        {title}
      </h3>
      {preview && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {preview}
        </p>
      )}
      {narrativeFields.map((field) => (
        <p
          key={field.key}
          className="mt-1 line-clamp-2 break-words text-xs leading-5 text-muted-foreground"
        >
          <span className="font-medium text-foreground/80">{field.label}:</span>{" "}
          {formatCompactFieldValue(field.value, field.type)}
        </p>
      ))}
      {compactFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-4 text-muted-foreground">
          {compactFields.map((field) => (
            <span key={field.key} className="min-w-0 break-words">
              <span className="font-medium text-foreground/80">{field.label}:</span>{" "}
              {formatCompactFieldValue(field.value, field.type)}
            </span>
          ))}
        </div>
      )}
      {!listFields.length && createdAt && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatDate(createdAt)}
        </div>
      )}
    </button>
  );
}

function MentionDetails({
  signal,
  artifactRow,
  columns,
}: {
  signal: AgentSignal;
  artifactRow?: AgentArtifactRow;
  columns: ResearchPlanColumn[];
}) {
  const score = signalScore(signal);
  const platform = signalPlatform(signal);
  const body = signalBody(signal) || artifactBody(artifactRow);
  const terms = matchedTerms(signal);
  const title = artifactFieldText(artifactRow, "title") || signal.title || "Untitled result";
  const url = artifactFieldText(artifactRow, "url") || signal.url;
  const dynamicFields = artifactDisplayFields(artifactRow, columns);
  const sourceFields = artifactSourceFactFields(signal, artifactRow, dynamicFields);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Mention details</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{platform}</Badge>
              <Badge className={scoreColor(score)}>{formatScore(score)}</Badge>
              {signal.category && (
                <Badge variant="outline">{signal.category.replaceAll("_", " ")}</Badge>
              )}
              {signal.is_actionable && <Badge variant="outline">Actionable</Badge>}
            </div>
          </div>
          {url && (
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 size-3.5" />
                Open
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <PlatformMark platform={platform} />
            <span>{platform}</span>
            {signal.subreddit && <span>r/{signal.subreddit}</span>}
            {(signal.author || signal.author_username || signal.author_name || signal.subx) && (
              <span>@{signal.author || signal.author_username || signal.author_name || signal.subx}</span>
            )}
          </div>
          <h2 className="text-lg font-semibold leading-7 text-foreground">
            {title}
          </h2>
          {body && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          )}
        </div>

        {sourceFields.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4 text-muted-foreground" />
              Source facts
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sourceFields.map((field) => (
                <div key={field.key} className="rounded-md bg-muted/40 p-2">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">
                    {field.label}
                  </p>
                  <ArtifactFieldValue value={field.value} type={field.type} />
                </div>
              ))}
            </div>
          </div>
        )}

        {dynamicFields.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ListChecks className="size-4 text-muted-foreground" />
              Plan fields
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {dynamicFields.map((field) => (
                <div key={field.key} className="rounded-md bg-muted/40 p-2">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">
                    {field.label}
                  </p>
                  <ArtifactFieldValue value={field.value} type={field.type} />
                </div>
              ))}
            </div>
          </div>
        )}

        {terms.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              Matched terms
            </h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {terms.map((term) => (
                <Badge key={term} variant="outline">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(signal.reason || signal.match_reason || signal.suggested_action || signal.relevant_comment_ids?.length) && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4 text-muted-foreground" />
              Match context
            </div>
            <div className="space-y-2 text-sm leading-6 text-muted-foreground">
              {signal.reason && <p>{signal.reason}</p>}
              {!signal.reason && signal.match_reason && <p>{signal.match_reason}</p>}
              {signal.suggested_action && <p>{signal.suggested_action}</p>}
              {signal.relevant_comment_ids?.length ? (
                <p>{signal.relevant_comment_ids.length} relevant comments matched.</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlatformMark({ platform }: { platform: string }) {
  const label = platform === "Hacker News" ? "HN" : platform.charAt(0).toUpperCase();
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
      {label}
    </span>
  );
}

function ArtifactFieldValue({
  value,
  type,
}: {
  value: unknown;
  type: ResearchPlanColumn["type"];
}) {
  if (value === null || value === undefined || value === "") {
    return <p className="mt-1 text-sm text-muted-foreground">Unknown</p>;
  }

  if (type === "url") {
    const href = String(value);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block truncate text-sm text-primary underline-offset-2 hover:underline"
      >
        {href}
      </a>
    );
  }

  if (type === "badge") {
    return (
      <div className="mt-1">
        <Badge variant="secondary">{String(value)}</Badge>
      </div>
    );
  }

  if (type === "score") {
    const score = typeof value === "number" ? value : Number(value);
    return (
      <p className="mt-1 text-sm font-medium">
        {Number.isFinite(score) ? formatScore(score) : String(value)}
      </p>
    );
  }

  if (type === "date") {
    return <p className="mt-1 text-sm">{formatDate(String(value))}</p>;
  }

  return (
    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5">
      {String(value)}
    </p>
  );
}

function SourceStatusBadge({ status }: { status: PlatformSummary["status"] }) {
  const labelByStatus: Record<PlatformSummary["status"], string> = {
    queued: "Queued",
    searching: "Searching",
    complete: "Complete",
    error: "Error",
    idle: "Idle",
  };

  return (
    <Badge
      variant={status === "error" ? "destructive" : "outline"}
      className="gap-1.5"
    >
      {status === "searching" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : status === "complete" ? (
        <CheckCircle2 className="size-3 text-emerald-600" />
      ) : status === "error" ? (
        <AlertCircle className="size-3" />
      ) : (
        <CircleDot className="size-3" />
      )}
      {labelByStatus[status]}
    </Badge>
  );
}

function ActivityIcon({ event }: { event: AgentWorkspaceEvent }) {
  const baseClass =
    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border";

  if (event.type === "error") {
    return (
      <span className={cn(baseClass, "border-destructive/30 bg-destructive/10 text-destructive")}>
        <AlertCircle className="size-3.5" />
      </span>
    );
  }

  if (event.type === "completed" || event.type === "tool_completed") {
    return (
      <span className={cn(baseClass, "border-emerald-200 bg-emerald-50 text-emerald-700")}>
        <CheckCircle2 className="size-3.5" />
      </span>
    );
  }

  if (event.type === "tool_started" || event.type === "thinking") {
    return (
      <span className={cn(baseClass, "border-blue-200 bg-blue-50 text-blue-700")}>
        <Loader2 className="size-3.5 animate-spin" />
      </span>
    );
  }

  return (
    <span className={cn(baseClass, "bg-muted text-muted-foreground")}>
      <CircleDot className="size-3.5" />
    </span>
  );
}

function summarizePlatforms(
  signals: AgentSignal[],
  events: AgentWorkspaceEvent[],
  isSearching: boolean
): PlatformSummary[] {
  const platformIds = Array.from(
    new Set(signals.map((signal) => platformIdFromLabel(signalPlatform(signal))))
  );

  return platformIds.map((platformId) => {
    const label = formatPlatformLabel(platformId);
    const count = signals.filter(
      (signal) => platformIdFromLabel(signalPlatform(signal)) === platformId
    ).length;
    const platformEvents = events.filter((event) => event.platform === platformId);
    const hasError = platformEvents.some((event) => event.type === "error");
    const hasStarted = platformEvents.some((event) => event.type === "tool_started");
    const hasCompleted = platformEvents.some((event) => event.type === "tool_completed");

    let status: PlatformSummary["status"] = "idle";
    if (hasError) status = "error";
    else if (hasCompleted || count > 0) status = "complete";
    else if (hasStarted) status = "searching";
    else if (isSearching) status = "queued";

    return {
      id: platformId,
      label,
      count,
      status,
      detail: sourceStatusDetail(status, label, count),
    };
  });
}

function sourceStatusDetail(
  status: PlatformSummary["status"],
  label: string,
  count: number
) {
  if (status === "searching") return `${label} is being searched now.`;
  if (status === "queued") return `${label} is queued for this run.`;
  if (status === "complete") {
    return count
      ? `${label} returned ${count} result${count === 1 ? "" : "s"}.`
      : `${label} completed with no results.`;
  }
  if (status === "error") return `${label} returned an error during this run.`;
  return `${label} has not run yet.`;
}

function platformIdFromLabel(label: string) {
  const value = label.toLowerCase();
  if (value.includes("reddit")) return "reddit";
  if (value.includes("hacker")) return "hackernews";
  if (value.includes("youtube")) return "youtube";
  if (value.includes("github")) return "github";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("newsletter")) return "newsletter";
  if (value.includes("x/") || value.includes("twitter")) return "x";
  if (value.includes("dev.to")) return "devto";
  if (value.includes("product")) return "producthunt";
  if (value.includes("indie")) return "indiehackers";
  return value.replaceAll(/\s+/g, "_");
}

function formatEventTime(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function matchesStatusFilter(signal: AgentSignal, filter: StatusFilter) {
  switch (filter) {
    case "actionable":
      return Boolean(signal.is_actionable);
    case "comments":
      return signalSourceType(signal) === "comment";
    case "news":
      return signal.category === "news";
    case "promo":
      return signal.category === "promo" || signal.noise_type === "promo";
    case "low_relevance":
      return ["low_relevance", "irrelevant"].includes(signal.category || "");
    default:
      return true;
  }
}

function signalId(signal: AgentSignal) {
  return (
    signal.id ||
    signal.story_id ||
    signal.video_id ||
    signal.url ||
    signal.post_id ||
    `${signalPlatform(signal)}-${signal.title || ""}-${signalTime(signal)}`
  ).toString();
}

function signalIdentityValues(signal: AgentSignal) {
  return [
    signal.id,
    signal.story_id,
    signal.video_id,
    signal.post_id,
    signal.tweet_id,
    signal.status_id,
    signal.url,
    signal.hn_url,
    signal.permalink,
    signal.external_url,
    signal.metadata?.hn_url,
    signal.metadata?.permalink,
    signal.metadata?.video_id,
    signal.metadata?.video_url,
    signal.metadata?.tweet_id,
    signal.metadata?.status_id,
    signal.metadata?.tweet_url,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);
}

function artifactIdentityValues(row: AgentArtifactRow) {
  return [
    row.item_id,
    row.fields.id,
    row.fields.story_id,
    row.fields.video_id,
    row.fields.post_id,
    row.fields.tweet_id,
    row.fields.status_id,
    row.fields.url,
    row.fields.hn_url,
    row.fields.permalink,
    row.fields.video_url,
    row.fields.external_url,
    row.fields.tweet_url,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);
}

function buildSignalIdentityMap(signals: AgentSignal[]) {
  const map = new Map<string, AgentSignal>();
  for (const signal of signals) {
    for (const value of signalIdentityValues(signal)) {
      const normalized = normalizeIdentityValue(value);
      if (normalized && !map.has(normalized)) {
        map.set(normalized, signal);
      }
    }
  }
  return map;
}

function signalForArtifactRow(
  row: AgentArtifactRow,
  signalsByIdentity: Map<string, AgentSignal>
) {
  for (const value of artifactIdentityValues(row)) {
    const signal = signalsByIdentity.get(normalizeIdentityValue(value));
    if (signal) return signal;
  }
  return undefined;
}

function signalFromArtifactRow(row: AgentArtifactRow): AgentSignal {
  return {
    id: row.item_id,
    story_id: fieldValue(row, "story_id"),
    video_id: fieldValue(row, "video_id"),
    post_id: fieldValue(row, "post_id"),
    tweet_id: fieldValue(row, "tweet_id") || fieldValue(row, "status_id"),
    source: fieldValue(row, "source") || fieldValue(row, "platform"),
    platform: fieldValue(row, "platform") || fieldValue(row, "source"),
    title:
      fieldValue(row, "title") ||
      fieldValue(row, "post_title") ||
      fieldValue(row, "name"),
    url:
      fieldValue(row, "url") ||
      fieldValue(row, "hn_url") ||
      fieldValue(row, "permalink") ||
      fieldValue(row, "video_url") ||
      fieldValue(row, "tweet_url") ||
      fieldValue(row, "external_url"),
    hn_url: fieldValue(row, "hn_url"),
    permalink: fieldValue(row, "permalink"),
    external_url: fieldValue(row, "external_url"),
    content: artifactBody(row),
    author:
      fieldValue(row, "author") ||
      fieldValue(row, "author_name") ||
      fieldValue(row, "author_username") ||
      fieldValue(row, "username") ||
      fieldValue(row, "channel") ||
      fieldValue(row, "channel_name"),
    author_username: fieldValue(row, "author_username") || fieldValue(row, "username"),
    author_name: fieldValue(row, "author_name"),
    channel: fieldValue(row, "channel") || fieldValue(row, "channel_name"),
    channel_name: fieldValue(row, "channel_name") || fieldValue(row, "channel"),
    channel_id: fieldValue(row, "channel_id"),
    subreddit: fieldValue(row, "subreddit") || fieldValue(row, "community"),
    published_at:
      fieldValue(row, "published_at") ||
      fieldValue(row, "published_date") ||
      fieldValue(row, "created_at") ||
      fieldValue(row, "date"),
    match_reason: fieldValue(row, "match_reason") || fieldValue(row, "reason"),
    relevance: numericFieldValue(row, "relevance_score") ?? numericFieldValue(row, "fit_score"),
    likes: fieldValue(row, "likes") || fieldValue(row, "like_count"),
    like_count: fieldValue(row, "like_count") || fieldValue(row, "likes"),
    view_count: fieldValue(row, "view_count") || fieldValue(row, "views"),
    comment_count: fieldValue(row, "comment_count") || fieldValue(row, "comments"),
    duration: fieldValue(row, "duration"),
    thumbnail_url: fieldValue(row, "thumbnail_url"),
    retweets: fieldValue(row, "retweets") || fieldValue(row, "retweet_count"),
    replies: fieldValue(row, "replies") || fieldValue(row, "reply_count"),
  };
}

function normalizeIdentityValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const host = url.hostname
      .replace(/^www\./i, "")
      .replace(/^old\./i, "")
      .replace(/^twitter\.com$/i, "x.com")
      .toLowerCase();
    const youtubeVideoId = youtubeVideoIdFromUrl(url, host);
    if (youtubeVideoId) {
      return `youtube:${youtubeVideoId.toLowerCase()}`;
    }
    const pathname = url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${host}${pathname}`.toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}

function youtubeVideoIdFromUrl(url: URL, host: string) {
  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] || "";
  }
  if (!host.endsWith("youtube.com")) return "";
  const watchId = url.searchParams.get("v");
  if (watchId) return watchId;
  const [kind, id] = url.pathname.split("/").filter(Boolean);
  if (["shorts", "embed", "live"].includes(kind || "") && id) return id;
  return "";
}

function fieldValue(row: AgentArtifactRow, key: string) {
  const value = row.fields[key];
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function numericFieldValue(row: AgentArtifactRow, key: string) {
  const value = row.fields[key];
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function artifactFieldText(row: AgentArtifactRow | undefined, key: string) {
  const value = row?.fields?.[key];
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function artifactDisplayFields(
  row: AgentArtifactRow | undefined,
  columns: ResearchPlanColumn[]
) {
  if (!row) return [];
  if (!columns.length) {
    return Object.entries(row.fields)
      .filter(([key]) => key !== "title")
      .map(([key, value]) => ({
        key,
        label: formatFieldLabel(key),
        type: inferFieldType(key, value),
        value,
      }));
  }
  return columns
    .filter((column) => column.key && column.key !== "title")
    .map((column) => ({
      key: column.key,
      label: column.label || formatFieldLabel(column.key),
      type: column.type,
      value: row.fields[column.key],
    }));
}

function artifactListFields(
  signal: AgentSignal,
  row: AgentArtifactRow | undefined,
  columns: ResearchPlanColumn[]
) {
  // The title is already the card heading. Every other plan field remains in
  // the list; presentation below decides whether it is inline or narrative.
  // Relevance fields are represented by the labelled header badge, avoiding a
  // duplicate while keeping that plan field visible.
  const relevanceKeys = new Set(["fit_score", "relevance_score", "relevance"]);
  const fields = artifactDisplayFields(row, columns).filter(
    (field) =>
      !relevanceKeys.has(field.key) || artifactRelevanceScore(signal, row) === undefined
  );
  const body = signalBody(signal) || artifactBody(row);
  const hasBodyField = fields.some((field) => artifactFieldIsBody(field.key));
  if (row && body && !hasBodyField) {
    fields.push({
      key: "post_body",
      label: "Post body",
      type: "text" as const,
      value: body,
    });
  }
  if (fields.length) return fields;

  // Legacy runs may not contain artifact rows. Preserve the compact list
  // experience with source-truth metadata until they are re-run.
  const metadata = signal.metadata || {};
  return [
    {
      key: "author",
      label: "Author",
      type: "text" as const,
      value: signal.author || signal.author_username || signal.author_name || signal.subx,
    },
    {
      key: "channel",
      label: "Channel",
      type: "text" as const,
      value: signal.channel || signal.channel_name || metadata.channel || metadata.channel_name,
    },
    {
      key: "published_at",
      label: "Published",
      type: "date" as const,
      value: signal.published_at || signal.created_at || signal.time,
    },
    {
      key: "view_count",
      label: "Views",
      type: "number" as const,
      value: signal.view_count ?? metadata.view_count ?? metadata.views,
    },
    {
      key: "likes",
      label: "Likes",
      type: "number" as const,
      value: signal.likes ?? signal.like_count ?? metadata.likes ?? metadata.like_count,
    },
    {
      key: "retweets",
      label: "Retweets",
      type: "number" as const,
      value: signal.retweets ?? metadata.retweets ?? metadata.retweet_count,
    },
    {
      key: "replies",
      label: "Replies",
      type: "number" as const,
      value: signal.replies ?? metadata.replies ?? metadata.reply_count,
    },
    {
      key: "points",
      label: "Points",
      type: "number" as const,
      value: (signal as Record<string, unknown>).points ?? metadata.points,
    },
    {
      key: "comments",
      label: "Comments",
      type: "number" as const,
      value:
        (signal as Record<string, unknown>).num_comments ??
        (signal as Record<string, unknown>).comments ??
        metadata.num_comments ??
        metadata.comments,
    },
  ].filter((field) => field.value !== undefined && field.value !== null && field.value !== "");
}

function artifactSourceFactFields(
  signal: AgentSignal,
  row: AgentArtifactRow | undefined,
  dynamicFields: Array<{
    key: string;
    label: string;
    type: ResearchPlanColumn["type"];
    value: unknown;
  }>
) {
  const dynamicKeys = new Set(
    dynamicFields.map((field) => normalizeFieldKey(field.key))
  );
  const metadata = signal.metadata || {};
  const facts = [
    {
      key: "author",
      label: "Author",
      type: "text" as const,
      value: signal.author || signal.author_username || signal.author_name || signal.subx,
    },
    {
      key: "channel",
      label: "Channel",
      type: "text" as const,
      value: signal.channel || signal.channel_name || metadata.channel || metadata.channel_name,
    },
    {
      key: "published_at",
      label: "Published",
      type: "date" as const,
      value: signal.published_at || signal.created_at || signal.time,
    },
    {
      key: "view_count",
      label: "Views",
      type: "number" as const,
      value: signal.view_count ?? metadata.view_count ?? metadata.views,
    },
    {
      key: "likes",
      label: "Likes",
      type: "number" as const,
      value: signal.likes ?? signal.like_count ?? metadata.likes ?? metadata.like_count,
    },
    {
      key: "retweets",
      label: "Retweets",
      type: "number" as const,
      value: signal.retweets ?? metadata.retweets ?? metadata.retweet_count,
    },
    {
      key: "replies",
      label: "Replies",
      type: "number" as const,
      value: signal.replies ?? metadata.replies ?? metadata.reply_count,
    },
    {
      key: "points",
      label: "Points",
      type: "number" as const,
      value: (signal as Record<string, unknown>).points ?? metadata.points,
    },
    {
      key: "comments",
      label: "Comments",
      type: "number" as const,
      value:
        (signal as Record<string, unknown>).num_comments ??
        (signal as Record<string, unknown>).comments ??
        signal.comment_count ??
        metadata.comment_count ??
        metadata.num_comments ??
        metadata.comments,
    },
    {
      key: "duration",
      label: "Duration",
      type: "text" as const,
      value: signal.duration ?? metadata.duration,
    },
  ];

  return facts.filter(
    (field) =>
      field.value !== undefined &&
      field.value !== null &&
      field.value !== "" &&
      !dynamicKeys.has(normalizeFieldKey(field.key))
  );
}

function normalizeFieldKey(key: string) {
  return key.trim().toLowerCase().replace(/[-\s]+/g, "_");
}

function artifactListFieldIsNarrative(field: {
  key: string;
  type: ResearchPlanColumn["type"];
  value: unknown;
}) {
  if (field.type === "url") return true;
  if (artifactFieldIsBody(field.key)) return true;
  if (/reason|match|pain|recommendation/i.test(field.key)) {
    return true;
  }
  return String(field.value ?? "").length > 72;
}

function artifactFieldIsBody(key: string) {
  return /content|body|description|summary|excerpt|text/i.test(key);
}

function formatCompactFieldValue(
  value: unknown,
  type: ResearchPlanColumn["type"]
) {
  if (value === null || value === undefined || value === "") return "Unknown";
  if (type === "date") return formatDate(value as string | number);
  if (type === "number") {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return new Intl.NumberFormat().format(number);
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value).replace(/\s+/g, " ").trim();
}

function artifactRelevanceScore(
  signal: AgentSignal,
  row: AgentArtifactRow | undefined
) {
  const candidates = [
    row?.fields.fit_score,
    row?.fields.relevance_score,
    row?.fields.relevance,
    signal.overall_score,
    signal.relevance,
  ];
  for (const candidate of candidates) {
    const score = typeof candidate === "number" ? candidate : Number(candidate);
    if (candidate !== "" && candidate !== undefined && candidate !== null && Number.isFinite(score)) {
      return score;
    }
  }
  return undefined;
}

function formatRelevance(score: number) {
  return score >= 0 && score <= 1
    ? `${Math.round(score * 100)}%`
    : `${Math.round(score)}/100`;
}

function formatFieldLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function inferFieldType(
  key: string,
  value: unknown
): ResearchPlanColumn["type"] {
  if (/url|link|permalink/i.test(key)) return "url";
  if (/date|time|published|created/i.test(key)) return "date";
  if (/score|relevance|fit/i.test(key)) return "score";
  if (typeof value === "number") return "number";
  return "text";
}

function dedupeSignals(signals: AgentSignal[]) {
  const unique = new Map<string, AgentSignal>();
  for (const signal of signals) {
    const key = signalIdentityValues(signal)
      .map(normalizeIdentityValue)
      .find(Boolean) || signalId(signal);
    const existing = unique.get(key);
    // Prefer the richer/highest-scored copy when duplicate fetches disagree.
    if (
      !existing ||
      signalScore(signal) > signalScore(existing) ||
      signalTextLength(signal) > signalTextLength(existing)
    ) {
      unique.set(key, signal);
    }
  }
  return [...unique.values()];
}

function signalTextLength(signal: AgentSignal) {
  return String(signalBody(signal) || signal.title || "").length;
}

function signalScore(signal: AgentSignal) {
  if (typeof signal.overall_score === "number") return signal.overall_score;
  if (typeof signal.relevance === "number") return signal.relevance;
  if (typeof signal.score === "number") return signal.score;
  return 0;
}

function signalTime(signal: AgentSignal) {
  if (signal.created_at) {
    const date = parseSignalDate(signal.created_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (signal.published_at) {
    const date = parseSignalDate(signal.published_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (typeof signal.time === "number") return signal.time * 1000;
  return 0;
}

function signalSourceType(signal: AgentSignal) {
  const metadata = signal.metadata || {};
  const value = metadata.source_type;
  return typeof value === "string" && value.trim() ? value : "";
}

function matchedTerms(signal: AgentSignal) {
  return [...(signal.matched_terms || []), ...(signal.matched_keywords || [])]
    .map((term) => term.trim())
    .filter((term, index, values) => term && !term.startsWith("noise:") && values.indexOf(term) === index)
    .slice(0, 12);
}

function signalBody(signal: AgentSignal) {
  const metadata = signal.metadata || {};
  return String(
    signal.text ||
      signal.snippet ||
      signal.content ||
      signal.body ||
      signal.description ||
      metadata.content ||
      metadata.text ||
      metadata.body ||
      metadata.description ||
      ""
  ).trim();
}

function artifactBody(row: AgentArtifactRow | undefined) {
  if (!row) return "";
  const bodyKeys = [
    "post_body",
    "body",
    "content",
    "text",
    "description",
    "excerpt",
    "summary",
  ];
  for (const key of bodyKeys) {
    const value = row.fields[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function scoreColor(score: number) {
  if (score >= 45 || (score > 0 && score <= 1 && score >= 0.7)) {
    return "bg-emerald-600 text-white hover:bg-emerald-600";
  }
  if (score >= 30 || (score > 0 && score <= 1 && score >= 0.55)) {
    return "bg-amber-500 text-white hover:bg-amber-500";
  }
  if (score >= 15 || (score > 0 && score <= 1 && score >= 0.4)) {
    return "bg-orange-500 text-white hover:bg-orange-500";
  }
  return "bg-muted text-foreground hover:bg-muted";
}

function formatScore(score: number) {
  return score > 0 && score <= 1 ? score.toFixed(2) : Math.round(score).toString();
}

function formatDate(value: string | number) {
  const date = parseSignalDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function parseSignalDate(value: string | number) {
  if (typeof value === "number") {
    // HN/Firebase timestamps are Unix seconds. JavaScript Date expects
    // milliseconds, so convert second-scale values defensively.
    return new Date(value < 10_000_000_000 ? value * 1000 : value);
  }
  const numericValue = Number(value);
  if (value.trim() && Number.isFinite(numericValue) && /^\d+(\.\d+)?$/.test(value.trim())) {
    return new Date(numericValue < 10_000_000_000 ? numericValue * 1000 : numericValue);
  }
  return new Date(value);
}
