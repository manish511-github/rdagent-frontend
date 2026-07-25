"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import {
  Clock3,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getApiUrl } from "@/lib/config";
import type { AgentConversationSummary } from "@/lib/agent-chat/types";
import { cn } from "@/lib/utils";

type AgentConversationMenuProps = {
  activeConversationId: string | null;
  disabled?: boolean;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
};

/**
 * Compact Agent Chat history control.
 *
 * The global Zooptics sidebar remains dedicated to product navigation. This
 * popover loads only lightweight conversation summaries when the user opens
 * it, then asks the parent chat runtime to restore the selected conversation.
 *
 * Example:
 *   1. The current chat is "Voice agents on Hacker News".
 *   2. The user opens Recent and selects "Reddit CRM complaints".
 *   3. `onSelectConversation()` supplies that conversation id to useAgentChat.
 *   4. The hook fetches the full transcript and rebuilds its plan/result cards.
 */
export function AgentConversationMenu({
  activeConversationId,
  disabled = false,
  onNewChat,
  onSelectConversation,
}: AgentConversationMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<
    AgentConversationSummary[]
  >([]);

  const loadConversations = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        getApiUrl("agent-runtime/conversations?limit=20"),
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!response.ok) {
        throw new Error("Could not load recent chats.");
      }
      setConversations(
        (await response.json()) as AgentConversationSummary[]
      );
    } catch (error) {
      toast.error("Recent chats unavailable", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh on every open so a conversation created moments ago appears
  // without maintaining a second browser-side source of truth.
  useEffect(() => {
    if (open) void loadConversations();
  }, [loadConversations, open]);

  const startNewChat = () => {
    setOpen(false);
    onNewChat();
  };

  const selectConversation = (conversationId: string) => {
    if (conversationId === activeConversationId) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onSelectConversation(conversationId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          title="Open recent chats"
          aria-label="Open recent chats"
        >
          <Clock3 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] p-2"
      >
        <div className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Chat sessions
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
          onClick={startNewChat}
        >
          <span className="flex size-7 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </span>
          New chat
        </button>

        <div className="my-1 border-t" />

        {isLoading ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading chats…
          </div>
        ) : conversations.length ? (
          <ScrollArea className="max-h-72">
            <div className="space-y-0.5 pr-2">
              {conversations.map((conversation) => {
                const isCurrent =
                  conversation.conversation_id === activeConversationId;
                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
                      isCurrent && "bg-muted"
                    )}
                    onClick={() =>
                      selectConversation(conversation.conversation_id)
                    }
                  >
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {conversation.title || "Untitled chat"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(conversation.last_message_at),
                          { addSuffix: true }
                        )}
                      </span>
                    </span>
                    {isCurrent && (
                      <span className="mt-0.5 shrink-0 text-[11px] font-medium text-muted-foreground">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-28 flex-col items-center justify-center px-4 text-center text-sm text-muted-foreground">
            <MessageSquarePlus className="mb-2 size-5" />
            Your recent chats will appear here.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
