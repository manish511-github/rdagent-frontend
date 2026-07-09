"use client";

import { Badge } from "@/components/ui/badge";
import type { AgentRunResponse } from "@/lib/mention-tracking/types";
import { summarizeRun } from "@/lib/mention-tracking/signal-utils";

type MentionTrackingResultSummaryProps = {
  data: AgentRunResponse;
};

export function MentionTrackingResultSummary({ data }: MentionTrackingResultSummaryProps) {
  const { count, skill, platform } = summarizeRun(data);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Badge variant="secondary">{skill}</Badge>
      <Badge variant="outline">
        {count} mention{count === 1 ? "" : "s"}
      </Badge>
      {platform && (
        <Badge variant="outline">Top: {platform}</Badge>
      )}
      <span className="text-xs text-muted-foreground">View in Mentions panel →</span>
    </div>
  );
}
