"use client";

import { ChevronRight, FileSpreadsheet, Loader2, Play, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResearchPlan } from "@/lib/mention-tracking/types";

type ResearchPlanCardProps = {
  plan: ResearchPlan;
  disabled: boolean;
  onExecute: (message: string, plan: ResearchPlan) => void;
  onReject?: (message: string, plan: ResearchPlan) => void;
  onView?: (plan: ResearchPlan) => void;
};

export function ResearchPlanCard({
  plan,
  disabled,
  onExecute,
  onReject,
  onView,
}: ResearchPlanCardProps) {
  const canDecide = plan.status === "draft";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="border-b px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Created this turn
      </div>
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
        onClick={() => onView?.(plan)}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileSpreadsheet className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{plan.title}</span>
          <span className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Plan
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] normal-case">
              {plan.output.columns.length} columns
            </Badge>
          </span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
      {plan.warnings.length > 0 && (
        <p className="border-t bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {plan.warnings[0]}
        </p>
      )}
      <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
        {!canDecide && (
          <Badge variant="outline" className="mr-auto capitalize">
            {plan.status}
          </Badge>
        )}
        {canDecide && onReject && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onReject(plan.message, plan)}
            disabled={disabled}
          >
            <X className="mr-2 size-3.5" />
            Reject
          </Button>
        )}
        {canDecide && (
          <Button
            type="button"
            size="sm"
            onClick={() => onExecute(plan.message, plan)}
            disabled={disabled}
          >
            {disabled ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Play className="mr-2 size-3.5" />
            )}
            Execute plan
          </Button>
        )}
      </div>
    </div>
  );
}
