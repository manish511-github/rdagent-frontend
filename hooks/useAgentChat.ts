"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { getApiUrl } from "@/lib/config";
import {
  mergeAgentSignal,
  normalizeStreamEvent,
  parseSseChunk,
  readError,
} from "@/lib/agent-chat/stream-utils";
import { resultDisplayCount } from "@/lib/agent-chat/signal-utils";
import {
  type AgentMode,
  type AgentRuntimeMode,
  type AgentConversationDetail,
  type AgentRunResponse,
  type AgentStreamEvent,
  type AgentTurnEvent,
  type AgentTurnRequest,
  type ChatMessage,
  type AgentWorkspaceEvent,
  type ResearchPlan,
} from "@/lib/agent-chat/types";

type UseAgentChatOptions = {
  includeWelcomeMessage?: boolean;
  persistKey?: string;
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Tell me what brand, product, competitor, or keyword you want to track. I can monitor mentions across Reddit, X/Twitter, Hacker News, YouTube, GitHub, LinkedIn, and newsletters.",
};

type PersistedAgentChatSession = {
  version: 2 | 3 | 4;
  sessionId: string;
  conversationId?: string | null;
  visibleArtifactId?: string | null;
  sessionTitle: string;
  initialPrompt: string;
  agentMode: AgentMode;
  runtimeMode: AgentRuntimeMode;
  aiExpandKeywords: boolean;
  productName: string;
  competitors: string;
  messages: ChatMessage[];
  workspaceEvents: AgentWorkspaceEvent[];
  liveAgentSignals: AgentRunResponse["signals"];
  researchPlan?: ResearchPlan | null;
  updatedAt: number;
};

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromPrompt(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (!compact) return "New agent chat";
  return compact.length > 72 ? `${compact.slice(0, 69)}...` : compact;
}

function normalizeTurnEvent(event: AgentTurnEvent): AgentTurnEvent {
  if (event.type) return event;
  const statusToType: Record<string, AgentTurnEvent["type"]> = {
    planning: "run.status",
    running: "run.status",
    tool_call: "tool.called",
    tool_result: "tool.completed",
    quality: "quality.checked",
    repairing: "repair.started",
    complete: "answer.completed",
    error: "turn.failed",
  };
  return {
    ...event,
    type: event.status ? statusToType[event.status] : undefined,
  };
}

function turnEventToStreamEvent(event: AgentTurnEvent): AgentStreamEvent {
  const statusByType: Record<string, string> = {
    "plan.started": "planning",
    "plan.approved": "running",
    "plan.rejected": "rejected",
    "run.started": "running",
    "run.status": event.status || "running",
    "tool.called": "tool_call",
    "tool.completed": "tool_result",
    "quality.checked": "quality",
    "repair.started": "repairing",
    "answer.completed": "complete",
    "turn.failed": "error",
    "clarification.requested": "error",
  };
  const type = event.type || "";
  return {
    status: event.status || statusByType[type],
    message: event.message,
    data: event.data,
    type: event.type,
  };
}

function readPersistedSession(
  persistKey?: string
): PersistedAgentChatSession | null {
  if (!persistKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAgentChatSession;
    return parsed.version === 2 || parsed.version === 3 || parsed.version === 4
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function messagesFromConversation(
  conversation: AgentConversationDetail,
  includeWelcomeMessage: boolean
): ChatMessage[] {
  const restored: ChatMessage[] = [];
  for (const item of conversation.messages || []) {
    if (item.role === "user") {
      restored.push({
        id: `server-${item.id}`,
        role: "user",
        content: item.content,
      });
      continue;
    }

    const event = item.payload;
    if (event?.type === "plan.created") {
      const plan = event.data?.plan as ResearchPlan | undefined;
      if (plan) {
        restored.push({
          id: `server-${item.id}`,
          role: "assistant",
          content: `Here is my research plan for: "${plan.message || conversation.title}"`,
          researchPlan: plan,
        });
        continue;
      }
    }

    if (event?.type === "answer.completed") {
      const data = event.data?.response as AgentRunResponse | undefined;
      if (data) {
        restored.push({
          id: `server-${item.id}`,
          role: "assistant",
          content: buildExecutionSummary(data),
          data,
          resultTitle: conversation.title,
          reasoning: data.reasoning || undefined,
        });
        continue;
      }
    }

    if (event?.type === "turn.failed") {
      const activityTrace = event.data?.activity_trace;
      restored.push({
        id: `server-${item.id}`,
        role: "assistant",
        content: item.content || event.message || "Agent turn failed.",
        activityTrace: Array.isArray(activityTrace) ? activityTrace : undefined,
      });
      continue;
    }

    if (item.content) {
      restored.push({
        id: `server-${item.id}`,
        role: "assistant",
        content: item.content,
      });
    }
  }
  if (!restored.length && includeWelcomeMessage) {
    return [welcomeMessage];
  }
  return restored;
}

export function useAgentChat({
  includeWelcomeMessage = true,
  persistKey,
}: UseAgentChatOptions = {}) {
  const persistedSession = useMemo(
    () => readPersistedSession(persistKey),
    [persistKey]
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const [sessionId, setSessionId] = useState(
    () => persistedSession?.sessionId || createClientId()
  );
  const [conversationId, setConversationId] = useState<string | null>(
    () => persistedSession?.conversationId || null
  );
  const [visibleArtifactId, setVisibleArtifactId] = useState<string | null>(
    () => persistedSession?.visibleArtifactId || null
  );
  const [selectedArtifactRowKey, setSelectedArtifactRowKey] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState(
    () => persistedSession?.sessionTitle || ""
  );
  const [initialPrompt, setInitialPrompt] = useState(
    () => persistedSession?.initialPrompt || ""
  );
  const [prompt, setPrompt] = useState("");
  const [agentMode, setAgentMode] = useState<AgentMode>(
    () => persistedSession?.agentMode || "auto"
  );
  const [runtimeMode, setRuntimeMode] = useState<AgentRuntimeMode>(
    () => persistedSession?.runtimeMode || "chat"
  );
  const [aiExpandKeywords, setAiExpandKeywords] = useState(
    () => persistedSession?.aiExpandKeywords ?? true
  );
  const [productName, setProductName] = useState(
    () => persistedSession?.productName || ""
  );
  const [competitors, setCompetitors] = useState(
    () => persistedSession?.competitors || ""
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [workspaceEvents, setWorkspaceEvents] = useState<
    AgentWorkspaceEvent[]
  >(() => persistedSession?.workspaceEvents || []);
  const [liveAgentSignals, setLiveAgentSignals] = useState<
    AgentRunResponse["signals"]
  >(() => persistedSession?.liveAgentSignals || []);
  const [liveReasoning, setLiveReasoning] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    persistedSession?.messages ||
    (includeWelcomeMessage ? [welcomeMessage] : [])
  );
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(
    () => persistedSession?.researchPlan || null
  );
  const [hasRestoredConversation, setHasRestoredConversation] = useState(
    () => !persistedSession?.conversationId
  );
  const [isRestoringConversation, setIsRestoringConversation] = useState(false);

  const canSubmitPrompt = (value: string) =>
    value.trim().length >= 8 && !isSearching;

  const canSearch = canSubmitPrompt(prompt);

  useEffect(() => {
    if (!conversationId || hasRestoredConversation) return;
    const token = Cookies.get("access_token");
    if (!token) {
      setHasRestoredConversation(true);
      return;
    }

    let cancelled = false;
    const restoreConversation = async () => {
      setIsRestoringConversation(true);
      try {
        const response = await fetch(
          getApiUrl(`agent-runtime/conversations/${conversationId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("The selected conversation could not be loaded.");
        }
        const conversation = (await response.json()) as AgentConversationDetail;
        if (cancelled) return;
        const restoredMessages = messagesFromConversation(
          conversation,
          includeWelcomeMessage
        );
        setMessages(restoredMessages);
        setSessionTitle(conversation.title);
        setInitialPrompt(
          restoredMessages.find((message) => message.role === "user")?.content ||
            conversation.title
        );

        // Plans and completed results are separate persisted assistant events.
        // Find each independently so switching to an older completed chat
        // restores both its Plan card and its Result card.
        const latestPlanMessage = [...restoredMessages].reverse().find(
          (message): message is Extract<ChatMessage, { role: "assistant" }> =>
            message.role === "assistant" && Boolean(message.researchPlan)
        );
        const latestResultMessage = [...restoredMessages].reverse().find(
          (message): message is Extract<ChatMessage, { role: "assistant" }> =>
            message.role === "assistant" && Boolean(message.data)
        );
        setResearchPlan(latestPlanMessage?.researchPlan || null);
        setLiveAgentSignals(latestResultMessage?.data?.signals || []);
        setWorkspaceEvents([]);
        setLiveReasoning("");
      } catch (error) {
        if (!cancelled) {
          toast.error("Could not open chat", {
            description:
              error instanceof Error ? error.message : "Please try again.",
          });
        }
      } finally {
        if (!cancelled) {
          setHasRestoredConversation(true);
          setIsRestoringConversation(false);
        }
      }
    };

    void restoreConversation();
    return () => {
      cancelled = true;
    };
  }, [conversationId, hasRestoredConversation, includeWelcomeMessage]);

  /**
   * Switch the active chat using the backend-owned conversation id.
   *
   * We intentionally clear the previous transcript before changing the id.
   * Otherwise the UI can briefly show Hacker News rows while a selected Reddit
   * conversation is loading. The restore effect above then rebuilds rich plan
   * and result cards from the persisted event payloads.
   */
  const selectConversation = useCallback(
    (nextConversationId: string) => {
      if (
        !nextConversationId ||
        nextConversationId === conversationId ||
        isSearching
      ) {
        return;
      }

      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setConversationId(nextConversationId);
      setVisibleArtifactId(null);
      setSelectedArtifactRowKey(null);
      setHasRestoredConversation(false);
      setSessionId(createClientId());
      setSessionTitle("");
      setInitialPrompt("");
      setPrompt("");
      setWorkspaceEvents([]);
      setLiveAgentSignals([]);
      setLiveReasoning("");
      setResearchPlan(null);
      setRuntimeMode("chat");
      setMessages(includeWelcomeMessage ? [welcomeMessage] : []);
      setStreamStatus(null);
    },
    [conversationId, includeWelcomeMessage, isSearching]
  );

  const pushWorkspaceEvent = useCallback((
    event: Omit<AgentWorkspaceEvent, "id" | "createdAt">
  ) => {
    setWorkspaceEvents((current) => {
      if (event.type === "thinking") {
        const rest = current.filter((item) => item.type !== "thinking");
        return [
          ...rest,
          {
            ...event,
            id: createClientId(),
            createdAt: Date.now(),
          },
        ].slice(-40);
      }

      const last = current[current.length - 1];
      if (
        last &&
        last.type === event.type &&
        last.label === event.label &&
        last.platform === event.platform
      ) {
        return current;
      }

      return [
        ...current,
        {
          ...event,
          id: createClientId(),
          createdAt: Date.now(),
        },
      ].slice(-40);
    });
  }, []);

  const handleAgentStreamEvent = useCallback((event: AgentStreamEvent) => {
    if (event.type === "mention_found" && event.mention) {
      setLiveAgentSignals((current) =>
        mergeAgentSignal(current, event.mention as AgentRunResponse["signals"][number])
      );
    }

    const normalized = normalizeStreamEvent(event);
    if (normalized) {
      pushWorkspaceEvent(normalized);
    }
  }, [pushWorkspaceEvent]);

  const stopSearch = useCallback(() => {
    const controller = abortControllerRef.current;
    if (!controller || controller.signal.aborted) return;
    controller.abort();
    setStreamStatus("Stopping run...");
    pushWorkspaceEvent({
      type: "cancelled",
      label: "Run stopped",
      detail: "The current search was cancelled from the chat input.",
    });
  }, [pushWorkspaceEvent]);

  const setMessagePlanStatus = useCallback((
    planId: string,
    status: ResearchPlan["status"]
  ) => {
    setMessages((current) =>
      current.map((message) => {
        if (
          message.role !== "assistant" ||
          message.researchPlan?.plan_id !== planId
        ) {
          return message;
        }
        return {
          ...message,
          researchPlan: { ...message.researchPlan, status },
        };
      })
    );
  }, []);

  const sendTurn = async ({
    message,
    token,
    approvedPlan,
    planDecision = "approve",
    approvedKeywords,
    addUserMessage,
  }: {
    message: string;
    token: string;
    approvedPlan?: ResearchPlan;
    planDecision?: "approve" | "reject";
    approvedKeywords?: string[];
    addUserMessage: boolean;
  }) => {
    if (addUserMessage) {
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "user",
          content: message,
        },
      ]);
    }

    const isPlanRejection = Boolean(
      approvedPlan && planDecision === "reject"
    );
    const isExecution = Boolean(
      (approvedPlan && !isPlanRejection) || approvedKeywords?.length
    );

    setIsSearching(true);
    setRuntimeMode(isExecution ? "executing" : isPlanRejection ? "chat" : "planning");
    setStreamStatus(
      approvedKeywords?.length
        ? "Preparing mention tracking..."
        : isPlanRejection
          ? "Rejecting research plan..."
          : approvedPlan
            ? "Preparing approved research..."
            : "Planning research..."
    );
    setLiveReasoning("");
    setLiveAgentSignals([]);
    if (!approvedPlan) {
      setResearchPlan(null);
    }
    setWorkspaceEvents([
      {
        id: createClientId(),
        type: "thinking",
        label: isPlanRejection
          ? "Rejecting research plan"
          : approvedKeywords?.length
            ? "Preparing mention tracking"
            : approvedPlan
              ? "Preparing approved research"
              : "Planning research strategy",
        detail: isPlanRejection
          ? "Cancelling the draft without executing search tools."
          : approvedKeywords?.length
            ? "Searching the keywords you approved."
            : approvedPlan
              ? "Executing the plan you approved."
              : "Deciding which sources and queries to use.",
        createdAt: Date.now(),
      },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const body: AgentTurnRequest = {
        message,
        ...(conversationId ? { conversation_id: conversationId } : {}),
        ...(visibleArtifactId
          ? {
              ui_context: {
                visible_panel: "results" as const,
                visible_artifact_id: visibleArtifactId,
                ...(selectedArtifactRowKey
                  ? { selected_row_key: selectedArtifactRowKey }
                  : {}),
              },
            }
          : {}),
        ...(approvedPlan
          ? {
              plan_approval: {
                plan_id: approvedPlan.plan_id,
                version: approvedPlan.version,
                decision: planDecision,
                plan: approvedPlan,
              },
            }
          : {}),
        ...(approvedKeywords?.length ? { approved_keywords: approvedKeywords } : {}),
        tool_options: {
          mention_tracking: {
            ai_expand_keywords: false,
            ...(approvedKeywords?.length ? { keywords: approvedKeywords } : {}),
            ...(productName ? { product_name: productName.trim() } : {}),
            ...(competitors
              ? {
                  competitors: competitors
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }
              : {}),
          },
        },
      };
      const response = await fetch(getApiUrl("agent-runtime/turn"), {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await readError(response);
        throw new Error(error || "Agent turn failed");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const parsed = parseSseChunk(chunk) as AgentTurnEvent | null;
          if (!parsed) continue;
          const event = normalizeTurnEvent(parsed);
          const eventConversationId =
            event.conversation_id ||
            (typeof event.data?.conversation_id === "string"
              ? event.data.conversation_id
              : null);
          if (eventConversationId) {
            setConversationId(eventConversationId);
          }
          if (event.mode) setRuntimeMode(event.mode);

          if (event.type === "plan.created") {
            const plan = event.data?.plan as ResearchPlan | undefined;
            if (!plan) continue;
            setResearchPlan(plan);
            pushWorkspaceEvent({
              type: "tool_completed",
              label: `Plan ready: ${plan.sources.length} source(s)`,
              detail: plan.sources.map((s) => `${s.source}: "${s.query}"`).join(", "),
              count: plan.sources.length,
            });
            setMessages((current) => [
              ...current,
              {
                id: createClientId(),
                role: "assistant",
                content: `Here is my research plan for: "${message}"`,
                researchPlan: plan,
              },
            ]);
            setStreamStatus(null);
            setRuntimeMode("awaiting_approval");
            continue;
          }

          if (event.type === "plan.rejected") {
            setResearchPlan(null);
            if (approvedPlan) {
              setMessagePlanStatus(approvedPlan.plan_id, "rejected");
            }
            setRuntimeMode("chat");
            setMessages((current) => [
              ...current,
              {
                id: createClientId(),
                role: "assistant",
                content: "Plan cancelled. No search tools were executed.",
              },
            ]);
            setStreamStatus(null);
            continue;
          }

          if (event.type === "answer.completed") {
            const data = event.data?.response as AgentRunResponse | undefined;
            if (!data) continue;
            setLiveAgentSignals(data.signals);
            if (approvedPlan) {
              setMessagePlanStatus(approvedPlan.plan_id, "complete");
              setResearchPlan({ ...approvedPlan, status: "complete" });
            }
            setMessages((current) => [
              ...current,
              {
                id: createClientId(),
                role: "assistant",
                content: buildExecutionSummary(data),
                data,
                resultTitle: approvedPlan?.title || titleFromPrompt(initialPrompt || message),
                reasoning: data.reasoning || undefined,
              },
            ]);
            const visibleResultCount = resultDisplayCount(data);
            pushWorkspaceEvent({
              type: "completed",
              label: `Run completed with ${visibleResultCount} result${
                visibleResultCount === 1 ? "" : "s"
              }`,
              count: visibleResultCount,
            });
            setStreamStatus(null);
            setRuntimeMode("chat");
            continue;
          }

          if (event.type === "turn.failed") {
            const activityTrace = event.data?.activity_trace;
            const failureMessage = event.message || "Agent turn failed.";
            pushWorkspaceEvent({
              type: "error",
              label: failureMessage,
            });
            setMessages((current) => [
              ...current,
              {
                id: createClientId(),
                role: "assistant",
                content: failureMessage,
                activityTrace: Array.isArray(activityTrace)
                  ? activityTrace
                  : undefined,
              },
            ]);
            toast.error("Agent turn failed", { description: failureMessage });
            setStreamStatus(null);
            setRuntimeMode("chat");
            continue;
          }

          handleAgentStreamEvent(turnEventToStreamEvent(event));
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        if (approvedPlan) setResearchPlan({ ...approvedPlan, status: "draft" });
        if (approvedPlan) setMessagePlanStatus(approvedPlan.plan_id, "draft");
        setRuntimeMode(approvedPlan ? "awaiting_approval" : "chat");
        setMessages((current) => [
          ...current,
          {
            id: createClientId(),
            role: "assistant",
            content:
              "I stopped the current research turn. You can adjust the prompt or sources and run it again.",
          },
        ]);
        return;
      }

      const messageText =
        error instanceof Error ? error.message : "Something went wrong";
      if (approvedPlan) setResearchPlan({ ...approvedPlan, status: "draft" });
      if (approvedPlan) setMessagePlanStatus(approvedPlan.plan_id, "draft");
      setRuntimeMode(approvedPlan ? "awaiting_approval" : "chat");
      toast.error("Agent turn failed", { description: messageText });
      pushWorkspaceEvent({
        type: "error",
        label: messageText,
      });
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "assistant",
          content: `I could not complete that turn. ${messageText}`,
        },
      ]);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsSearching(false);
      setStreamStatus(null);
      if (approvedPlan || approvedKeywords?.length) {
        setResearchPlan(null);
      }
    }
  };

  const previewMentionKeywords = async (message: string, token: string) => {
    setIsSearching(true);
    setStreamStatus("Planning mention keywords...");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    pushWorkspaceEvent({
      type: "thinking",
      label: "Planning mention keywords",
      detail: "Extracting exact keywords and optional related terms.",
    });

    try {
      const response = await fetch(getApiUrl("agent-runtime/mention-keywords/plan"), {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          suggest_keywords: aiExpandKeywords,
        }),
      });

      if (!response.ok) {
        const error = await readError(response);
        throw new Error(error || "Keyword planning failed");
      }

      const keywordPlan = await response.json();
      pushWorkspaceEvent({
        type: "tool_completed",
        label: "Keyword plan ready",
        detail: `${keywordPlan.extracted_keywords?.length || 0} extracted and ${
          keywordPlan.suggested_keywords?.length || 0
        } suggested keywords.`,
      });
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "assistant",
          content:
            "Confirm the mention keywords before I start tracking. I selected the exact keywords from your prompt and added optional suggestions for you to approve.",
          keywordPlan,
        },
      ]);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((current) => [
          ...current,
          {
            id: createClientId(),
            role: "assistant",
            content:
              "I stopped the keyword planning step. You can adjust the prompt or sources and try again.",
          },
        ]);
        return;
      }

      const messageText =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Keyword planning failed", { description: messageText });
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "assistant",
          content: `I could not plan mention keywords. ${messageText}`,
        },
      ]);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsSearching(false);
      setStreamStatus(null);
    }
  };

  const submitPrompt = async (value: string, event?: FormEvent) => {
    event?.preventDefault();
    const trimmedPrompt = value.trim();
    if (!trimmedPrompt || !canSubmitPrompt(trimmedPrompt)) return false;

    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first", {
        description: "A login token is required to run the agent.",
      });
      return false;
    }

    if (!initialPrompt) {
      setInitialPrompt(trimmedPrompt);
      setSessionTitle(titleFromPrompt(trimmedPrompt));
    }
    setPrompt("");

    await sendTurn({
      message: trimmedPrompt,
      token,
      addUserMessage: true,
    });
    return true;
  };

  const confirmResearchPlan = async (message: string, plan: ResearchPlan) => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first");
      return;
    }

    setResearchPlan({ ...plan, status: "running" });
    setMessagePlanStatus(plan.plan_id, "running");

    await sendTurn({
      message,
      token,
      approvedPlan: plan,
      addUserMessage: false,
    });
  };

  const rejectResearchPlan = async (message: string, plan: ResearchPlan) => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first");
      return;
    }

    await sendTurn({
      message,
      token,
      approvedPlan: plan,
      planDecision: "reject",
      addUserMessage: false,
    });
  };

  const openResearchPlan = useCallback((plan: ResearchPlan) => {
    setResearchPlan(plan);
  }, []);

  const submitSearch = async (event?: FormEvent) => {
    return submitPrompt(prompt, event);
  };

  const confirmMentionKeywords = async (
    message: string,
    keywords: string[]
  ) => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first", {
        description: "A login token is required to run mention tracking.",
      });
      return;
    }
    if (!keywords.length) {
      toast.error("Select at least one keyword");
      return;
    }
    await sendTurn({
      message,
      token,
      approvedKeywords: keywords,
      addUserMessage: false,
    });
  };

  const latestData = useMemo(() => {
    return [...messages]
      .reverse()
      .find(
        (message): message is Extract<ChatMessage, { role: "assistant" }> & {
          data: AgentRunResponse;
        } => message.role === "assistant" && Boolean(message.data)
      )?.data;
  }, [messages]);

  const workspaceData = useMemo(() => {
    if (latestData) return latestData;
    if (liveAgentSignals.length) {
      return {
        answer: "",
        skill_used: "mention-tracking",
        tool_calls: [],
        signals: liveAgentSignals,
      };
    }
    return undefined;
  }, [latestData, liveAgentSignals]);

  const hasSessionActivity = useMemo(() => {
    return (
      messages.some((message) => message.id !== "welcome") ||
      workspaceEvents.length > 0 ||
      liveAgentSignals.length > 0
    );
  }, [liveAgentSignals.length, messages, workspaceEvents.length]);

  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    if (!hasSessionActivity) return;

    const payload: PersistedAgentChatSession = {
      version: 4,
      sessionId,
      conversationId,
      visibleArtifactId,
      sessionTitle: sessionTitle || titleFromPrompt(initialPrompt),
      initialPrompt,
      agentMode,
      runtimeMode,
      aiExpandKeywords,
      productName,
      competitors,
      messages,
      workspaceEvents,
      liveAgentSignals,
      researchPlan,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(persistKey, JSON.stringify(payload));
  }, [
    agentMode,
    conversationId,
    visibleArtifactId,
    runtimeMode,
    aiExpandKeywords,
    competitors,
    hasSessionActivity,
    initialPrompt,
    liveAgentSignals,
    messages,
    persistKey,
    productName,
    researchPlan,
    sessionId,
    sessionTitle,
    workspaceEvents,
  ]);

  const resetSession = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (persistKey && typeof window !== "undefined") {
      window.localStorage.removeItem(persistKey);
    }
    setSessionId(createClientId());
    setConversationId(null);
    setVisibleArtifactId(null);
    setSelectedArtifactRowKey(null);
    setSessionTitle("");
    setInitialPrompt("");
    setPrompt("");
    setWorkspaceEvents([]);
    setLiveAgentSignals([]);
    setLiveReasoning("");
    setResearchPlan(null);
    setRuntimeMode("chat");
    setMessages(includeWelcomeMessage ? [welcomeMessage] : []);
    setIsSearching(false);
    setStreamStatus(null);
    setIsRestoringConversation(false);
    setHasRestoredConversation(true);
  }, [includeWelcomeMessage, persistKey]);

  return {
    sessionId,
    conversationId,
    visibleArtifactId,
    setVisibleArtifactId,
    selectedArtifactRowKey,
    setSelectedArtifactRowKey,
    sessionTitle,
    initialPrompt,
    prompt,
    setPrompt,
    agentMode,
    setAgentMode,
    runtimeMode,
    aiExpandKeywords,
    setAiExpandKeywords,
    productName,
    setProductName,
    competitors,
    setCompetitors,
    showSettings,
    setShowSettings,
    isSearching,
    isRestoringConversation,
    streamStatus,
    workspaceEvents,
    messages,
    canSearch,
    hasSessionActivity,
    submitPrompt,
    submitSearch,
    stopSearch,
    resetSession,
    selectConversation,
    confirmMentionKeywords,
    confirmResearchPlan,
    rejectResearchPlan,
    openResearchPlan,
    workspaceData,
    liveAgentSignals,
    liveReasoning,
    researchPlan,
  };
}

function buildExecutionSummary(data: AgentRunResponse) {
  return data.chat_summary || "";
}

export type AgentChatState = ReturnType<typeof useAgentChat>;
