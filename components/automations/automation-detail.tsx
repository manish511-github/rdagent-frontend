"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Ban,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  History,
  Pause,
  Pencil,
  Play,
  RefreshCw,
} from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgentAutomationAction,
  AgentAutomationDetail,
  AgentAutomationPatch,
  AgentAutomationRunDetail,
  AgentAutomationRunStatus,
} from "@/lib/agent-chat/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

interface AutomationDetailViewProps {
  detail: AgentAutomationDetail | null;
  isLoading: boolean;
  pendingAction: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  confirm: (action: AgentAutomationAction, patch?: AgentAutomationPatch) => Promise<void>;
  pause: () => Promise<void>;
  save: (patch: AgentAutomationPatch) => Promise<void>;
  cancelRun: (runId: string) => Promise<void>;
}

type ConfirmIntent = "enable" | "run_now" | "delete_active" | "cancel_run";

const ACTIVE_RUNS = new Set<AgentAutomationRunStatus>(["queued", "running", "waiting"]);

/** Map back-end error codes to human-readable messages. */
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
    workspace_error:
      "A workspace error occurred. Try running again or contact support.",
    automation_context_missing:
      "The automation or its owner no longer exists.",
  };
  for (const [code, message] of Object.entries(map)) {
    if (raw.toLowerCase().includes(code)) return message;
  }
  return raw;
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  const milliseconds = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "—";
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function runBadgeClass(status: AgentAutomationRunStatus) {
  if (status === "completed")
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
  if (status === "failed")
    return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25";
  return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/25";
}

function statusBadgeClass(status: string) {
  if (status === "active")
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
  if (status === "paused")
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25";
  if (status === "archived")
    return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25";
  return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/25";
}

/* ------------------------------------------------------------------ */
/*  Main view                                                         */
/* ------------------------------------------------------------------ */

export function AutomationDetailView({
  detail,
  isLoading,
  pendingAction,
  error,
  refresh,
  confirm,
  pause,
  save,
  cancelRun,
}: AutomationDetailViewProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [confirmIntent, setConfirmIntent] = useState<ConfirmIntent | null>(null);
  const [cancelRunId, setCancelRunId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedRun = useMemo(
    () =>
      detail?.runs.find(({ run }) => run.public_id === selectedRunId) ||
      detail?.runs[0] ||
      null,
    [detail, selectedRunId]
  );

  const totalCredits = useMemo(
    () =>
      detail?.runs.reduce((total, { run }) => total + Number(run.credits_used || 0), 0) || 0,
    [detail]
  );

  const successfulRuns = detail?.runs.filter(({ run }) => run.status === "completed").length || 0;

  useEffect(() => {
    if (!selectedRunId && detail?.runs[0]) setSelectedRunId(detail.runs[0].run.public_id);
  }, [detail, selectedRunId]);

  const act = async (operation: () => Promise<void>, after?: () => void) => {
    setActionError(null);
    try {
      await operation();
      after?.();
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "The action could not be completed"
      );
    }
  };

  /* Loading skeleton */
  if (isLoading && !detail) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  /* Not found */
  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Automation unavailable</AlertTitle>
          <AlertDescription>
            {friendlyError(error || "This automation could not be loaded.")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { task } = detail;
  const scheduleLabel = task.schedule_json.label || task.cron_utc;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* ── Back + header ── */}
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
          <Link href="/automations">
            <ArrowLeft className="mr-1 size-4" />
            Automations
          </Link>
        </Button>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {task.name}
              </h1>
              <Badge
                variant="outline"
                className={`capitalize ${statusBadgeClass(task.status)}`}
              >
                {task.status}
              </Badge>
            </div>
            {task.description ? (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {task.description}
              </p>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={isLoading || Boolean(pendingAction)}
            >
              <RefreshCw className="mr-1 size-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              disabled={task.status === "archived" || Boolean(pendingAction)}
            >
              <Pencil className="mr-1 size-3.5" />
              Edit
            </Button>
            {task.status === "active" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmIntent("run_now")}
                  disabled={Boolean(pendingAction)}
                >
                  <Play className="mr-1 size-3.5" />
                  Run now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void act(pause)}
                  disabled={Boolean(pendingAction)}
                >
                  <Pause className="mr-1 size-3.5" />
                  Pause
                </Button>
              </>
            ) : task.status !== "archived" ? (
              <Button
                size="sm"
                onClick={() => setConfirmIntent("enable")}
                disabled={Boolean(pendingAction)}
              >
                <Play className="mr-1 size-3.5" />
                Start
              </Button>
            ) : null}
            {task.status !== "archived" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmIntent("delete_active")}
                disabled={Boolean(pendingAction)}
              >
                <Archive className="mr-1 size-3.5" />
                Archive
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error || actionError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{friendlyError(actionError || error || "")}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── Stats row ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Schedule</CardDescription>
            <CardTitle className="text-base">{scheduleLabel}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            {task.timezone} · Next {formatDate(task.next_run_at)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Run history</CardDescription>
            <CardTitle className="text-base">
              {detail.runs.length} run{detail.runs.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="size-3.5" />
            {successfulRuns} completed
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Usage</CardDescription>
            <CardTitle className="text-base">{totalCredits.toFixed(2)} credits</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleDollarSign className="size-3.5" />
            Across all loaded runs
          </CardContent>
        </Card>
      </div>

      {/* ── Workflow instructions ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6">{task.prompt}</p>
          </div>

          {/* Linked tables + safeguards summary */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>
              Linked tables:{" "}
              {task.linked_table_slugs.length
                ? task.linked_table_slugs.join(", ")
                : "None"}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>Max runtime: {Math.round(task.max_runtime_seconds / 60)} min</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Run history ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Run history
          </CardTitle>
          <CardDescription>
            Select a run to see its outcome and linked conversation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {detail.runs.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="text-right">Inspect</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.runs.map((item) => (
                    <TableRow
                      key={item.run.public_id}
                      data-state={
                        selectedRun?.run.public_id === item.run.public_id
                          ? "selected"
                          : undefined
                      }
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${runBadgeClass(item.run.status)}`}
                        >
                          {item.run.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-36">
                        {formatDate(item.run.scheduled_for)}
                      </TableCell>
                      <TableCell>
                        {formatDuration(item.run.started_at, item.run.completed_at)}
                      </TableCell>
                      <TableCell>{item.run.credits_used.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRunId(item.run.public_id)}
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center">
              <Clock3 className="size-7 text-muted-foreground" />
              <p className="font-medium">No runs yet</p>
              <p className="text-sm text-muted-foreground">
                Start this automation or run it once to see results here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Run inspector (simplified) ── */}
      {selectedRun ? (
        <RunInspector
          item={selectedRun}
          isCancelling={pendingAction === `cancel:${selectedRun.run.public_id}`}
          onCancel={() => {
            setCancelRunId(selectedRun.run.public_id);
            setConfirmIntent("cancel_run");
          }}
        />
      ) : null}

      {/* ── Edit dialog ── */}
      <EditAutomationDialog
        task={task}
        open={editOpen}
        pending={Boolean(pendingAction)}
        onOpenChange={setEditOpen}
        onSave={(patch) => act(() => save(patch), () => setEditOpen(false))}
      />

      {/* ── Confirm dialog ── */}
      <AlertDialog
        open={confirmIntent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmIntent(null);
            setCancelRunId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmIntent === "run_now"
                ? "Run this automation now?"
                : confirmIntent === "enable"
                  ? "Start this automation?"
                  : confirmIntent === "cancel_run"
                    ? "Cancel this run?"
                    : "Archive this automation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmIntent === "run_now"
                ? "This creates one additional run without changing the normal schedule."
                : confirmIntent === "enable"
                  ? `This workflow will run on ${scheduleLabel} (${task.timezone}).`
                  : confirmIntent === "cancel_run"
                    ? "Active work owned by this run will be stopped. Completed results remain visible."
                    : "Future runs will stop. Configuration and history will remain available."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as is</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmIntent === "cancel_run" || confirmIntent === "delete_active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              disabled={Boolean(pendingAction)}
              onClick={(event) => {
                event.preventDefault();
                const operation =
                  confirmIntent === "cancel_run" && cancelRunId
                    ? () => cancelRun(cancelRunId)
                    : () => confirm(confirmIntent as AgentAutomationAction);
                void act(operation, () => {
                  setConfirmIntent(null);
                  setCancelRunId(null);
                });
              }}
            >
              {confirmIntent === "cancel_run"
                ? "Cancel run"
                : confirmIntent === "delete_active"
                  ? "Archive"
                  : confirmIntent === "run_now"
                    ? "Run now"
                    : "Start"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Run inspector (simplified)                                        */
/* ------------------------------------------------------------------ */

function RunInspector({
  item,
  isCancelling,
  onCancel,
}: {
  item: AgentAutomationRunDetail;
  isCancelling: boolean;
  onCancel: () => void;
}) {
  const { run } = item;
  const errorCode =
    typeof run.error_json?.code === "string" ? run.error_json.code : null;
  const errorMessage =
    typeof run.error_json?.message === "string" ? run.error_json.message : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Run inspection</CardTitle>
          <CardDescription>
            {formatDate(run.scheduled_for)} · v{run.task_version}
          </CardDescription>
        </div>
        {ACTIVE_RUNS.has(run.status) ? (
          <Button variant="destructive" size="sm" disabled={isCancelling} onClick={onCancel}>
            <Ban className="mr-1 size-3.5" />
            Cancel run
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Outcome */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Outcome</p>
          <p className="whitespace-pre-wrap text-sm leading-6">
            {run.summary
              ? friendlyError(run.summary)
              : ACTIVE_RUNS.has(run.status)
                ? "This run is still in progress. Refresh to see new output."
                : "No output summary was produced."}
          </p>
        </div>

        {/* Warning */}
        {run.warning ? (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{run.warning}</AlertDescription>
          </Alert>
        ) : null}

        {/* Error */}
        {run.error_json ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{errorCode || "Run failed"}</AlertTitle>
            <AlertDescription>
              {friendlyError(errorMessage || errorCode || "An unknown error occurred.")}
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Conversation link */}
        {item.conversation_public_id ? (
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link
              href={`/agent-chat?conversation=${encodeURIComponent(item.conversation_public_id)}`}
            >
              <ExternalLink className="mr-1 size-3.5" />
              Open Agent Chat conversation
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            No conversation was created for this run.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit dialog (simplified: 4 fields)                                */
/* ------------------------------------------------------------------ */

function EditAutomationDialog({
  task,
  open,
  pending,
  onOpenChange,
  onSave,
}: {
  task: AgentAutomationDetail["task"];
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: AgentAutomationPatch) => Promise<void>;
}) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [prompt, setPrompt] = useState(task.prompt);
  const [cron, setCron] = useState(task.schedule_json.cron_local || task.cron_utc);
  const [timezone, setTimezone] = useState(task.timezone);

  useEffect(() => {
    if (open) {
      setName(task.name);
      setDescription(task.description);
      setPrompt(task.prompt);
      setCron(task.schedule_json.cron_local || task.cron_utc);
      setTimezone(task.timezone);
    }
  }, [open, task]);

  const valid = name.trim() && prompt.trim() && cron.trim() && timezone.trim();

  // Auto-generate a human-readable label from common cron patterns
  function cronLabel(expr: string): string {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return expr;
    const [min, hour] = parts;
    if (parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
      return `Every day at ${hour}:${min.padStart(2, "0")}`;
    }
    return expr;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit automation</DialogTitle>
          <DialogDescription>
            {task.status === "active"
              ? "Saving updates future live runs."
              : "Changes remain inactive until you start the automation."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="automation-name">Name</FieldLabel>
            <Input
              id="automation-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="automation-description">Description</FieldLabel>
            <Textarea
              id="automation-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="automation-prompt">Run instructions</FieldLabel>
            <Textarea
              id="automation-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
            />
            <FieldDescription>
              These exact instructions are snapshotted into every new run.
            </FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="automation-cron">Schedule (cron)</FieldLabel>
              <Input
                id="automation-cron"
                value={cron}
                onChange={(event) => setCron(event.target.value)}
                placeholder="0 9 * * *"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="automation-timezone">Timezone</FieldLabel>
              <Input
                id="automation-timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="UTC"
              />
            </Field>
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || pending}
            onClick={() =>
              void onSave({
                name: name.trim(),
                description: description.trim(),
                prompt: prompt.trim(),
                timezone: timezone.trim(),
                schedule: {
                  kind: "cron",
                  cron_local: cron.trim(),
                  label: cronLabel(cron.trim()),
                },
                cron_utc: cron.trim(),
              })
            }
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
