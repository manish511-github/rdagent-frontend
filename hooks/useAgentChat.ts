"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelAgentExecution,
  getAgentConversation,
  getAgentWorkspaceTable,
  listAgentConversations,
  listAgentWorkspaceTables,
  streamAgentTurn,
} from "@/lib/agent-chat/api";
import type {
  AgentTurnEvent,
  AgentUIContextPayload,
  AgentConversationSummary,
  AgentColumnRunProgress,
  AgentWorkspaceCellState,
  AgentWorkspaceTablePage,
  AgentWorkspaceTableSummary,
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

function questionBlockFromData(
  data: Record<string, unknown>
): Extract<ChatBlock, { kind: "questions" }> {
  const questions = Array.isArray(data.questions)
    ? data.questions
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === "object"
        )
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

  return {
    id: newId("questions"),
    kind: "questions",
    title: asString(data.title, "Quick questions"),
    questions,
  };
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
    if (message.event_type === "tool.ask_questions") {
      const result = message.payload?.result;
      const uiEvent =
        result && typeof result === "object"
          ? (result as Record<string, unknown>).ui_event
          : null;
      const questionData =
        uiEvent && typeof uiEvent === "object"
          ? (uiEvent as Record<string, unknown>).data
          : null;
      if (questionData && typeof questionData === "object") {
        blocks.push(questionBlockFromData(questionData as Record<string, unknown>));
      }
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

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function patchWorkspaceCell(
  page: AgentWorkspaceTablePage | null,
  event: AgentTurnEvent
): AgentWorkspaceTablePage | null {
  if (!page) return page;
  const data = event.data || {};
  const tableSlug = asString(data.table_slug);
  if (!tableSlug || page.table.slug !== tableSlug) return page;
  const columnSlug = asString(data.column);
  const rowId = asNumber(data.row_id, -1);
  const sourceKey = asString(data.source_key);
  if (!columnSlug || (rowId < 0 && !sourceKey)) return page;

  let changed = false;
  const rows = page.rows.map((row) => {
    if (row.id !== rowId && row.source_key !== sourceKey) return row;
    changed = true;
    const previous = row.cells?.[columnSlug];
    const rawError = data.error;
    const cell: AgentWorkspaceCellState = {
      status:
        event.type === "column.cell.started"
          ? "running"
          : event.type === "column.cell.completed"
            ? "succeeded"
            : "failed",
      attempts: asNumber(data.attempts, previous?.attempts || 0),
      error:
        rawError && typeof rawError === "object"
          ? (rawError as Record<string, unknown>)
          : event.type === "column.cell.failed"
            ? previous?.error || { message: "This value could not be calculated." }
            : null,
      started_at: previous?.started_at,
      completed_at:
        event.type === "column.cell.started"
          ? null
          : asString(data.timestamp) || new Date().toISOString(),
    };
    return {
      ...row,
      values:
        event.type === "column.cell.completed" && "value" in data
          ? { ...row.values, [columnSlug]: data.value }
          : row.values,
      cells: { ...(row.cells || {}), [columnSlug]: cell },
    };
  });
  return changed ? { ...page, rows } : page;
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
      return [
        ...finalized,
        questionBlockFromData(data),
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
        callId: asString(data.tool_call_id) || undefined,
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
        const callId = asString(data.tool_call_id);
        for (let index = next.length - 1; index >= 0; index -= 1) {
          const candidate = next[index];
          if (candidate.kind === "activity") {
            const stepIndex = candidate.steps.findLastIndex(
              (step) =>
                step.phase === "start" &&
                (callId ? step.callId === callId : step.tool === toolName)
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
              callId: asString(data.tool_call_id) || undefined,
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
  const [workspaceTables, setWorkspaceTables] = useState<AgentWorkspaceTableSummary[]>([]);
  const [activeTableSlug, setActiveTableSlug] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<AgentWorkspaceTablePage | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [columnRunProgress, setColumnRunProgress] = useState<Record<string, AgentColumnRunProgress>>({});
  const [recentConversations, setRecentConversations] = useState<AgentConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(null);
  const activeTableSlugRef = useRef<string | null>(null);

  const loadWorkspaceTable = useCallback(
    async (slug: string, targetConversationId?: string | null) => {
      const workspaceId = targetConversationId || conversationRef.current;
      if (!workspaceId) return;
      setIsWorkspaceLoading(true);
      setWorkspaceError(null);
      try {
        const page = await getAgentWorkspaceTable(workspaceId, slug);
        setActiveTableSlug(slug);
        activeTableSlugRef.current = slug;
        setActiveTable(page);
      } catch (err) {
        setWorkspaceError(
          err instanceof Error ? err.message : "Failed to load workspace table"
        );
      } finally {
        setIsWorkspaceLoading(false);
      }
    },
    []
  );

  const refreshWorkspace = useCallback(
    async (options?: {
      preferNewest?: boolean;
      preferredSlug?: string;
      conversationId?: string | null;
    }) => {
      const workspaceId = options?.conversationId || conversationRef.current;
      if (!workspaceId) {
        setWorkspaceTables([]);
        setActiveTableSlug(null);
        activeTableSlugRef.current = null;
        setActiveTable(null);
        return;
      }
      try {
        const tables = await listAgentWorkspaceTables(workspaceId);
        setWorkspaceTables(tables);
        if (tables.length === 0) {
          setActiveTableSlug(null);
          activeTableSlugRef.current = null;
          setActiveTable(null);
          return;
        }
        const current = activeTableSlugRef.current;
        const nextSlug =
          options?.preferredSlug &&
          tables.some(({ table }) => table.slug === options.preferredSlug)
            ? options.preferredSlug
            : options?.preferNewest || !current || !tables.some(({ table }) => table.slug === current)
            ? tables[0].table.slug
            : current;
        await loadWorkspaceTable(nextSlug, workspaceId);
      } catch (err) {
        setWorkspaceError(
          err instanceof Error ? err.message : "Failed to load workspace"
        );
      }
    },
    [loadWorkspaceTable]
  );

  const refreshRecentConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      setRecentConversations(await listAgentConversations());
    } catch {
      // Chat remains usable if the navigation list is temporarily unavailable.
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const openConversation = useCallback(
    async (targetConversationId: string) => {
      if (isStreaming || targetConversationId === conversationRef.current) return;
      setError(null);
      setWorkspaceError(null);
      setIsWorkspaceLoading(true);
      try {
        const detail = await getAgentConversation(targetConversationId);
        conversationRef.current = detail.conversation_id;
        setConversationId(detail.conversation_id);
        setBlocks(blocksFromRestoredMessages(detail.messages));
        setActiveExecutionId(null);
        activeTableSlugRef.current = null;
        setActiveTableSlug(null);
        setActiveTable(null);
        await refreshWorkspace({ conversationId: detail.conversation_id });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversation");
      } finally {
        setIsWorkspaceLoading(false);
      }
    },
    [isStreaming, refreshWorkspace]
  );

  useEffect(() => {
    conversationRef.current = conversationId;
    if (conversationId) {
      window.localStorage.setItem(STORAGE_KEY, conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    void refreshRecentConversations();
    if (!stored) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await getAgentConversation(stored);
        if (cancelled) return;
        conversationRef.current = detail.conversation_id;
        setConversationId(detail.conversation_id);
        setBlocks(blocksFromRestoredMessages(detail.messages));
        await refreshWorkspace({ conversationId: detail.conversation_id });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshRecentConversations, refreshWorkspace]);

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
            ui_context: {
              ...(options?.uiContext || {}),
              // Informational only. The backend always binds execution to the
              // resolved conversation ID, including on the first turn.
              visible_workspace_id: conversationRef.current,
              visible_table_id: activeTableSlugRef.current,
              visible_panel: activeTableSlugRef.current ? "table" : "chat",
            },
          },
          { signal: controller.signal }
        );

        for await (const event of stream) {
          if (event.conversation_id) {
            conversationRef.current = event.conversation_id;
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
          if (event.type.startsWith("column.cell.")) {
            setActiveTable((current) => patchWorkspaceCell(current, event));
          }
          if (event.type.startsWith("column.run.")) {
            const data = event.data || {};
            const tableSlug = asString(data.table_slug);
            if (tableSlug) {
              setColumnRunProgress((current) => {
                const previous = current[tableSlug];
                const isStarted = event.type === "column.run.started";
                const nextProgress: AgentColumnRunProgress = {
                  tableSlug,
                  columns: asStringArray(data.columns).length
                    ? asStringArray(data.columns)
                    : previous?.columns || [],
                  processedCells: asNumber(
                    data.processed_cells,
                    isStarted
                      ? 0
                      : event.type === "column.run.completed"
                      ? asNumber(data.cellsCompleted) + asNumber(data.cellsFailed) + asNumber(data.cellsSkipped)
                      : previous?.processedCells || 0
                  ),
                  totalCells: asNumber(data.total_cells, previous?.totalCells || 0),
                  cellsCompleted: asNumber(data.cells_completed ?? data.cellsCompleted, isStarted ? 0 : previous?.cellsCompleted || 0),
                  cellsFailed: asNumber(data.cells_failed ?? data.cellsFailed, isStarted ? 0 : previous?.cellsFailed || 0),
                  cellsSkipped: asNumber(data.cells_skipped ?? data.cellsSkipped, isStarted ? 0 : previous?.cellsSkipped || 0),
                  status: event.type === "column.run.completed" ? "completed" : "running",
                };
                return { ...current, [tableSlug]: nextProgress };
              });
            }
          }
          if (event.type === "execution.workspace_updated") {
            const tableSlug =
              typeof event.data?.table_slug === "string"
                ? event.data.table_slug
                : undefined;
            void refreshWorkspace({
              preferredSlug: tableSlug,
              preferNewest: !tableSlug,
              conversationId: event.conversation_id || conversationRef.current,
            });
          } else if (
            event.type === "execution.completed" ||
            event.type === "execution.partial" ||
            event.type === "column.run.completed"
          ) {
            void refreshWorkspace({
              conversationId: event.conversation_id || conversationRef.current,
            });
          }
          if (event.type === "error") {
            setError(event.message || "Turn failed");
          }
        }
        void refreshRecentConversations();
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
    [isStreaming, options?.uiContext, refreshRecentConversations, refreshWorkspace]
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
    setWorkspaceTables([]);
    setActiveTableSlug(null);
    activeTableSlugRef.current = null;
    setActiveTable(null);
    setWorkspaceError(null);
    setColumnRunProgress({});
  }, []);

  return {
    conversationId,
    blocks,
    isStreaming,
    error,
    activeExecutionId,
    isCancellingExecution,
    workspaceTables,
    activeTableSlug,
    activeTable,
    isWorkspaceLoading,
    workspaceError,
    columnRunProgress,
    recentConversations,
    isLoadingConversations,
    currentConversationTitle:
      recentConversations.find((item) => item.conversation_id === conversationId)?.title ||
      "Agent Chat",
    selectWorkspaceTable: (slug: string) => loadWorkspaceTable(slug),
    openConversation,
    refreshRecentConversations,
    refreshWorkspace,
    sendMessage,
    stop,
    cancelExecution,
    reset,
  };
}
