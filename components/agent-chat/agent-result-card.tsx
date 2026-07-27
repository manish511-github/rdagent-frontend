"use client";

import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/kokonutui/platform-icons";
import type { AgentRunResponse } from "@/lib/agent-chat/types";
import { platformIconKey, summarizeRun } from "@/lib/agent-chat/signal-utils";

type AgentResultCardProps = {
  data: AgentRunResponse;
  onViewResults?: () => void;
  title?: string;
};

export function AgentResultCard({
  data,
  onViewResults,
  title,
}: AgentResultCardProps) {
  const { count, skill, platform } = summarizeRun(data);
  const Wrapper = onViewResults ? "button" : "div";
  const toolCalls = data.tool_calls?.length || 0;

  return (
    <Wrapper
      type={onViewResults ? "button" : undefined}
      onClick={onViewResults}
      className="mt-4 block w-full overflow-hidden rounded-xl border bg-background text-left shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          <PlatformIcon
            platform={platformIconKey(platform || data.skill_used)}
            className="size-5"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {title || "Research results"}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Results
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] normal-case">
              {count} result{count === 1 ? "" : "s"}
            </Badge>
            {toolCalls > 0 && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] normal-case">
                {toolCalls} quer{toolCalls === 1 ? "y" : "ies"}
              </Badge>
            )}
            {platform && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] normal-case">
                Top: {platform}
              </Badge>
            )}
          </span>
        </span>
        {onViewResults && <ChevronRight className="size-4 text-muted-foreground" />}
      </div>
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        {skill}
      </div>
    </Wrapper>
  );
}
