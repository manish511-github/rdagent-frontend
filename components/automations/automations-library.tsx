"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AutomationEditDialog } from "@/components/automations/automation-edit-dialog";
import type {
  AgentAutomationAction,
  AgentAutomationLibraryItem,
  AgentAutomationPatch,
  AgentAutomationRunStatus,
  AgentAutomationTask,
} from "@/lib/agent-chat/types";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleMinus,
  LoaderCircle,
  PanelRightOpen,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Table2,
  Zap,
} from "lucide-react";

type AgendaGroup = "Today" | "Tomorrow" | "This week" | "Later" | "Paused";

interface AutomationsLibraryProps {
  items: AgentAutomationLibraryItem[];
  isLoading: boolean;
  error: string | null;
  actionSlug: string | null;
  onRefresh: () => Promise<void>;
  onPause: (slug: string) => Promise<void>;
  onConfirm: (slug: string, action: AgentAutomationAction) => Promise<unknown>;
  onSave: (slug: string, patch: AgentAutomationPatch) => Promise<void>;
}

const GROUP_ORDER: AgendaGroup[] = [
  "Today",
  "Tomorrow",
  "This week",
  "Later",
  "Paused",
];

/** Convert known runtime error codes into useful, nontechnical UI copy. */
function friendlyError(raw: string): string {
  const map: Record<string, string> = {
    workspace_not_found:
      "The linked workspace could not be found. Please reconnect it in Agent Chat.",
    lead_source_not_found:
      "The saved lead source is missing. Re-create it from Agent Chat.",
    workspace_locked:
      "The workspace is locked because it already contains data.",
    workspace_validation_failed:
      "Workspace validation failed — check your table configuration.",
    workspace_error: "A workspace error occurred. Try running again.",
    automation_context_missing: "The automation or its owner no longer exists.",
  };

  const normalized = raw.toLowerCase();
  for (const [code, message] of Object.entries(map)) {
    if (normalized.includes(code)) return message;
  }
  return raw;
}

/** Date-only UTC value used for stable agenda grouping in every browser timezone. */
function utcDayNumber(value: Date): number {
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

function differenceInUtcDays(left: Date, right: Date): number {
  return Math.round((utcDayNumber(left) - utcDayNumber(right)) / 86_400_000);
}

function formatUtcDateTime(value?: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

function formatAgendaTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

function scheduleLabel(task: AgentAutomationTask): string {
  return task.schedule_json.label || task.cron_utc || "Schedule not set";
}

function groupForItem(
  item: AgentAutomationLibraryItem,
  now: Date,
): AgendaGroup {
  const { task } = item;
  if (task.status !== "active" || !task.next_run_at) return "Paused";

  const nextRun = new Date(task.next_run_at);
  if (Number.isNaN(nextRun.getTime())) return "Later";
  const difference = differenceInUtcDays(nextRun, now);
  if (difference <= 0) return "Today";
  if (difference === 1) return "Tomorrow";
  if (difference <= 7) return "This week";
  return "Later";
}

function groupItems(
  items: AgentAutomationLibraryItem[],
  now: Date,
): Array<{ label: AgendaGroup; items: AgentAutomationLibraryItem[] }> {
  const grouped = new Map<AgendaGroup, AgentAutomationLibraryItem[]>(
    GROUP_ORDER.map((label) => [label, []]),
  );

  for (const item of items) grouped.get(groupForItem(item, now))?.push(item);

  for (const values of grouped.values()) {
    values.sort((left, right) => {
      const leftTime = left.task.next_run_at
        ? new Date(left.task.next_run_at).getTime()
        : Number.POSITIVE_INFINITY;
      const rightTime = right.task.next_run_at
        ? new Date(right.task.next_run_at).getTime()
        : Number.POSITIVE_INFINITY;
      return (
        leftTime - rightTime || left.task.name.localeCompare(right.task.name)
      );
    });
  }

  return GROUP_ORDER.flatMap((label) => {
    const values = grouped.get(label) ?? [];
    return values.length > 0 ? [{ label, items: values }] : [];
  });
}

function runPresentation(status?: AgentAutomationRunStatus): {
  label: string;
  className: string;
  icon: typeof CheckCircle2;
} {
  if (status === "completed") {
    return {
      label: "Success",
      className: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    };
  }
  if (status === "partial") {
    return {
      label: "Partial",
      className: "text-amber-700 dark:text-amber-400",
      icon: AlertCircle,
    };
  }
  if (status === "failed" || status === "cancelled") {
    return {
      label: status === "failed" ? "Needs attention" : "Cancelled",
      className: "text-red-700 dark:text-red-400",
      icon: AlertCircle,
    };
  }
  if (status === "queued" || status === "running" || status === "waiting") {
    return {
      label: status === "queued" ? "Queued" : "In progress",
      className: "text-blue-700 dark:text-blue-400",
      icon: LoaderCircle,
    };
  }
  return {
    label: "No runs yet",
    className: "text-muted-foreground",
    icon: CircleMinus,
  };
}

function AutomationAgendaRow({
  item,
  isPending,
  onOpen,
  onPause,
  onConfirm,
}: {
  item: AgentAutomationLibraryItem;
  isPending: boolean;
  onOpen: (slug: string) => void;
  onPause: (slug: string) => Promise<void>;
  onConfirm: (slug: string, action: AgentAutomationAction) => Promise<unknown>;
}) {
  const [confirmStart, setConfirmStart] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const {
    task,
    latest_run: latestRun,
    attention_reason: attentionReason,
  } = item;
  const outcome = runPresentation(latestRun?.status);
  const OutcomeIcon = outcome.icon;
  const isActive = task.status === "active";

  const setActive = async (checked: boolean) => {
    setRowError(null);
    if (checked) {
      setConfirmStart(true);
      return;
    }
    try {
      await onPause(task.slug);
    } catch (caught) {
      setRowError(
        caught instanceof Error ? caught.message : "Could not pause automation",
      );
    }
  };

  const start = async () => {
    setRowError(null);
    try {
      await onConfirm(task.slug, "enable");
      setConfirmStart(false);
    } catch (caught) {
      setRowError(
        caught instanceof Error ? caught.message : "Could not start automation",
      );
    }
  };

  return (
    <>
      <article className="border-b border-border/70 last:border-b-0">
        <div className="grid items-center gap-3 px-4 py-3.5 sm:grid-cols-[78px_minmax(220px,1fr)_150px_150px_170px_36px] sm:px-5">
          <div className="hidden text-sm font-medium tabular-nums sm:block">
            {isActive ? formatAgendaTime(task.next_run_at) : "—"}
          </div>

          <button
            type="button"
            onClick={() => onOpen(task.slug)}
            className="flex min-w-0 items-center gap-3 rounded-md text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="size-[17px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {task.name}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {task.description || "Runs your saved Zooptics workflow."}
              </span>
            </span>
          </button>

          <div className="flex min-w-0 items-center gap-3 text-xs">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label={`${isActive ? "Pause" : "Start"} ${task.name}`}
              disabled={isPending || task.status === "archived"}
              onClick={() => void setActive(!isActive)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? "bg-blue-600" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute left-0 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
                  isActive ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`whitespace-nowrap pl-0.5 ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {isPending ? "Updating" : isActive ? "Active" : "Paused"}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="truncate text-foreground/80">{scheduleLabel(task)}</p>
            <p className="mt-0.5 sm:hidden">
              Next: {formatUtcDateTime(task.next_run_at)} UTC
            </p>
          </div>

          <div className="min-w-0 text-xs">
            <span
              className={`flex items-center gap-1.5 font-medium ${outcome.className}`}
            >
              <OutcomeIcon
                className={`size-4 shrink-0 ${latestRun?.status === "running" ? "animate-spin" : ""}`}
              />
              {attentionReason ? "Needs attention" : outcome.label}
            </span>
            <span className="mt-0.5 block truncate text-muted-foreground">
              {latestRun
                ? formatUtcDateTime(
                    latestRun.completed_at ||
                      latestRun.started_at ||
                      latestRun.created_at,
                  )
                : "No previous result"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpen(task.slug)}
            className="hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label={`View ${task.name}`}
          >
            <PanelRightOpen className="size-4" />
          </button>
        </div>

        {rowError ? (
          <p className="px-5 pb-3 text-xs text-destructive">
            {friendlyError(rowError)}
          </p>
        ) : null}
      </article>

      <AlertDialog open={confirmStart} onOpenChange={setConfirmStart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start this automation?</AlertDialogTitle>
            <AlertDialogDescription>
              {task.name} will become active and run on {scheduleLabel(task)} (
              {task.timezone}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                void start();
              }}
            >
              Start automation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type DrawerConfirmIntent = "enable" | "run_now" | "delete_active";

/**
 * A concise automation inspector used directly from the agenda.
 *
 * The drawer deliberately shows only the information needed for a quick
 * decision: whether the automation is active, when it runs next, where it
 * writes, and what happened most recently. Editing is kept in a separate
 * modal so the everyday inspection path stays lightweight.
 */
function AutomationQuickDrawer({
  item,
  open,
  isPending,
  onOpenChange,
  onPause,
  onConfirm,
  onSave,
}: {
  item: AgentAutomationLibraryItem | null;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onPause: (slug: string) => Promise<void>;
  onConfirm: (slug: string, action: AgentAutomationAction) => Promise<unknown>;
  onSave: (slug: string, patch: AgentAutomationPatch) => Promise<void>;
}) {
  const [confirmIntent, setConfirmIntent] =
    useState<DrawerConfirmIntent>("run_now");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  if (!item) return null;

  const {
    task,
    latest_run: latestRun,
    attention_reason: attentionReason,
  } = item;
  const outcome = runPresentation(latestRun?.status);
  const OutcomeIcon = outcome.icon;
  const isActive = task.status === "active";
  const resultsTableSlug = task.linked_table_slugs[0] || null;
  const resultsHref = resultsTableSlug
    ? `/agent-chat?conversation=${encodeURIComponent(task.workspace_id)}&table=${encodeURIComponent(resultsTableSlug)}`
    : null;

  const execute = async (operation: () => Promise<unknown>) => {
    setDrawerError(null);
    try {
      await operation();
      setConfirmOpen(false);
    } catch (caught) {
      setDrawerError(
        caught instanceof Error
          ? caught.message
          : "The action could not be completed",
      );
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-6 py-5 pr-12 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle>{task.name}</SheetTitle>
              <Badge variant="secondary" className="capitalize">
                {task.status}
              </Badge>
            </div>
            <SheetDescription className="leading-5">
              {task.description || "Runs your saved Zooptics workflow."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            {drawerError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Could not update automation</AlertTitle>
                <AlertDescription>
                  {friendlyError(drawerError)}
                </AlertDescription>
              </Alert>
            ) : null}

            <section
              aria-labelledby="drawer-next-run"
              className="flex items-start gap-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <CalendarClock className="size-5" />
              </span>
              <div className="min-w-0">
                <p
                  id="drawer-next-run"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Next run
                </p>
                <p className="mt-1 font-semibold">
                  {isActive
                    ? `${formatUtcDateTime(task.next_run_at)} UTC`
                    : "Not scheduled"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {scheduleLabel(task)} · {task.timezone}
                </p>
              </div>
            </section>

            <Separator />

            <section aria-labelledby="drawer-latest-result">
              <div className="flex items-center justify-between gap-3">
                <h3 id="drawer-latest-result" className="text-sm font-semibold">
                  Latest result
                </h3>
                <span
                  className={`flex items-center gap-1.5 text-xs font-medium ${outcome.className}`}
                >
                  <OutcomeIcon
                    className={`size-4 ${latestRun?.status === "running" ? "animate-spin" : ""}`}
                  />
                  {attentionReason ? "Needs attention" : outcome.label}
                </span>
              </div>
              {latestRun ? (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatUtcDateTime(
                      latestRun.completed_at ||
                        latestRun.started_at ||
                        latestRun.created_at,
                    )}{" "}
                    UTC
                  </p>
                  <p className="line-clamp-4 text-sm leading-6">
                    {latestRun.summary ||
                      (latestRun.status === "running" ||
                      latestRun.status === "queued"
                        ? "This run is still in progress."
                        : "No summary was produced for this run.")}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  This automation has not run yet.
                </p>
              )}
            </section>

            <Separator />

            <section aria-labelledby="drawer-destination">
              <h3
                id="drawer-destination"
                className="text-xs font-medium text-muted-foreground"
              >
                Saves to
              </h3>
              <p className="mt-1 break-words text-sm font-medium">
                {task.linked_table_slugs.length
                  ? task.linked_table_slugs.join(", ")
                  : "No linked table"}
              </p>
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4">
            {resultsHref ? (
              <Button size="sm" asChild>
                <Link href={resultsHref} onClick={() => onOpenChange(false)}>
                  <Table2 data-icon="inline-start" />
                  View results
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled
                title="This automation does not have a linked results table."
              >
                <Table2 data-icon="inline-start" />
                View results
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || task.status === "archived"}
              onClick={() => setEditOpen(true)}
            >
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            {isActive ? (
              <>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setConfirmIntent("run_now");
                    setConfirmOpen(true);
                  }}
                >
                  <Play data-icon="inline-start" />
                  Run now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => void execute(() => onPause(task.slug))}
                >
                  <Pause data-icon="inline-start" />
                  Pause
                </Button>
              </>
            ) : task.status !== "archived" ? (
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setConfirmIntent("enable");
                  setConfirmOpen(true);
                }}
              >
                <Play data-icon="inline-start" />
                Start
              </Button>
            ) : null}
            {task.status !== "archived" ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => {
                  setConfirmIntent("delete_active");
                  setConfirmOpen(true);
                }}
              >
                <Archive data-icon="inline-start" />
                Archive
              </Button>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AutomationEditDialog
        task={task}
        open={editOpen}
        pending={isPending}
        onOpenChange={setEditOpen}
        onSave={(patch) => onSave(task.slug, patch)}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmIntent === "run_now"
                ? "Run this automation now?"
                : confirmIntent === "enable"
                  ? "Start this automation?"
                  : "Archive this automation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmIntent === "run_now"
                ? "This creates one additional run without changing the schedule."
                : confirmIntent === "enable"
                  ? `It will run on ${scheduleLabel(task)} (${task.timezone}).`
                  : "Future runs will stop. The automation configuration remains stored."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as is</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className={
                confirmIntent === "delete_active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                void execute(() => onConfirm(task.slug, confirmIntent));
              }}
            >
              {confirmIntent === "run_now"
                ? "Run now"
                : confirmIntent === "enable"
                  ? "Start"
                  : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AutomationsLibrary({
  items,
  isLoading,
  error,
  actionSlug,
  onRefresh,
  onPause,
  onConfirm,
  onSave,
}: AutomationsLibraryProps) {
  const [now] = useState(() => new Date());
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const groupedItems = useMemo(() => groupItems(items, now), [items, now]);
  const selectedItem = selectedSlug
    ? items.find(({ task }) => task.slug === selectedSlug) || null
    : null;

  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6 md:py-5">
        <div className="overflow-hidden rounded-md bg-slate-900 text-white">
          <div className="flex min-h-[220px] flex-col gap-6 px-5 py-7 md:min-h-[236px] md:flex-row md:items-center md:px-8 md:py-6">
            <div className="z-10 flex-1 space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                <Zap className="size-5 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Automations
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
                  Set it up once. Zooptics runs it on schedule and delivers
                  fresh results when you need them.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                <Link href="/agent-chat">
                  <Plus className="mr-1.5 size-4" />
                  Create automation
                </Link>
              </Button>
            </div>

            <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-lg md:h-[190px] md:w-[42%]">
              <Image
                src="/images/analysis.png"
                alt="Zooptics analysis workspace"
                fill
                priority
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Upcoming runs
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All schedules and run times are shown in UTC.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isLoading}
            onClick={() => void onRefresh()}
            aria-label="Refresh automations"
            title="Refresh automations"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not load automations</AlertTitle>
            <AlertDescription>{friendlyError(error)}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="mt-5 space-y-5">
            {Array.from({ length: 2 }, (_, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : groupedItems.length > 0 ? (
          <div className="mt-5 space-y-5 pb-8">
            {groupedItems.map((group) => (
              <section
                key={group.label}
                aria-labelledby={`agenda-${group.label}`}
              >
                <h3
                  id={`agenda-${group.label}`}
                  className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {group.label}
                </h3>
                <div className="overflow-hidden rounded-lg border bg-card">
                  {group.items.map((item) => (
                    <AutomationAgendaRow
                      key={item.task.public_id}
                      item={item}
                      isPending={actionSlug === item.task.slug}
                      onOpen={setSelectedSlug}
                      onPause={onPause}
                      onConfirm={onConfirm}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <CalendarDays className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No automations yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create one in Agent Chat, preview the workflow, and choose when
                it should run.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/agent-chat">
                Create automation
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      <AutomationQuickDrawer
        item={selectedItem}
        open={selectedItem !== null}
        isPending={selectedItem ? actionSlug === selectedItem.task.slug : false}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedSlug(null);
        }}
        onPause={onPause}
        onConfirm={onConfirm}
        onSave={onSave}
      />
    </>
  );
}
