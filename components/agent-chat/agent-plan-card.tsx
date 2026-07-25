"use client";

import { Eye, FileSpreadsheet, Loader2, Play, X } from "lucide-react";

import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@/components/ai-elements/plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPlatformLabel } from "@/lib/agent-chat/signal-utils";
import type { ResearchPlan } from "@/lib/agent-chat/types";

type AgentPlanCardProps = {
  plan: ResearchPlan;
  disabled: boolean;
  onExecute: (message: string, plan: ResearchPlan) => void;
  onReject?: (message: string, plan: ResearchPlan) => void;
  onView?: (plan: ResearchPlan) => void;
};

export function AgentPlanCard({
  plan,
  disabled,
  onExecute,
  onReject,
  onView,
}: AgentPlanCardProps) {
  const canDecide = plan.status === "draft";
  const description = plan.objective || plan.overview || plan.intent;

  return (
    <Plan className="mt-4" defaultOpen={canDecide}>
      <div className="border-b px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Created this turn
      </div>
      <PlanHeader>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileSpreadsheet className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <PlanTitle>{plan.title}</PlanTitle>
          <PlanDescription>{description}</PlanDescription>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {plan.sources.length} source{plan.sources.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {plan.output.columns.length} columns
            </Badge>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] capitalize">
              {plan.status}
            </Badge>
          </div>
        </div>
        <PlanAction>
          {onView && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onView(plan)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View plan</span>
            </Button>
          )}
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Sources and queries
            </p>
            {plan.sources.map((source, index) => (
              <div
                key={`${source.source}-${source.query}-${index}`}
                className="rounded-md border bg-muted/20 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {formatPlatformLabel(source.source)}
                  </Badge>
                  <span className="min-w-0 break-words font-medium">
                    {source.query}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last {source.recency_days} days · limit {source.limit}
                </p>
                {source.rationale && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {source.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
          {plan.steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Execution plan
              </p>
              <ol className="space-y-2 text-sm">
                {plan.steps.slice(0, 4).map((step, index) => (
                  <li key={step.id} className="flex gap-2 rounded-md bg-muted/30 p-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[11px] text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{step.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </PlanContent>
      {plan.warnings.length > 0 && (
        <p className="border-t bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {plan.warnings[0]}
        </p>
      )}
      <PlanFooter>
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
      </PlanFooter>
    </Plan>
  );
}
