"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import type { ChatMessage } from "@/lib/mention-tracking/types";

import { MentionTrackingKeywordConfirmation } from "./mention-tracking-keyword-confirmation";
import { MentionTrackingResultSummary } from "./mention-tracking-result-summary";
import { MentionTrackingStreamActivity } from "./mention-tracking-stream-activity";

type MentionTrackingChatMessagesProps = {
  messages: ChatMessage[];
  isSearching: boolean;
  streamStatus: string | null;
  workspaceEvents: import("@/lib/mention-tracking/types").MentionWorkspaceEvent[];
  liveReasoning?: string;
  onConfirmKeywordPlan: (message: string, keywords: string[]) => void;
};

export function MentionTrackingChatMessages({
  messages,
  isSearching,
  streamStatus,
  workspaceEvents,
  liveReasoning,
  onConfirmKeywordPlan,
}: MentionTrackingChatMessagesProps) {
  return (
    <Conversation className="h-full">
      <ConversationContent className="mx-auto max-w-2xl gap-6">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.role === "user" ? (
                <p className="leading-relaxed">{message.content}</p>
              ) : (
                <>
                  {message.reasoning && (
                    <Reasoning defaultOpen={false}>
                      <ReasoningTrigger />
                      <ReasoningContent>{message.reasoning}</ReasoningContent>
                    </Reasoning>
                  )}
                  <Response>{message.content}</Response>
                  {message.keywordPlan && (
                    <MentionTrackingKeywordConfirmation
                      plan={message.keywordPlan}
                      disabled={isSearching}
                      onConfirm={onConfirmKeywordPlan}
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
            {liveReasoning && (
              <Reasoning isStreaming>
                <ReasoningTrigger />
                <ReasoningContent>{liveReasoning}</ReasoningContent>
              </Reasoning>
            )}
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
