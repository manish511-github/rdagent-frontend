"use client";

import { MessageSquare, Radio } from "lucide-react";

import { cn } from "@/lib/utils";

type MentionTrackingBottomToolbarProps = {
  activePanel: "chat" | "workspace";
  onPanelChange: (panel: "chat" | "workspace") => void;
  hasWorkspace: boolean;
  resultCount?: number;
};

export function MentionTrackingBottomToolbar({
  activePanel,
  onPanelChange,
  hasWorkspace,
  resultCount = 0,
}: MentionTrackingBottomToolbarProps) {
  return (
    <div className="border-t bg-background px-2 py-3 lg:hidden">
      <div className="mx-auto flex max-w-xs items-center justify-center">
        <div className="flex w-full rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => onPanelChange("chat")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-all",
              activePanel === "chat"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="size-3" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => onPanelChange("workspace")}
            disabled={!hasWorkspace}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-all",
              activePanel === "workspace"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              !hasWorkspace && "cursor-not-allowed opacity-50"
            )}
          >
            <Radio className="size-3" />
            Mentions
            {resultCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {resultCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
