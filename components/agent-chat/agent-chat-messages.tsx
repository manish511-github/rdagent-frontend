"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import type { AgentRunResponse, ChatMessage } from "@/lib/agent-chat/types";
import { activityTraceToWorkspaceEvents } from "@/lib/agent-chat/stream-utils";

import { AgentKeywordConfirmation } from "./agent-keyword-confirmation";
import { AgentResultCard } from "./agent-result-card";
import { AgentStreamActivity } from "./agent-stream-activity";
import { AgentPlanCard } from "./agent-plan-card";

type AgentChatMessagesProps = {
  messages: ChatMessage[];
  isSearching: boolean;
  streamStatus: string | null;
  workspaceEvents: import("@/lib/agent-chat/types").AgentWorkspaceEvent[];
  liveReasoning?: string;
  onConfirmKeywordPlan: (message: string, keywords: string[]) => void;
  onConfirmResearchPlan?: (message: string, plan: import("@/lib/agent-chat/types").ResearchPlan) => void;
  onRejectResearchPlan?: (message: string, plan: import("@/lib/agent-chat/types").ResearchPlan) => void;
  onViewResearchPlan?: (plan: import("@/lib/agent-chat/types").ResearchPlan) => void;
  onViewResults?: (data: AgentRunResponse, title?: string) => void;
};

export function AgentChatMessages({
  messages,
  isSearching,
  streamStatus,
  workspaceEvents,
  liveReasoning,
  onConfirmKeywordPlan,
  onConfirmResearchPlan,
  onRejectResearchPlan,
  onViewResearchPlan,
  onViewResults,
}: AgentChatMessagesProps) {
  return (
    <Conversation className="h-full overflow-x-hidden">
      <ConversationContent className="mx-auto min-w-0 max-w-2xl gap-6 overflow-x-hidden">
        {messages.map((message) => {
          const assistantContent =
            message.role === "assistant" && message.data
              ? buildChatResultSummary(message.data)
              : message.content;
          const restoredActivity =
            message.role === "assistant"
              ? activityTraceToWorkspaceEvents(
                  message.data?.activity_trace || message.activityTrace
                )
              : [];

          return (
            <Message key={message.id} from={message.role}>
              <MessageContent className="min-w-0 max-w-full">
                {message.role === "user" ? (
                  <p className="break-words leading-relaxed">{message.content}</p>
                ) : (
                  <>
                    <Response className="min-w-0 max-w-full break-words [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_table]:w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words">
                      {assistantContent}
                    </Response>
                  {restoredActivity.length > 0 && (
                    <div className="mt-3">
                      <AgentStreamActivity
                        events={restoredActivity}
                        isSearching={false}
                        streamStatus={null}
                      />
                    </div>
                  )}
                  {message.keywordPlan && (
                    <AgentKeywordConfirmation
                      plan={message.keywordPlan}
                      disabled={isSearching}
                      onConfirm={onConfirmKeywordPlan}
                    />
                  )}
                  {message.researchPlan && onConfirmResearchPlan && (
                    <AgentPlanCard
                      plan={message.researchPlan}
                      disabled={isSearching}
                      onExecute={onConfirmResearchPlan}
                      onReject={onRejectResearchPlan}
                      onView={onViewResearchPlan}
                    />
                  )}
                  {message.data && (message.data.artifact_rows?.length || message.data.signals.length) > 0 && (
                    <AgentResultCard
                      data={message.data}
                      title={message.resultTitle}
                      onViewResults={() => onViewResults?.(message.data as AgentRunResponse, message.resultTitle)}
                    />
                  )}
                  </>
                )}
              </MessageContent>
            </Message>
          );
        })}

        {isSearching && (
          <>
            <Message from="assistant">
              <MessageContent>
                <AgentStreamActivity
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

function buildChatResultSummary(data: AgentRunResponse) {
  return data.chat_summary || "";
}
