"use client";

import { useMemo, useState } from "react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@/components/ai-elements/plan";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  AutomationConfirmationCard,
  AutomationDraftCard,
  type AutomationCardActions,
} from "@/components/agent-chat/automation-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentConversationSummary, ChatBlock } from "@/lib/agent-chat/types";
import {
  Check,
  CircleHelp,
  History,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => cellText(item)).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    // Tool-result tables do not carry the workspace column schema. Render
    // object cells as readable key/value pairs instead of leaking JSON into
    // the chat UI; the canonical workspace table still uses main_field.
    return Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item != null && item !== "")
      .map(([key, item]) => `${key.replace(/[-_]+/g, " ")}: ${cellText(item)}`)
      .join(" · ");
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function ResultDataView({ value }: { value: unknown }) {
  if (value == null) return null;

  const rows = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        Array.isArray((value as { items?: unknown }).items)
      ? ((value as { items: unknown[] }).items)
      : value &&
          typeof value === "object" &&
          Array.isArray((value as { companies?: unknown }).companies)
        ? ((value as { companies: unknown[] }).companies)
        : value &&
            typeof value === "object" &&
            Array.isArray((value as { rows?: unknown }).rows)
          ? ((value as { rows: unknown[] }).rows)
          : null;

  if (
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.every((row) => row && typeof row === "object" && !Array.isArray(row))
  ) {
    const keys = Array.from(
      new Set(
        rows.flatMap((row) => Object.keys(row as Record<string, unknown>))
      )
    ).slice(0, 8);

    return (
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
          <thead className="bg-muted/60">
            <tr>
              {keys.map((key) => (
                <th key={key} className="px-2 py-1.5 font-medium text-foreground">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 25).map((row, index) => (
              <tr key={index} className="border-t border-border/70">
                {keys.map((key) => (
                  <td
                    key={key}
                    className="max-w-[14rem] truncate px-2 py-1.5 text-muted-foreground"
                    title={cellText((row as Record<string, unknown>)[key])}
                  >
                    {cellText((row as Record<string, unknown>)[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 25 ? (
          <p className="border-t border-border px-2 py-1 text-[11px] text-muted-foreground">
            Showing 25 of {rows.length} rows
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-2 text-xs">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

function QuestionsCard({
  block,
  disabled,
  onSubmit,
}: {
  block: Extract<ChatBlock, { kind: "questions" }>;
  disabled?: boolean;
  onSubmit: (answerText: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, boolean>>(
    {}
  );

  const canSubmit = block.questions.every((question) => {
    const value = (answers[question.id] || "").trim();
    return value.length > 0;
  });

  return (
    <Card
      aria-live="polite"
      className="flex max-h-[min(22rem,45vh)] flex-col overflow-hidden border-blue-200 bg-blue-50/95 shadow-xl shadow-blue-950/10 backdrop-blur dark:border-blue-900/70 dark:bg-blue-950/95"
    >
      <CardHeader className="shrink-0 border-b border-blue-100 px-3 py-2.5 dark:border-blue-900/60">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">
            <CircleHelp className="size-3.5" />
          </span>
          {block.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {block.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-medium leading-5 text-foreground">
              {question.prompt}
            </p>
            {question.options && question.options.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={
                      answers[question.id] === option &&
                      !customAnswers[question.id]
                        ? "default"
                        : "outline"
                    }
                    className={
                      answers[question.id] === option &&
                      !customAnswers[question.id]
                        ? "border-blue-600 bg-blue-600 hover:bg-blue-700"
                        : "bg-background hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    }
                    disabled={disabled}
                    onClick={() => {
                      const isCustomOption = /^(other|something else)/i.test(
                        option.trim()
                      );
                      setCustomAnswers((prev) => ({
                        ...prev,
                        [question.id]: isCustomOption,
                      }));
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: isCustomOption ? "" : option,
                      }));
                    }}
                  >
                    {option}
                  </Button>
                ))}
                {question.allow_free_text !== false &&
                !question.options.some((option) =>
                  /^(other|something else)/i.test(option.trim())
                ) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant={customAnswers[question.id] ? "default" : "outline"}
                    className={
                      customAnswers[question.id]
                        ? "border-blue-600 bg-blue-600 hover:bg-blue-700"
                        : "bg-background hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    }
                    disabled={disabled}
                    onClick={() => {
                      setCustomAnswers((prev) => ({
                        ...prev,
                        [question.id]: true,
                      }));
                      setAnswers((prev) => ({ ...prev, [question.id]: "" }));
                    }}
                  >
                    Other
                  </Button>
                ) : null}
              </div>
            ) : null}
            {(!question.options?.length || customAnswers[question.id]) && (
              <Input
                value={answers[question.id] || ""}
                disabled={disabled}
                placeholder="Type another answer…"
                className="bg-background"
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: event.target.value,
                  }))
                }
              />
            )}
          </div>
        ))}
      </CardContent>
      <div className="flex shrink-0 justify-end border-t border-blue-100 px-3 py-2 dark:border-blue-900/60">
        <Button
          type="button"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={disabled || !canSubmit}
          onClick={() => {
            const lines = block.questions.map((question) => {
              const answer = (answers[question.id] || "").trim();
              return `${question.prompt}\n→ ${answer}`;
            });
            onSubmit(lines.join("\n\n"));
          }}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}

type ActivityStep = Extract<ChatBlock, { kind: "activity" }>["steps"][number];

function groupedActivitySteps(steps: ActivityStep[]) {
  const groups = new Map<
    string,
    {
      tool: string;
      total: number;
      completed: number;
      detail?: string;
    }
  >();

  for (const step of steps) {
    const current = groups.get(step.tool) || {
      tool: step.tool,
      total: 0,
      completed: 0,
      detail: undefined,
    };
    current.total += 1;
    if (step.phase === "result") current.completed += 1;
    if (step.detail) current.detail = step.detail;
    groups.set(step.tool, current);
  }

  return [...groups.values()];
}

function activityLabel(tool: string, total: number, completed: number): string {
  const readable = tool
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  const count = total > 1 ? ` ×${total}` : "";
  if (completed < total) {
    return `${readable}${count} · ${completed}/${total} complete`;
  }
  return `${readable}${count}`;
}

function ChatBlockView({
  block,
  disabled,
  onSend,
  onCancelExecution,
  automationActions,
}: {
  block: ChatBlock;
  disabled?: boolean;
  onSend: (text: string) => void;
  onCancelExecution?: (executionId: string) => void;
  automationActions: AutomationCardActions;
}) {
  switch (block.kind) {
    case "user":
      return (
        <Message from="user">
          <MessageContent>{block.text}</MessageContent>
        </Message>
      );
    case "thought":
      return (
        <Reasoning isStreaming={!!block.streaming} defaultOpen={!!block.streaming}>
          <ReasoningTrigger />
          <ReasoningContent>{block.text}</ReasoningContent>
        </Reasoning>
      );
    case "text":
      return (
        <Message from="assistant">
          <MessageContent>
            <MessageResponse>{block.text}</MessageResponse>
          </MessageContent>
        </Message>
      );
    case "plan":
      return (
        <Plan defaultOpen>
          <PlanHeader>
            <div className="min-w-0 flex-1 space-y-1">
              <PlanTitle>{block.title}</PlanTitle>
              {block.summary ? (
                <PlanDescription>{block.summary}</PlanDescription>
              ) : null}
            </div>
            <PlanAction>
              <PlanTrigger />
            </PlanAction>
          </PlanHeader>
          <PlanContent>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              {block.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {block.parameters && Object.keys(block.parameters).length > 0 ? (
              <pre className="mt-3 overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
                {JSON.stringify(block.parameters, null, 2)}
              </pre>
            ) : null}
          </PlanContent>
        </Plan>
      );
    case "summary":
      return (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{block.summary}</p>
            {block.highlights.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4">
                {block.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      );
    case "questions":
      // The latest unanswered question is anchored above the composer instead
      // of appearing inside the scrolling transcript.
      return null;
    case "next_actions":
      return (
        <Suggestions>
          {block.actions.map((action) => (
            <Suggestion
              key={action}
              suggestion={action}
              disabled={disabled}
              onClick={onSend}
            />
          ))}
        </Suggestions>
      );
    case "automation_draft":
      return (
        <AutomationDraftCard
          block={block}
          disabled={disabled}
          actions={automationActions}
        />
      );
    case "automation_confirmation":
      return (
        <AutomationConfirmationCard
          block={block}
          disabled={disabled}
          actions={automationActions}
        />
      );
    case "tool":
      return (
        <ChainOfThought defaultOpen={block.phase === "start"}>
          <ChainOfThoughtHeader>
            {block.phase === "start" ? "Working..." : "Activity"}
          </ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            <ChainOfThoughtStep
              label={
                block.phase === "start"
                  ? `Calling ${block.tool}`
                  : `Finished ${block.tool}`
              }
              description={block.detail}
              status={block.phase === "start" ? "active" : "complete"}
            />
          </ChainOfThoughtContent>
        </ChainOfThought>
      );
    case "activity": {
      const active = block.steps.some((step) => step.phase === "start");
      const groupedSteps = groupedActivitySteps(block.steps);
      return (
        <ChainOfThought defaultOpen={active}>
          <ChainOfThoughtHeader>
            {active ? "Working..." : "Activity"}
          </ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            {groupedSteps.map((step) => (
              <ChainOfThoughtStep
                key={step.tool}
                label={activityLabel(
                  step.tool,
                  step.total,
                  step.completed
                )}
                description={step.detail}
                status={step.completed < step.total ? "active" : "complete"}
              />
            ))}
          </ChainOfThoughtContent>
        </ChainOfThought>
      );
    }
    case "status":
      return <p className="text-xs text-muted-foreground">{block.text}</p>;
    case "execution":
      return (
        <Card className="border-dashed shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Code execution</span>
              <span className="text-xs font-normal text-muted-foreground">
                {block.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{block.message}</p>
            {block.errorCode || block.errorMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                <p className="font-medium">
                  {block.errorCode || "error"}
                  {block.errorMessage ? `: ${block.errorMessage}` : ""}
                </p>
                {block.issues && block.issues.length > 0 ? (
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[11px] text-destructive/90">
                    {JSON.stringify(block.issues, null, 2)}
                  </pre>
                ) : null}
              </div>
            ) : null}
            {block.code ? (
              <details className="rounded-md border border-border/70 bg-muted/30 p-2" open={block.status === "failed" || block.status === "validating"}>
                <summary className="cursor-pointer text-xs font-medium text-foreground">
                  Executed TypeScript
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/90">
                  {block.code}
                </pre>
              </details>
            ) : null}
            {block.serviceCalls.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-xs">
                {block.serviceCalls.map((call) => (
                  <li key={call}>{call}</li>
                ))}
              </ul>
            ) : null}
            {block.logs.length > 0 ? (
              <pre className="max-h-32 overflow-auto rounded-md bg-muted/50 p-2 text-xs">
                {block.logs.join("\n")}
              </pre>
            ) : null}
            {block.returnValue !== undefined ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Result data</p>
                <ResultDataView value={block.returnValue} />
              </div>
            ) : null}
            {block.status === "queued" ||
            block.status === "validating" ||
            block.status === "running" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onCancelExecution?.(block.executionId)}
              >
                Cancel run
              </Button>
            ) : null}
          </CardContent>
        </Card>
      );
    case "error":
      return (
        <Card className="border-destructive/40 shadow-none">
          <CardContent className="py-3 text-sm text-destructive">
            {block.text}
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
}

export function AgentChatPanel({
  blocks,
  isStreaming,
  error,
  activeExecutionId,
  isCancellingExecution,
  conversationId,
  conversationTitle,
  recentConversations,
  isLoadingConversations,
  onSend,
  onStop,
  onCancelExecution,
  automationActions,
  onOpenConversation,
  onRefreshConversations,
  onReset,
}: {
  blocks: ChatBlock[];
  isStreaming: boolean;
  error: string | null;
  activeExecutionId?: string | null;
  isCancellingExecution?: boolean;
  conversationId?: string | null;
  conversationTitle: string;
  recentConversations: AgentConversationSummary[];
  isLoadingConversations?: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
  onCancelExecution?: (executionId?: string) => void;
  automationActions: AutomationCardActions;
  onOpenConversation: (conversationId: string) => void;
  onRefreshConversations: () => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState("");
  const pendingQuestions = useMemo(() => {
    for (let index = blocks.length - 1; index >= 0; index -= 1) {
      const block = blocks[index];
      if (block.kind === "user") return null;
      if (block.kind === "questions") return block;
    }
    return null;
  }, [blocks]);
  const canSend = useMemo(
    () => draft.trim().length > 0 && !isStreaming && !pendingQuestions,
    [draft, isStreaming, pendingQuestions]
  );

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-[#1F1F23] dark:bg-black">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3 dark:border-[#1F1F23] dark:bg-black">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{conversationTitle}</p>
            <p className="text-xs text-muted-foreground">
              {conversationId ? "Conversation workspace" : "Start a new research chat"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) onRefreshConversations();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" disabled={isStreaming}>
                {isLoadingConversations ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <History className="mr-1.5 size-3.5" />
                )}
                Recent
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Recent chats
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentConversations.length > 0 ? (
                recentConversations.map((conversation) => (
                  <DropdownMenuItem
                    key={conversation.conversation_id}
                    className="items-start py-2"
                    onSelect={() => onOpenConversation(conversation.conversation_id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{conversation.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(conversation.last_message_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {conversation.conversation_id === conversationId ? (
                      <Check className="mt-0.5 size-4 text-blue-600" />
                    ) : null}
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No previous chats yet
                </p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={isStreaming}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            New chat
          </Button>
        </div>
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-4">
          {blocks.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="size-6" />}
              title="Start a lead-gen turn"
              description='Try “Find 15 US marketing automation companies with 20–200 employees.”'
            />
          ) : (
            blocks.map((block) => (
              <ChatBlockView
                key={block.id}
                block={block}
                disabled={isStreaming || !!isCancellingExecution}
                onSend={onSend}
                onCancelExecution={(executionId) =>
                  onCancelExecution?.(executionId)
                }
                automationActions={automationActions}
              />
            ))
          )}
          {isStreaming ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Agent is working…
              {activeExecutionId && onCancelExecution ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  disabled={isCancellingExecution}
                  onClick={() => onCancelExecution?.()}
                >
                  {isCancellingExecution ? "Cancelling…" : "Cancel code"}
                </Button>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="relative border-t border-gray-200 bg-white px-4 py-3 dark:border-[#1F1F23] dark:bg-black">
        {pendingQuestions ? (
          <div className="absolute bottom-full left-4 right-4 z-30 mx-auto mb-2 w-auto max-w-3xl">
            <QuestionsCard
              key={pendingQuestions.id}
              block={pendingQuestions}
              disabled={isStreaming || !!isCancellingExecution}
              onSubmit={onSend}
            />
          </div>
        ) : null}
        <form
          className="mx-auto flex w-full max-w-3xl gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSend) return;
            const value = draft;
            setDraft("");
            onSend(value);
          }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              pendingQuestions
                ? "Answer the questions above to continue"
                : "Ask the agent to find leads, build a table, or continue…"
            }
            className="min-h-[52px] max-h-40 resize-y"
            disabled={isStreaming || !!pendingQuestions}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!canSend) return;
                const value = draft;
                setDraft("");
                onSend(value);
              }
            }}
          />
          {isStreaming ? (
            <Button type="button" variant="secondary" onClick={onStop}>
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!canSend}>
              Send
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
