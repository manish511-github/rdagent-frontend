"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import type { ChatMessage } from "@/lib/mention-tracking/types";

import { MentionTrackingKeywordConfirmation } from "./mention-tracking-keyword-confirmation";
import { MentionTrackingResultSummary } from "./mention-tracking-result-summary";
import { MentionTrackingStreamActivity } from "./mention-tracking-stream-activity";
import { ResearchPlanCard } from "./research-plan-card";

type MentionTrackingChatMessagesProps = {
  messages: ChatMessage[];
  isSearching: boolean;
  streamStatus: string | null;
  workspaceEvents: import("@/lib/mention-tracking/types").MentionWorkspaceEvent[];
  liveReasoning?: string;
  onConfirmKeywordPlan: (message: string, keywords: string[]) => void;
  onConfirmResearchPlan?: (message: string, plan: import("@/lib/mention-tracking/types").ResearchPlan) => void;
  onViewResearchPlan?: (plan: import("@/lib/mention-tracking/types").ResearchPlan) => void;
};

export function MentionTrackingChatMessages({
  messages,
  isSearching,
  streamStatus,
  workspaceEvents,
  liveReasoning,
  onConfirmKeywordPlan,
  onConfirmResearchPlan,
  onViewResearchPlan,
}: MentionTrackingChatMessagesProps) {
  return (
    <Conversation className="h-full overflow-x-hidden">
      <ConversationContent className="mx-auto min-w-0 max-w-2xl gap-6 overflow-x-hidden">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent className="min-w-0 max-w-full">
              {message.role === "user" ? (
                <p className="break-words leading-relaxed">{message.content}</p>
              ) : (
                <>
                  <Response className="min-w-0 max-w-full break-words [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_table]:w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words">
                    {message.content}
                  </Response>
                  {message.keywordPlan && (
                    <MentionTrackingKeywordConfirmation
                      plan={message.keywordPlan}
                      disabled={isSearching}
                      onConfirm={onConfirmKeywordPlan}
                    />
                  )}
                  {message.researchPlan && onConfirmResearchPlan && (
                    <ResearchPlanCard
                      plan={message.researchPlan}
                      disabled={isSearching}
                      onExecute={onConfirmResearchPlan}
                      onView={onViewResearchPlan}
                    />
                  )}
                  {message.data && message.data.signals.length > 0 && (
                    <MentionTrackingResultSummary data={message.data} />
                  )}
                </>
              )}
            </MessageContent>
          </Message>
        ))}

        {isSearching && (
          <>
            <Message from="assistant">
              <MessageContent>
                <MentionTrackingStreamActivity
                  events={workspaceEvents}
                  isSearching={isSearching}
                  streamStatus={streamStatus}
                />
              </MessageContent>
            </Message>
            <div className="flex justify-center py-2">
              <Loader size={16} className="text-muted-foreground" />
            </div>
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
