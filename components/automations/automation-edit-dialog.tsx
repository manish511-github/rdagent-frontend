"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgentAutomationPatch,
  AgentAutomationTask,
} from "@/lib/agent-chat/types";

interface AutomationEditDialogProps {
  task: AgentAutomationTask;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: AgentAutomationPatch) => Promise<void>;
}

function cronLabel(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return expression;
  const [minute, hour] = parts;
  if (parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
    return `Every day at ${hour}:${minute.padStart(2, "0")}`;
  }
  return expression;
}

/**
 * Full editing stays out of the quick-view drawer and appears only on demand.
 * This preserves the existing automation capabilities without turning every
 * row inspection into a configuration screen.
 */
export function AutomationEditDialog({
  task,
  open,
  pending,
  onOpenChange,
  onSave,
}: AutomationEditDialogProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [prompt, setPrompt] = useState(task.prompt);
  const [cron, setCron] = useState(
    task.schedule_json.cron_local || task.cron_utc,
  );
  const [timezone, setTimezone] = useState(task.timezone);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(task.name);
    setDescription(task.description);
    setPrompt(task.prompt);
    setCron(task.schedule_json.cron_local || task.cron_utc);
    setTimezone(task.timezone);
    setSaveError(null);
  }, [open, task]);

  const valid = Boolean(
    name.trim() && prompt.trim() && cron.trim() && timezone.trim(),
  );

  const submit = async () => {
    setSaveError(null);
    try {
      await onSave({
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
      });
      onOpenChange(false);
    } catch (caught) {
      setSaveError(
        caught instanceof Error ? caught.message : "Changes could not be saved",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit automation</DialogTitle>
          <DialogDescription>
            Changes apply to future runs. Existing run history is unchanged.
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
            <FieldLabel htmlFor="automation-description">
              Description
            </FieldLabel>
            <Textarea
              id="automation-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="automation-prompt">
              Run instructions
            </FieldLabel>
            <Textarea
              id="automation-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
            />
            <FieldDescription>
              These instructions are saved into every future run.
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

          {saveError ? (
            <p className="text-sm text-destructive">{saveError}</p>
          ) : null}
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid || pending} onClick={() => void submit()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
