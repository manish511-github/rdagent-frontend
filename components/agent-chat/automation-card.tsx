"use client";

import { useMemo, useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgentAutomationAction,
  AgentAutomationActionResult,
  AgentAutomationPatch,
  AgentAutomationTask,
  ChatBlock,
} from "@/lib/agent-chat/types";
import {
  CalendarClock,
  Coins,
  Database,
  Loader2,
  Pause,
  Pencil,
  Play,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

type DraftBlock = Extract<ChatBlock, { kind: "automation_draft" }>;
type ConfirmationBlock = Extract<ChatBlock, { kind: "automation_confirmation" }>;

export interface AutomationCardActions {
  onRefresh: (slug: string) => Promise<AgentAutomationTask>;
  onSave: (input: {
    slug: string;
    expectedVersion: number;
    patch: AgentAutomationPatch;
    confirmLiveEdit?: boolean;
  }) => Promise<AgentAutomationTask>;
  onPause: (slug: string, expectedVersion: number) => Promise<AgentAutomationTask>;
  onConfirm: (input: {
    slug: string;
    expectedVersion: number;
    action: AgentAutomationAction;
    patch?: AgentAutomationPatch;
  }) => Promise<AgentAutomationActionResult>;
}

function formatNextRun(value?: string | null): string {
  if (!value) return "Starts after you confirm";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Next run scheduled";
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function monthlyRuns(cron: string): number | null {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const [, hour, dayOfMonth, , dayOfWeek] = fields;
  if (hour.includes("/12")) return 60;
  if (dayOfMonth === "*" && dayOfWeek === "*") return 30;
  if (dayOfWeek !== "*") return 4.33;
  if (dayOfMonth !== "*") return 1;
  return null;
}

function costText(cost: number | null | undefined, cron: string): string {
  if (typeof cost !== "number") return "Estimate available after a preview run";
  const runs = monthlyRuns(cron);
  const perRun = `${cost.toFixed(cost < 1 ? 2 : 1)} credits / run`;
  return runs ? `${perRun} · ~${(cost * runs).toFixed(1)} / month` : perRun;
}

function statusVariant(status: DraftBlock["status"]) {
  if (status === "active") return "default" as const;
  if (status === "archived") return "destructive" as const;
  return "secondary" as const;
}

function taskPatchFromForm(form: {
  name: string;
  description: string;
  prompt: string;
  cron: string;
  scheduleLabel: string;
  timezone: string;
  linkedTables: string;
}): AgentAutomationPatch {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    prompt: form.prompt.trim(),
    timezone: form.timezone.trim(),
    schedule: {
      kind: "cron",
      cron_local: form.cron.trim(),
      label: form.scheduleLabel.trim(),
    },
    // The worker calculates future occurrences from local cron + timezone.
    // cron_utc remains the same transport/debug snapshot used by the sandbox.
    cron_utc: form.cron.trim(),
    linked_table_slugs: form.linkedTables
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

export function AutomationDraftCard({
  block,
  disabled,
  actions,
}: {
  block: DraftBlock;
  disabled?: boolean;
  actions: AutomationCardActions;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<AgentAutomationAction | null>(null);
  const [task, setTask] = useState<AgentAutomationTask | null>(null);
  const [pendingPatch, setPendingPatch] = useState<AgentAutomationPatch | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: block.name,
    description: block.description,
    prompt: block.promptPreview,
    cron: block.cron,
    scheduleLabel: block.scheduleLabel,
    timezone: block.timezone,
    linkedTables: block.linkedTableSlugs.join(", "),
  });

  const currentVersion = task?.version ?? block.version;
  const isBusy = disabled || block.busy;
  const canSubmitEdit = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.prompt.trim().length > 0 &&
      form.cron.trim().length > 0 &&
      form.scheduleLabel.trim().length > 0 &&
      form.timezone.trim().length > 0,
    [form]
  );

  const refreshForReview = async (action: AgentAutomationAction) => {
    setFormError(null);
    try {
      const fresh = await actions.onRefresh(block.slug);
      setTask(fresh);
      setConfirmAction(action);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not refresh this automation");
    }
  };

  const openEditor = async () => {
    setFormError(null);
    try {
      const fresh = await actions.onRefresh(block.slug);
      setTask(fresh);
      setForm({
        name: fresh.name,
        description: fresh.description,
        prompt: fresh.prompt,
        cron: fresh.schedule_json.cron_local || fresh.cron_utc,
        scheduleLabel: fresh.schedule_json.label || fresh.cron_utc,
        timezone: fresh.timezone,
        linkedTables: fresh.linked_table_slugs.join(", "),
      });
      setEditOpen(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not open the editor");
    }
  };

  const saveEdit = async () => {
    if (!task || !canSubmitEdit) return;
    const patch = taskPatchFromForm(form);
    if (task.status === "active") {
      setPendingPatch(patch);
      setConfirmAction("edit_live");
      return;
    }
    setFormError(null);
    try {
      const saved = await actions.onSave({
        slug: task.slug,
        expectedVersion: task.version,
        patch,
      });
      setTask(saved);
      setEditOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save changes");
    }
  };

  const pause = async () => {
    setFormError(null);
    try {
      const fresh = await actions.onRefresh(block.slug);
      const paused = await actions.onPause(block.slug, fresh.version);
      setTask(paused);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not pause this automation");
    }
  };

  const confirm = async () => {
    if (!confirmAction) return;
    setFormError(null);
    try {
      const result = await actions.onConfirm({
        slug: block.slug,
        expectedVersion: currentVersion,
        action: confirmAction,
        ...(confirmAction === "edit_live" && pendingPatch ? { patch: pendingPatch } : {}),
      });
      setTask(result.task);
      setConfirmAction(null);
      setPendingPatch(null);
      if (confirmAction === "edit_live") setEditOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The action could not be completed");
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3 border-b bg-muted/25 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{block.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {block.description || "Recurring Agent Chat work"}
              </CardDescription>
            </div>
            <Badge variant={statusVariant(block.status)} className="capitalize">
              {block.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 py-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-2.5">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium">{block.scheduleLabel}</p>
                <p className="text-xs text-muted-foreground">{block.timezone}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <RotateCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Next run</p>
                <p className="text-xs text-muted-foreground">
                  {formatNextRun(block.nextRunAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 sm:col-span-2">
              <Coins className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Estimated usage</p>
                <p className="text-xs text-muted-foreground">
                  {costText(block.estimatedCostPerRun, block.cron)}
                </p>
              </div>
            </div>
          </div>

          {block.linkedTableSlugs.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-3">
              <Database className="size-4 text-muted-foreground" />
              {block.linkedTableSlugs.map((slug) => (
                <Badge key={slug} variant="outline" className="font-normal">
                  {slug}
                </Badge>
              ))}
            </div>
          ) : null}

          {block.promptPreview ? (
            <div className="rounded-lg border bg-background p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Run instructions</p>
              <p className="line-clamp-3 text-sm leading-5">{block.promptPreview}</p>
            </div>
          ) : null}

          {block.actionError || formError ? (
            <p className="text-xs text-destructive">{block.actionError || formError}</p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-between gap-2 border-t bg-muted/15 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            Changes are version checked
          </div>
          <div className="flex gap-2">
            {block.status !== "archived" ? (
              <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={openEditor}>
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
            ) : null}
            {block.status === "active" ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => void refreshForReview("run_now")}
                >
                  <Play data-icon="inline-start" />
                  Run now
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => void pause()}
                >
                  <Pause data-icon="inline-start" />
                  Pause
                </Button>
              </>
            ) : block.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                disabled={isBusy}
                onClick={() => void refreshForReview("enable")}
              >
                {block.busy ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Play data-icon="inline-start" />}
                Start
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b pb-5">
            <SheetTitle>Edit scheduled work</SheetTitle>
            <SheetDescription>
              Review the instructions, cadence, timezone, and linked tables before saving.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor={`${block.id}-name`}>Name</Label>
              <Input id={`${block.id}-name`} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${block.id}-description`}>Description</Label>
              <Input id={`${block.id}-description`} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${block.id}-prompt`}>Run instructions</Label>
              <Textarea id={`${block.id}-prompt`} className="min-h-36" value={form.prompt} onChange={(event) => setForm((value) => ({ ...value, prompt: event.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${block.id}-cron`}>Cron schedule</Label>
                <Input id={`${block.id}-cron`} value={form.cron} onChange={(event) => setForm((value) => ({ ...value, cron: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${block.id}-timezone`}>Timezone</Label>
                <Input id={`${block.id}-timezone`} value={form.timezone} onChange={(event) => setForm((value) => ({ ...value, timezone: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${block.id}-label`}>Schedule label</Label>
              <Input id={`${block.id}-label`} value={form.scheduleLabel} onChange={(event) => setForm((value) => ({ ...value, scheduleLabel: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${block.id}-tables`}>Linked table slugs</Label>
              <Input id={`${block.id}-tables`} placeholder="qualified-leads, weekly-report" value={form.linkedTables} onChange={(event) => setForm((value) => ({ ...value, linkedTables: event.target.value }))} />
              <p className="text-xs text-muted-foreground">Separate multiple table slugs with commas.</p>
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
          <SheetFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="button" disabled={!canSubmitEdit || block.busy} onClick={() => void saveEdit()}>
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "enable"
                ? "Start this automation?"
                : confirmAction === "run_now"
                  ? "Run this automation now?"
                  : "Apply changes to the live automation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "enable"
                ? `${block.name} will begin on ${block.scheduleLabel} (${block.timezone}).`
                : confirmAction === "run_now"
                  ? "This starts one additional run now and may use credits. The normal schedule is unchanged."
                  : "The updated instructions or cadence will be used by future runs."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Estimated usage</p>
            <p className="text-muted-foreground">{costText(block.estimatedCostPerRun, block.cron)}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={block.busy} onClick={(event) => { event.preventDefault(); void confirm(); }}>
              {confirmAction === "enable"
                ? "Start automation"
                : confirmAction === "run_now"
                  ? "Run now"
                  : "Apply changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AutomationConfirmationCard({
  block,
  disabled,
  actions,
}: {
  block: ConfirmationBlock;
  disabled?: boolean;
  actions: AutomationCardActions;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionLabel =
    block.action === "run_now"
      ? "Run now"
      : block.action === "delete_active"
        ? "Delete automation"
        : block.action === "edit_live"
          ? "Apply live changes"
          : "Start automation";

  const confirm = async () => {
    setError(null);
    try {
      const fresh = await actions.onRefresh(block.slug);
      await actions.onConfirm({
        slug: block.slug,
        expectedVersion: fresh.version,
        action: block.action,
        ...(block.action === "edit_live" ? { patch: block.changes as AgentAutomationPatch } : {}),
      });
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The action could not be completed");
    }
  };

  return (
    <>
      <Card className="border-primary/25 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Confirm scheduled work</CardTitle>
              <CardDescription className="mt-1">{block.name}</CardDescription>
            </div>
            <Badge variant="outline">Approval required</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          {block.scheduleLabel ? <p>{block.scheduleLabel} · {block.timezone}</p> : null}
          <p>{costText(block.estimatedCostPerRun, "")}</p>
          {error || block.actionError ? <p className="text-destructive">{error || block.actionError}</p> : null}
        </CardContent>
        <CardFooter className="justify-end border-t py-3">
          <Button type="button" size="sm" disabled={disabled || block.busy} onClick={() => setOpen(true)}>
            Review and confirm
          </Button>
        </CardFooter>
      </Card>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              The current durable task will be reloaded and its version checked before this action is applied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={block.busy} onClick={(event) => { event.preventDefault(); void confirm(); }}>
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
