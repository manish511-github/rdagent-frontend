"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { getApiUrl } from "@/lib/config";
import {
  mergeMentionSignal,
  normalizeStreamEvent,
  parseSseChunk,
  readError,
} from "@/lib/mention-tracking/stream-utils";
import {
  type AgentMode,
  type AgentRunResponse,
  type AgentStreamEvent,
  type AgentTurnEvent,
  type AgentTurnRequest,
  type ChatMessage,
  type MentionWorkspaceEvent,
  type ResearchPlan,
} from "@/lib/mention-tracking/types";

type UseMentionTrackingChatOptions = {
  includeWelcomeMessage?: boolean;
  persistKey?: string;
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Tell me what brand, product, competitor, or keyword you want to track. I can monitor mentions across Reddit, X/Twitter, Hacker News, YouTube, GitHub, LinkedIn, and newsletters.",
};

type PersistedMentionTrackingSession = {
  version: 2;
  sessionId: string;
  sessionTitle: string;
  initialPrompt: string;
  agentMode: AgentMode;
  aiExpandKeywords: boolean;
  productName: string;
  competitors: string;
  messages: ChatMessage[];
  workspaceEvents: MentionWorkspaceEvent[];
  liveMentionSignals: AgentRunResponse["signals"];
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
  if (!compact) return "New mention tracker";
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
): PersistedMentionTrackingSession | null {
  if (!persistKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMentionTrackingSession;
    return parsed.version === 2 ? parsed : null;
  } catch {
    return null;
  }
}

export function useMentionTrackingChat({
  includeWelcomeMessage = true,
  persistKey,
}: UseMentionTrackingChatOptions = {}) {
  const persistedSession = useMemo(
    () => readPersistedSession(persistKey),
    [persistKey]
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const [sessionId, setSessionId] = useState(
    () => persistedSession?.sessionId || createClientId()
  );
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
    MentionWorkspaceEvent[]
  >(() => persistedSession?.workspaceEvents || []);
  const [liveMentionSignals, setLiveMentionSignals] = useState<
    AgentRunResponse["signals"]
  >(() => persistedSession?.liveMentionSignals || []);
  const [liveReasoning, setLiveReasoning] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    persistedSession?.messages ||
    (includeWelcomeMessage ? [welcomeMessage] : [])
  );
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(
    () => persistedSession?.researchPlan || null
  );

  const canSubmitPrompt = (value: string) =>
    value.trim().length >= 8 && !isSearching;

  const canSearch = canSubmitPrompt(prompt);

  const pushWorkspaceEvent = useCallback((
    event: Omit<MentionWorkspaceEvent, "id" | "createdAt">
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

      if (event.type === "tool_completed" && event.platform) {
        const rest = current.filter(
          (item) =>
            !(
              item.type === "tool_started" &&
              item.platform === event.platform
            )
        );
        return [
          ...rest,
          {
            ...event,
            id: createClientId(),
            createdAt: Date.now(),
          },
        ].slice(-40);
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

  const handleMentionStreamEvent = useCallback((event: AgentStreamEvent) => {
    if (event.type === "mention_found" && event.mention) {
      setLiveMentionSignals((current) =>
        mergeMentionSignal(current, event.mention as AgentRunResponse["signals"][number])
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

  const sendTurn = async ({
    message,
    token,
    approvedPlan,
    approvedKeywords,
    addUserMessage,
  }: {
    message: string;
    token: string;
    approvedPlan?: ResearchPlan;
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

    setIsSearching(true);
    setStreamStatus(
      approvedKeywords?.length
        ? "Preparing mention tracking..."
        : approvedPlan
          ? "Preparing approved research..."
          : "Planning research..."
    );
    setLiveReasoning("");
    setLiveMentionSignals([]);
    if (!approvedPlan) {
      setResearchPlan(null);
    }
    setWorkspaceEvents([
      {
        id: createClientId(),
        type: "thinking",
        label: approvedKeywords?.length
          ? "Preparing mention tracking"
          : approvedPlan
          ? "Preparing approved research"
          : "Planning research strategy",
        detail: approvedKeywords?.length
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
        ...(approvedPlan ? { approved_plan: approvedPlan } : {}),
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
            continue;
          }

          if (event.type === "answer.completed") {
            const data = event.data?.response as AgentRunResponse | undefined;
            if (!data) continue;
            setLiveMentionSignals(data.signals);
            setMessages((current) => [
              ...current,
              {
                id: createClientId(),
                role: "assistant",
                content: data.answer,
                data,
                reasoning: data.reasoning || undefined,
              },
            ]);
            pushWorkspaceEvent({
              type: "completed",
              label: `Run completed with ${data.signals.length} result${
                data.signals.length === 1 ? "" : "s"
              }`,
              count: data.signals.length,
            });
            setStreamStatus(null);
            continue;
          }

          if (event.type === "turn.failed") {
            throw new Error(event.message || "Agent turn failed");
          }

          handleMentionStreamEvent(turnEventToStreamEvent(event));
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        if (approvedPlan) setResearchPlan({ ...approvedPlan, status: "draft" });
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

    await sendTurn({
      message,
      token,
      approvedPlan: plan,
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
    if (liveMentionSignals.length) {
      return {
        answer: "",
        skill_used: "mention-tracking",
        tool_calls: [],
        signals: liveMentionSignals,
      };
    }
    return undefined;
  }, [latestData, liveMentionSignals]);

  const hasSessionActivity = useMemo(() => {
    return (
      messages.some((message) => message.id !== "welcome") ||
      workspaceEvents.length > 0 ||
      liveMentionSignals.length > 0
    );
  }, [liveMentionSignals.length, messages, workspaceEvents.length]);

  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    if (!hasSessionActivity) return;

    const payload: PersistedMentionTrackingSession = {
      version: 2,
      sessionId,
      sessionTitle: sessionTitle || titleFromPrompt(initialPrompt),
      initialPrompt,
      agentMode,
      aiExpandKeywords,
      productName,
      competitors,
      messages,
      workspaceEvents,
      liveMentionSignals,
      researchPlan,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(persistKey, JSON.stringify(payload));
  }, [
    agentMode,
    aiExpandKeywords,
    competitors,
    hasSessionActivity,
    initialPrompt,
    liveMentionSignals,
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
    setSessionTitle("");
    setInitialPrompt("");
    setPrompt("");
    setWorkspaceEvents([]);
    setLiveMentionSignals([]);
    setLiveReasoning("");
    setResearchPlan(null);
    setMessages(includeWelcomeMessage ? [welcomeMessage] : []);
    setIsSearching(false);
    setStreamStatus(null);
  }, [includeWelcomeMessage, persistKey]);

  return {
    sessionId,
    sessionTitle,
    initialPrompt,
    prompt,
    setPrompt,
    agentMode,
    setAgentMode,
    aiExpandKeywords,
    setAiExpandKeywords,
    productName,
    setProductName,
    competitors,
    setCompetitors,
    showSettings,
    setShowSettings,
    isSearching,
    streamStatus,
    workspaceEvents,
    messages,
    canSearch,
    hasSessionActivity,
    submitPrompt,
    submitSearch,
    stopSearch,
    resetSession,
    confirmMentionKeywords,
    confirmResearchPlan,
    openResearchPlan,
    workspaceData,
    liveMentionSignals,
    liveReasoning,
    researchPlan,
  };
}

export type MentionTrackingChatState = ReturnType<typeof useMentionTrackingChat>;
