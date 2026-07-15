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
import type { ResearchPlan } from "@/lib/mention-tracking/types";
import {
  formatPlatformLabel,
  signalPlatform,
} from "@/lib/mention-tracking/signal-utils";
import { cn } from "@/lib/utils";

export type MentionSignal = {
  platform?: string;
  source?: string;
  title?: string;
  url?: string;
  snippet?: string;
  text?: string;
  author?: string | null;
  author_name?: string | null;
  subreddit?: string | null;
  subx?: string | null;
  post_id?: string | null;
  overall_score?: number;
  category?: string;
  reason?: string;
  suggested_action?: string;
  query?: string;
  published_at?: string | null;
  created_at?: string | null;
  matched_terms?: string[];
  matched_keywords?: string[];
  sentiment?: string;
  signal_strength?: string;
  noise_type?: string | null;
  is_actionable?: boolean;
  metadata?: Record<string, unknown>;
  score?: number;
  relevance?: number;
  time?: number;
  relevant_comment_ids?: number[];
};

export type MentionWorkspaceEvent = {
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

type MentionWorkspaceData = {
  answer: string;
  skill_used: string;
  tool_calls: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  signals: MentionSignal[];
};

type StatusFilter = "all" | "actionable" | "comments" | "news" | "promo" | "low_relevance";
type SortOrder = "relevance" | "newest" | "oldest";

type MentionWorkspacePanelProps = {
  data?: MentionWorkspaceData;
  liveSignals: MentionSignal[];
  workspaceEvents?: MentionWorkspaceEvent[];
  isSearching: boolean;
  trackerPrompt?: string;
  sessionTitle?: string;
  researchPlan?: ResearchPlan | null;
  onExecutePlan?: (message: string, plan: ResearchPlan) => void;
};

export function MentionWorkspacePanel({
  data,
  liveSignals,
  workspaceEvents = [],
  isSearching,
  trackerPrompt,
  sessionTitle,
  researchPlan,
  onExecutePlan,
}: MentionWorkspacePanelProps) {
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

  const filteredSignals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = signals.filter((signal) => {
      if (!matchesStatusFilter(signal, statusFilter)) return false;
      if (!query) return true;
      return [
        signal.title,
        signal.snippet,
        signal.text,
        signal.author,
        signal.author_name,
        signal.subreddit,
        signal.source,
        signalPlatform(signal),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "newest") return signalTime(b) - signalTime(a);
      if (sortOrder === "oldest") return signalTime(a) - signalTime(b);
      return signalScore(b) - signalScore(a);
    });
  }, [searchQuery, signals, sortOrder, statusFilter]);

  useEffect(() => {
    if (!filteredSignals.length) {
      setSelectedId(null);
      setIsDetailsOpen(false);
      return;
    }
    if (!selectedId || !filteredSignals.some((signal) => signalId(signal) === selectedId)) {
      setSelectedId(signalId(filteredSignals[0]));
    }
  }, [filteredSignals, selectedId]);

  const selectedSignal = filteredSignals.find((signal) => signalId(signal) === selectedId) || null;
  const latestSignalKeys = useMemo(() => {
    return new Set(
      workspaceEvents
        .filter((event) => event.type === "mention_found" && event.signalKey)
        .slice(-6)
        .map((event) => event.signalKey as string)
    );
  }, [workspaceEvents]);
  const platformSummaries = useMemo(
    () => summarizePlatforms(signals, workspaceEvents, isSearching),
    [isSearching, signals, workspaceEvents]
  );
  const trackerTerms = useMemo(() => {
    return Array.from(new Set(signals.flatMap(matchedTerms))).slice(0, 16);
  }, [signals]);

  if (researchPlan && onExecutePlan) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-gray-50 dark:bg-black">
        <div className="border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{researchPlan.title}</h2>
              <p className="truncate text-xs text-muted-foreground">Review the plan, then run the search loop.</p>
            </div>
            <Button
              size="sm"
              disabled={isSearching}
              onClick={() => onExecutePlan(researchPlan.message, researchPlan)}
            >
              {isSearching ? "Running..." : "Execute plan"}
            </Button>
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
                <h2 className="truncate text-base font-semibold">Mentions</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {signals.length} mention{signals.length === 1 ? "" : "s"}
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
                  placeholder="Search mentions..."
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
            {filteredSignals.length ? (
              filteredSignals.map((signal, index) => (
                <MentionListItem
                  key={`${signalId(signal)}-${index}`}
                  signal={signal}
                  isNew={latestSignalKeys.has(signalId(signal))}
                  isSelected={signalId(signal) === selectedId}
                  onSelect={() => {
                    setSelectedId(signalId(signal));
                    setIsDetailsOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <Search className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No mentions yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isSearching
                      ? "Waiting for mentions…"
                      : "Run a mention tracking search."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isDetailsOpen && selectedSignal && (
          <div className="relative ml-2 hidden min-h-0 min-w-0 flex-[3] flex-col lg:flex">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background">
              <MentionDetails signal={selectedSignal} />
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
          <p className="text-xs text-muted-foreground">mentions in this run</p>
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
        <h3 className="text-sm font-semibold">{title || "Mention tracker"}</h3>
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
                  Terms will appear as mentions stream in.
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
  events: MentionWorkspaceEvent[];
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
  isNew,
  isSelected,
  onSelect,
}: {
  signal: MentionSignal;
  isNew: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const body = signal.snippet || signal.text || "";
  const platform = signalPlatform(signal);
  const createdAt = signal.created_at || signal.published_at;

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
        <Badge className={cn("ml-auto px-1.5 py-0 text-[10px]", scoreColor(signalScore(signal)))}>
          {formatScore(signalScore(signal))}
        </Badge>
        {isNew && (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            New
          </Badge>
        )}
      </div>
      <h3 className="line-clamp-1 text-sm font-medium text-foreground">
        {signal.title || "Untitled mention"}
      </h3>
      {body && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {body}
        </p>
      )}
      <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        {signal.subreddit && <span className="truncate">r/{signal.subreddit}</span>}
        {(signal.author || signal.author_name || signal.subx) && (
          <span className="truncate">@{signal.author || signal.author_name || signal.subx}</span>
        )}
        {createdAt && (
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <Clock className="size-3" />
            {formatDate(createdAt)}
          </span>
        )}
      </div>
    </button>
  );
}

function MentionDetails({ signal }: { signal: MentionSignal }) {
  const score = signalScore(signal);
  const platform = signalPlatform(signal);
  const body = signal.text || signal.snippet || "";
  const terms = matchedTerms(signal);

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
          {signal.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={signal.url} target="_blank" rel="noopener noreferrer">
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
            {(signal.author || signal.author_name || signal.subx) && (
              <span>@{signal.author || signal.author_name || signal.subx}</span>
            )}
          </div>
          <h2 className="text-lg font-semibold leading-7 text-foreground">
            {signal.title || "Untitled mention"}
          </h2>
          {body && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          )}
        </div>

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

        {(signal.reason || signal.suggested_action || signal.relevant_comment_ids?.length) && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4 text-muted-foreground" />
              Match context
            </div>
            <div className="space-y-2 text-sm leading-6 text-muted-foreground">
              {signal.reason && <p>{signal.reason}</p>}
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

function ActivityIcon({ event }: { event: MentionWorkspaceEvent }) {
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
  signals: MentionSignal[],
  events: MentionWorkspaceEvent[],
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
      ? `${label} returned ${count} mention${count === 1 ? "" : "s"}.`
      : `${label} completed with no mentions.`;
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

function matchesStatusFilter(signal: MentionSignal, filter: StatusFilter) {
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

function signalId(signal: MentionSignal) {
  return signal.url || signal.post_id || `${signalPlatform(signal)}-${signal.title || ""}-${signalTime(signal)}`;
}

function dedupeSignals(signals: MentionSignal[]) {
  const unique = new Map<string, MentionSignal>();
  for (const signal of signals) {
    const key = signalId(signal);
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

function signalTextLength(signal: MentionSignal) {
  return String(signal.text || signal.snippet || signal.title || "").length;
}

function signalScore(signal: MentionSignal) {
  if (typeof signal.overall_score === "number") return signal.overall_score;
  if (typeof signal.relevance === "number") return signal.relevance;
  if (typeof signal.score === "number") return signal.score;
  return 0;
}

function signalTime(signal: MentionSignal) {
  if (signal.created_at) {
    const date = new Date(signal.created_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (signal.published_at) {
    const date = new Date(signal.published_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (typeof signal.time === "number") return signal.time * 1000;
  return 0;
}

function signalSourceType(signal: MentionSignal) {
  const metadata = signal.metadata || {};
  const value = metadata.source_type;
  return typeof value === "string" && value.trim() ? value : "";
}

function matchedTerms(signal: MentionSignal) {
  return [...(signal.matched_terms || []), ...(signal.matched_keywords || [])]
    .map((term) => term.trim())
    .filter((term, index, values) => term && !term.startsWith("noise:") && values.indexOf(term) === index)
    .slice(0, 12);
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
