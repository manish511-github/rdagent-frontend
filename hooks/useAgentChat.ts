"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelAgentColumnBatch,
  cancelAgentExecution,
  confirmAgentAutomation,
  getAgentAutomation,
  getAgentColumnBatch,
  getAgentColumnBatchEvents,
  getAgentConversation,
  getAgentWorkspaceTable,
  listAgentConversations,
  listAgentWorkspaceTables,
  listAgentWorkspaceColumnBatches,
  retryFailedAgentColumnBatch,
  streamAgentTurn,
  updateAgentAutomation,
} from "@/lib/agent-chat/api";
import type {
  AgentAutomationAction,
  AgentAutomationPatch,
  AgentAutomationTask,
  AgentTurnEvent,
  AgentUIContextPayload,
  AgentConversationSummary,
  AgentColumnRunProgress,
  AgentColumnBatchStatus,
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

function automationDraftBlockFromData(
  data: Record<string, unknown>
): Extract<ChatBlock, { kind: "automation_draft" }> {
  return {
    id: newId("automation-draft"),
    kind: "automation_draft",
    slug: asString(data.slug),
    version: asNumber(data.version, 1),
    name: asString(data.name, "Scheduled automation"),
    description: asString(data.description),
    cron: asString(data.cron),
    timezone: asString(data.timezone, "UTC"),
    scheduleLabel: asString(data.schedule_label, asString(data.cron)),
    promptPreview: asString(data.prompt_preview),
    estimatedCostPerRun:
      typeof data.estimated_cost_per_run === "number"
        ? data.estimated_cost_per_run
        : null,
    linkedTableSlugs: asStringArray(data.linked_table_slugs),
    status:
      data.status === "active" || data.status === "paused" || data.status === "archived"
        ? data.status
        : "draft",
    enabled: data.enabled === true,
    nextRunAt: asString(data.next_run_at) || null,
  };
}

function automationConfirmationBlockFromData(
  data: Record<string, unknown>
): Extract<ChatBlock, { kind: "automation_confirmation" }> {
  const rawAction = asString(data.action);
  const action: AgentAutomationAction =
    rawAction === "run_now" || rawAction === "edit_live" || rawAction === "delete_active"
      ? rawAction
      : "enable";
  return {
    id: newId("automation-confirmation"),
    kind: "automation_confirmation",
    slug: asString(data.slug),
    version: asNumber(data.version, 1),
    action,
    name: asString(data.name, "Scheduled automation"),
    scheduleLabel: asString(data.schedule_label),
    timezone: asString(data.timezone, "UTC"),
    estimatedCostPerRun:
      typeof data.estimated_cost_per_run === "number"
        ? data.estimated_cost_per_run
        : null,
    changes:
      data.changes && typeof data.changes === "object"
        ? (data.changes as Record<string, unknown>)
        : {},
  };
}

function uiEventDataFromMessage(
  message: { payload?: Record<string, unknown> | null }
): Record<string, unknown> | null {
  const result = message.payload?.result;
  const uiEvent =
    result && typeof result === "object"
      ? (result as Record<string, unknown>).ui_event
      : null;
  const data =
    uiEvent && typeof uiEvent === "object"
      ? (uiEvent as Record<string, unknown>).data
      : null;
  return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
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
      const questionData = uiEventDataFromMessage(message);
      if (questionData && typeof questionData === "object") {
        blocks.push(questionBlockFromData(questionData as Record<string, unknown>));
      }
      continue;
    }
    if (message.event_type === "tool.present_automation_draft") {
      const data = uiEventDataFromMessage(message);
      if (data) blocks.push(automationDraftBlockFromData(data));
      continue;
    }
    if (message.event_type === "tool.request_automation_confirmation") {
      const data = uiEventDataFromMessage(message);
      if (data) blocks.push(automationConfirmationBlockFromData(data));
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

function syncAutomationTask(
  blocks: ChatBlock[],
  task: AgentAutomationTask
): ChatBlock[] {
  let foundDraft = false;
  const synced = blocks.map((block) => {
    if (block.kind === "automation_draft" && block.slug === task.slug) {
      foundDraft = true;
      return {
        ...block,
        version: task.version,
        name: task.name,
        description: task.description,
        promptPreview: task.prompt,
        cron: task.schedule_json.cron_local || task.cron_utc,
        timezone: task.timezone,
        scheduleLabel: task.schedule_json.label || task.cron_utc,
        linkedTableSlugs: task.linked_table_slugs,
        status: task.status,
        enabled: task.enabled,
        nextRunAt: task.next_run_at,
        busy: false,
        actionError: null,
      };
    }
    if (block.kind === "automation_confirmation" && block.slug === task.slug) {
      return {
        ...block,
        version: task.version,
        name: task.name,
        scheduleLabel: task.schedule_json.label || task.cron_utc,
        timezone: task.timezone,
        busy: false,
        actionError: null,
      };
    }
    return block;
  });
  if (foundDraft || task.status === "archived") return synced;
  return [
    ...synced,
    {
      id: newId("automation-draft"),
      kind: "automation_draft",
      slug: task.slug,
      version: task.version,
      name: task.name,
      description: task.description,
      cron: task.schedule_json.cron_local || task.cron_utc,
      timezone: task.timezone,
      scheduleLabel: task.schedule_json.label || task.cron_utc,
      promptPreview: task.prompt,
      estimatedCostPerRun: null,
      linkedTableSlugs: task.linked_table_slugs,
      status: task.status,
      enabled: task.enabled,
      nextRunAt: task.next_run_at,
    },
  ];
}

function setAutomationPending(
  blocks: ChatBlock[],
  slug: string,
  busy: boolean,
  actionError: string | null = null
): ChatBlock[] {
  return blocks.map((block) =>
    (block.kind === "automation_draft" || block.kind === "automation_confirmation") &&
    block.slug === slug
      ? { ...block, busy, actionError }
      : block
  );
}

function isTerminalColumnBatch(status: AgentColumnBatchStatus["status"]): boolean {
  return ["complete", "partial", "failed", "cancelled"].includes(status);
}

function columnProgressFromBatch(
  batch: AgentColumnBatchStatus
): AgentColumnRunProgress {
  return {
    batchId: batch.batch_id,
    batchStatus: batch.status,
    tableSlug: batch.table_slug,
    columns: batch.requested_columns,
    processedCells:
      batch.cells_completed +
      batch.cells_failed +
      batch.cells_cancelled +
      batch.cells_skipped,
    totalCells: batch.cells_total + batch.cells_skipped,
    cellsCompleted: batch.cells_completed,
    cellsFailed: batch.cells_failed,
    cellsCancelled: batch.cells_cancelled,
    cellsSkipped: batch.cells_skipped,
    status: isTerminalColumnBatch(batch.status) ? "completed" : "running",
  };
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
      qualification_status:
        asString(data.qualification_status) || row.qualification_status,
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
    case "automation_draft": {
      const finalized = finalizeStreaming();
      const block = automationDraftBlockFromData(data);
      const existingIndex = finalized.findIndex(
        (candidate) => candidate.kind === "automation_draft" && candidate.slug === block.slug
      );
      if (existingIndex < 0) return [...finalized, block];
      return [
        ...finalized.slice(0, existingIndex),
        { ...block, id: finalized[existingIndex].id },
        ...finalized.slice(existingIndex + 1),
      ];
    }
    case "automation_confirmation":
      return [
        ...finalizeStreaming(),
        automationConfirmationBlockFromData(data),
      ];
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
  initialConversationId?: string | null;
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
  const [activeColumnBatches, setActiveColumnBatches] = useState<
    Record<string, AgentColumnBatchStatus>
  >({});
  const [activeColumnBatchAction, setActiveColumnBatchAction] = useState<string | null>(null);
  const [recentConversations, setRecentConversations] = useState<AgentConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<string | null>(null);
  const activeTableSlugRef = useRef<string | null>(null);
  const columnBatchCursorRef = useRef<Record<string, number>>({});

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
        setActiveColumnBatches({});
        columnBatchCursorRef.current = {};
        return;
      }
      try {
        // Fetch independent workspace metadata together. Batch restoration is
        // additive, so a temporarily unavailable progress endpoint must not
        // hide otherwise-readable tables.
        const [tables, batches] = await Promise.all([
          listAgentWorkspaceTables(workspaceId),
          listAgentWorkspaceColumnBatches(workspaceId).catch(() => []),
        ]);
        setWorkspaceTables(tables);
        setActiveColumnBatches(
          Object.fromEntries(batches.map((batch) => [batch.batch_id, batch]))
        );
        setColumnRunProgress((current) => ({
          ...current,
          ...Object.fromEntries(
            batches.map((batch) => [
              batch.table_slug,
              columnProgressFromBatch(batch),
            ])
          ),
        }));
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
    const linkedConversation = new URLSearchParams(window.location.search).get("conversation");
    const stored =
      options?.initialConversationId ||
      linkedConversation ||
      window.localStorage.getItem(STORAGE_KEY);
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
  }, [options?.initialConversationId, refreshRecentConversations, refreshWorkspace]);

  useEffect(() => {
    const batches = Object.values(activeColumnBatches).filter(
      (batch) => !isTerminalColumnBatch(batch.status)
    );
    if (batches.length === 0) return;

    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      const updates = await Promise.allSettled(
        batches.map(async (knownBatch) => {
          const after = columnBatchCursorRef.current[knownBatch.batch_id] || 0;
          const [status, eventPage] = await Promise.all([
            getAgentColumnBatch(knownBatch.batch_id),
            getAgentColumnBatchEvents(knownBatch.batch_id, after),
          ]);
          return { status, eventPage };
        })
      );
      if (cancelled) return;

      const successful = updates.flatMap((update) =>
        update.status === "fulfilled" ? [update.value] : []
      );
      if (successful.length > 0) {
        for (const { status, eventPage } of successful) {
          columnBatchCursorRef.current[status.batch_id] = eventPage.next_after;
          setColumnRunProgress((current) => ({
            ...current,
            [status.table_slug]: columnProgressFromBatch(status),
          }));
          for (const durableEvent of eventPage.events) {
            const event: AgentTurnEvent = {
              type: durableEvent.type,
              data: durableEvent.data,
              conversation_id: status.workspace_id,
            };
            if (event.type.startsWith("column.cell.")) {
              setActiveTable((current) => patchWorkspaceCell(current, event));
            }
          }
          // A final table read is a safety net if event persistence was briefly
          // unavailable while the cell value itself committed successfully.
          if (
            isTerminalColumnBatch(status.status) &&
            activeTableSlugRef.current === status.table_slug
          ) {
            void loadWorkspaceTable(status.table_slug, status.workspace_id);
          }
        }

        setActiveColumnBatches((current) => {
          const next = { ...current };
          for (const { status } of successful) {
            if (isTerminalColumnBatch(status.status)) {
              delete next[status.batch_id];
            } else {
              next[status.batch_id] = status;
            }
          }
          return next;
        });
      }
      if (!cancelled) timer = window.setTimeout(poll, 1_000);
    };
    timer = window.setTimeout(poll, 1_000);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [activeColumnBatches, loadWorkspaceTable]);

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
                  batchId: previous?.batchId,
                  batchStatus: previous?.batchStatus,
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
                  cellsCancelled: asNumber(
                    data.cells_cancelled ?? data.cellsCancelled,
                    isStarted ? 0 : previous?.cellsCancelled || 0
                  ),
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

  const refreshAutomation = useCallback(async (slug: string) => {
    setBlocks((current) => setAutomationPending(current, slug, true));
    try {
      const task = await getAgentAutomation(slug);
      setBlocks((current) => syncAutomationTask(current, task));
      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load automation";
      setBlocks((current) => setAutomationPending(current, slug, false, message));
      throw err;
    }
  }, []);

  const saveAutomation = useCallback(
    async (input: {
      slug: string;
      expectedVersion: number;
      patch: AgentAutomationPatch;
      confirmLiveEdit?: boolean;
    }) => {
      setBlocks((current) => setAutomationPending(current, input.slug, true));
      try {
        const result = input.confirmLiveEdit
          ? await confirmAgentAutomation(input.slug, {
              expected_version: input.expectedVersion,
              action: "edit_live",
              confirmed: true,
              patch: input.patch,
            })
          : await updateAgentAutomation(input.slug, {
              expected_version: input.expectedVersion,
              patch: input.patch,
            });
        setBlocks((current) => syncAutomationTask(current, result.task));
        return result.task;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save automation";
        setBlocks((current) => setAutomationPending(current, input.slug, false, message));
        throw err;
      }
    },
    []
  );

  const pauseAutomation = useCallback(async (slug: string, expectedVersion: number) => {
    setBlocks((current) => setAutomationPending(current, slug, true));
    try {
      const result = await updateAgentAutomation(slug, {
        expected_version: expectedVersion,
        pause: true,
      });
      setBlocks((current) => syncAutomationTask(current, result.task));
      return result.task;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to pause automation";
      setBlocks((current) => setAutomationPending(current, slug, false, message));
      throw err;
    }
  }, []);

  const confirmAutomation = useCallback(
    async (input: {
      slug: string;
      expectedVersion: number;
      action: AgentAutomationAction;
      patch?: AgentAutomationPatch;
    }) => {
      setBlocks((current) => setAutomationPending(current, input.slug, true));
      try {
        const result = await confirmAgentAutomation(input.slug, {
          expected_version: input.expectedVersion,
          action: input.action,
          confirmed: true,
          ...(input.patch ? { patch: input.patch } : {}),
        });
        setBlocks((current) =>
          syncAutomationTask(
            current.filter(
              (block) =>
                !(block.kind === "automation_confirmation" && block.slug === input.slug)
            ),
            result.task
          )
        );
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Automation action failed";
        setBlocks((current) => setAutomationPending(current, input.slug, false, message));
        throw err;
      }
    },
    []
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
    setActiveColumnBatches({});
    setActiveColumnBatchAction(null);
    columnBatchCursorRef.current = {};
  }, []);

  const cancelColumnBatch = useCallback(
    async (batchId: string) => {
      if (activeColumnBatchAction) return;
      setActiveColumnBatchAction(batchId);
      setWorkspaceError(null);
      try {
        const status = await cancelAgentColumnBatch(batchId);
        setColumnRunProgress((current) => ({
          ...current,
          [status.table_slug]: columnProgressFromBatch(status),
        }));
        setActiveColumnBatches((current) => {
          const next = { ...current };
          delete next[batchId];
          return next;
        });
        await loadWorkspaceTable(status.table_slug, status.workspace_id);
      } catch (err) {
        setWorkspaceError(
          err instanceof Error ? err.message : "Failed to cancel column work"
        );
      } finally {
        setActiveColumnBatchAction(null);
      }
    },
    [activeColumnBatchAction, loadWorkspaceTable]
  );

  const retryFailedColumnBatch = useCallback(
    async (batchId: string) => {
      if (activeColumnBatchAction) return;
      setActiveColumnBatchAction(batchId);
      setWorkspaceError(null);
      try {
        const status = await retryFailedAgentColumnBatch(batchId);
        setActiveColumnBatches((current) => ({
          ...current,
          [status.batch_id]: status,
        }));
        setColumnRunProgress((current) => ({
          ...current,
          [status.table_slug]: columnProgressFromBatch(status),
        }));
      } catch (err) {
        setWorkspaceError(
          err instanceof Error ? err.message : "Failed to retry failed cells"
        );
      } finally {
        setActiveColumnBatchAction(null);
      }
    },
    [activeColumnBatchAction]
  );

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
    activeColumnBatchAction,
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
    cancelColumnBatch,
    retryFailedColumnBatch,
    refreshAutomation,
    saveAutomation,
    pauseAutomation,
    confirmAutomation,
    reset,
  };
}
