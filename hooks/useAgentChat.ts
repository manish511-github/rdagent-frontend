"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelAgentExecution,
  getAgentConversation,
  streamAgentTurn,
} from "@/lib/agent-chat/api";
import type {
  AgentTurnEvent,
  AgentUIContextPayload,
  ChatBlock,
} from "@/lib/agent-chat/types";

const STORAGE_KEY = "zooptics.agentChat.conversationId";

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function formatExecutionLog(data: Record<string, unknown>): string {
  const log = data.log;
  if (log && typeof log === "object") {
    const record = log as Record<string, unknown>;
    const args = record.args;
    if (Array.isArray(args) && args.length > 0) {
      return args
        .map((arg) =>
          typeof arg === "string" ? arg : JSON.stringify(arg, null, 2)
        )
        .join(" ");
    }
    if (typeof record.message === "string" && record.message) {
      return record.message;
    }
  }
  if (Array.isArray(data.args) && data.args.length > 0) {
    return data.args
      .map((arg) =>
        typeof arg === "string" ? arg : JSON.stringify(arg, null, 2)
      )
      .join(" ");
  }
  return "";
}

function blocksFromRestoredMessages(
  messages: Array<{
    role: string;
    content: string;
    event_type?: string | null;
    payload?: Record<string, unknown> | null;
  }>
): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  for (const message of messages) {
    if (message.role === "user") {
      blocks.push({
        id: newId("user"),
        kind: "user",
        text: message.content || "",
      });
      continue;
    }
    if (message.event_type === "answer.completed" || message.role === "assistant") {
      const text =
        asString(message.payload?.text) || message.content || "";
      if (text) {
        blocks.push({ id: newId("text"), kind: "text", text });
      }
    }
  }
  return blocks;
}

function applyTurnEvent(
  blocks: ChatBlock[],
  event: AgentTurnEvent
): ChatBlock[] {
  const data = event.data || {};
  const next = [...blocks];

  const appendOrExtend = (
    kind: "thought" | "text",
    delta: string
  ): ChatBlock[] => {
    if (!delta) return next;
    const last = next[next.length - 1];
    if (last && last.kind === kind && last.streaming) {
      const updated = {
        ...last,
        text: `${last.text}${delta}`,
      } as ChatBlock;
      return [...next.slice(0, -1), updated];
    }
    return [
      ...next,
      { id: newId(kind), kind, text: delta, streaming: true } as ChatBlock,
    ];
  };

  const finalizeStreaming = (): ChatBlock[] =>
    next.map((block) =>
      block.kind === "thought" || block.kind === "text"
        ? { ...block, streaming: false }
        : block
    );

  switch (event.type) {
    case "thought":
      return appendOrExtend(
        "thought",
        asString(data.text) || event.message || ""
      );
    case "text":
      return appendOrExtend("text", asString(data.text) || event.message || "");
    case "plan": {
      const finalized = finalizeStreaming();
      return [
        ...finalized,
        {
          id: newId("plan"),
          kind: "plan",
          title: asString(data.title, "Plan"),
          summary: asString(data.summary),
          steps: asStringArray(data.steps),
          parameters:
            data.parameters && typeof data.parameters === "object"
              ? (data.parameters as Record<string, unknown>)
              : undefined,
        },
      ];
    }
    case "summary": {
      const finalized = finalizeStreaming();
      return [
        ...finalized,
        {
          id: newId("summary"),
          kind: "summary",
          title: asString(data.title, "Summary"),
          summary: asString(data.summary),
          highlights: asStringArray(data.highlights),
          metrics:
            data.metrics && typeof data.metrics === "object"
              ? (data.metrics as Record<string, unknown>)
              : undefined,
        },
      ];
    }
    case "ask_questions": {
      const finalized = finalizeStreaming();
      const questions = Array.isArray(data.questions)
        ? data.questions
            .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
            .map((item) => ({
              id: asString(item.id, newId("q")),
              prompt: asString(item.prompt, "Question"),
              allow_free_text:
                typeof item.allow_free_text === "boolean"
                  ? item.allow_free_text
                  : true,
              options: asStringArray(item.options),
            }))
        : [];
      return [
        ...finalized,
        {
          id: newId("questions"),
          kind: "questions",
          title: asString(data.title, "Quick questions"),
          questions,
        },
      ];
    }
    case "next_actions": {
      const finalized = finalizeStreaming();
      return [
        ...finalized,
        {
          id: newId("actions"),
          kind: "next_actions",
          actions: asStringArray(data.actions),
        },
      ];
    }
    case "tool_start": {
      const finalized = finalizeStreaming();
      const step = {
        id: newId("tool-step"),
        tool: asString(data.tool, "tool"),
        phase: "start" as const,
      };
      const last = finalized[finalized.length - 1];
      if (last?.kind === "activity") {
        return [
          ...finalized.slice(0, -1),
          { ...last, steps: [...last.steps, step] },
        ];
      }
      return [
        ...finalized,
        { id: newId("activity"), kind: "activity", steps: [step] },
      ];
    }
    case "tool_result":
      {
        // Complete the matching in-progress tool step instead of adding a
        // second "Finished ..." row. This gives ChainOfThought one stable
        // step whose status changes from active to complete.
        let pendingIndex = -1;
        const toolName = asString(data.tool, "tool");
        for (let index = next.length - 1; index >= 0; index -= 1) {
          const candidate = next[index];
          if (candidate.kind === "activity") {
            const stepIndex = candidate.steps.findLastIndex(
              (step) => step.tool === toolName && step.phase === "start"
            );
            if (stepIndex >= 0) {
              const steps = [...candidate.steps];
              steps[stepIndex] = {
                ...steps[stepIndex],
                phase: "result",
                detail: asString(
                  (data.result as { message?: string } | undefined)?.message
                ),
              };
              return [
                ...next.slice(0, index),
                { ...candidate, steps },
                ...next.slice(index + 1),
              ];
            }
          } else if (
            candidate.kind === "tool" &&
            candidate.tool === toolName &&
            candidate.phase === "start"
          ) {
            pendingIndex = index;
            break;
          }
        }
        if (pendingIndex >= 0) {
          const pending = next[pendingIndex] as Extract<
            ChatBlock,
            { kind: "tool" }
          >;
          return [
            ...next.slice(0, pendingIndex),
            {
              ...pending,
              phase: "result",
              detail: asString(
                (data.result as { message?: string } | undefined)?.message
              ),
            },
            ...next.slice(pendingIndex + 1),
          ];
        }
      }
      return [
        ...next,
        {
          id: newId("activity"),
          kind: "activity",
          steps: [
            {
              id: newId("tool-step"),
              tool: asString(data.tool, "tool"),
              phase: "result",
              detail: asString(
                (data.result as { message?: string } | undefined)?.message
              ),
            },
          ],
        },
      ];
    case "context.compressed":
    case "compaction.scheduled":
      return [
        ...next,
        {
          id: newId("status"),
          kind: "status",
          text: event.message || event.type,
        },
      ];
    case "turn.started":
      return next;
    case "error":
      return [
        ...finalizeStreaming(),
        {
          id: newId("error"),
          kind: "error",
          text:
            asString((data.error as { message?: string } | undefined)?.message) ||
            event.message ||
            "The agent turn failed.",
        },
      ];
    case "done":
      return finalizeStreaming();
    default:
      if (event.type.startsWith("execution.")) {
        const executionId = asString(data.execution_id);
        if (!executionId) {
          return [
            ...next,
            {
              id: newId("status"),
              kind: "status",
              text: event.message || event.type.replace("execution.", "Execution "),
            },
          ];
        }
        const phase = event.type.replace("execution.", "");
        const statusMap: Record<
          string,
          Extract<ChatBlock, { kind: "execution" }>["status"]
        > = {
          queued: "queued",
          validating: "validating",
          started: "running",
          log: "running",
          service_called: "running",
          service_completed: "running",
          workspace_updated: "running",
          completed: "completed",
          failed: "failed",
          cancelled: "cancelled",
          partial: "partial",
        };
        const status = statusMap[phase] || "running";
        const existingIndex = next.findIndex(
          (block) =>
            block.kind === "execution" && block.executionId === executionId
        );
        const logLine =
          phase === "log"
            ? formatExecutionLog(data) ||
              asString(data.message) ||
              asString((data.log as { message?: string } | undefined)?.message)
            : "";
        const serviceLine =
          phase === "service_called" || phase === "service_completed"
            ? asString(data.method) || asString(data.service) || event.message || phase
            : "";
        const returnValue =
          phase === "completed" && "return_value" in data
            ? data.return_value
            : undefined;
        const code =
          typeof data.code === "string" && data.code ? data.code : undefined;
        const errorObj =
          data.error && typeof data.error === "object"
            ? (data.error as { code?: unknown; message?: unknown })
            : null;
        const errorCode =
          typeof errorObj?.code === "string" ? errorObj.code : undefined;
        const errorMessage =
          typeof errorObj?.message === "string"
            ? errorObj.message
            : phase === "failed"
              ? event.message || "Code execution failed"
              : undefined;
        const issues = Array.isArray(data.issues) ? data.issues : undefined;

        if (existingIndex >= 0) {
          const existing = next[existingIndex] as Extract<
            ChatBlock,
            { kind: "execution" }
          >;
          const updated: ChatBlock = {
            ...existing,
            status,
            message: event.message || existing.message,
            logs: logLine ? [...existing.logs, logLine].slice(-40) : existing.logs,
            serviceCalls: serviceLine
              ? [...existing.serviceCalls, serviceLine].slice(-20)
              : existing.serviceCalls,
            returnValue:
              returnValue !== undefined ? returnValue : existing.returnValue,
            code: code ?? existing.code,
            errorCode: errorCode ?? existing.errorCode,
            errorMessage: errorMessage ?? existing.errorMessage,
            issues: issues ?? existing.issues,
          };
          return [
            ...next.slice(0, existingIndex),
            updated,
            ...next.slice(existingIndex + 1),
          ];
        }
        return [
          ...next,
          {
            id: newId("execution"),
            kind: "execution",
            executionId,
            status,
            message: event.message || `Execution ${phase}`,
            logs: logLine ? [logLine] : [],
            serviceCalls: serviceLine ? [serviceLine] : [],
            returnValue,
            code,
            errorCode,
            errorMessage,
            issues,
          },
        ];
      }
      return next;
  }
}

export function useAgentChat(options?: {
  uiContext?: AgentUIContextPayload | null;
}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<ChatBlock[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [isCancellingExecution, setIsCancellingExecution] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(null);

  useEffect(() => {
    conversationRef.current = conversationId;
    if (conversationId) {
      window.localStorage.setItem(STORAGE_KEY, conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await getAgentConversation(stored);
        if (cancelled) return;
        setConversationId(detail.conversation_id);
        setBlocks(blocksFromRestoredMessages(detail.messages));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setBlocks((prev) => [
        ...prev,
        { id: newId("user"), kind: "user", text: trimmed },
      ]);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const stream = await streamAgentTurn(
          {
            message: trimmed,
            conversation_id: conversationRef.current,
            ui_context: options?.uiContext ?? null,
          },
          { signal: controller.signal }
        );

        for await (const event of stream) {
          if (event.conversation_id) {
            setConversationId(event.conversation_id);
          }
          if (
            event.type.startsWith("execution.") &&
            typeof event.data?.execution_id === "string"
          ) {
            const executionId = event.data.execution_id;
            if (
              event.type === "execution.completed" ||
              event.type === "execution.failed" ||
              event.type === "execution.cancelled" ||
              event.type === "execution.partial"
            ) {
              setActiveExecutionId((current) =>
                current === executionId ? null : current
              );
            } else {
              setActiveExecutionId(executionId);
            }
          }
          setBlocks((prev) => applyTurnEvent(prev, event));
          if (event.type === "error") {
            setError(event.message || "Turn failed");
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const messageText =
          err instanceof Error ? err.message : "Failed to run agent turn";
        setError(messageText);
        setBlocks((prev) => [
          ...prev,
          { id: newId("error"), kind: "error", text: messageText },
        ]);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, options?.uiContext]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const cancelExecution = useCallback(
    async (executionId?: string) => {
      const target = executionId || activeExecutionId;
      if (!target || isCancellingExecution) return;
      setIsCancellingExecution(true);
      try {
        await cancelAgentExecution(target);
      } catch (err) {
        const messageText =
          err instanceof Error ? err.message : "Failed to cancel execution";
        setError(messageText);
      } finally {
        setIsCancellingExecution(false);
      }
    },
    [activeExecutionId, isCancellingExecution]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setConversationId(null);
    conversationRef.current = null;
    window.localStorage.removeItem(STORAGE_KEY);
    setBlocks([]);
    setError(null);
    setIsStreaming(false);
    setActiveExecutionId(null);
  }, []);

  return {
    conversationId,
    blocks,
    isStreaming,
    error,
    activeExecutionId,
    isCancellingExecution,
    sendMessage,
    stop,
    cancelExecution,
    reset,
  };
}
