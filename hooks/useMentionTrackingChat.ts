"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { getApiUrl } from "@/lib/config";
import { inferSkillFromPrompt } from "@/lib/mention-tracking/skill-utils";
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
  type ChatMessage,
  type MentionWorkspaceEvent,
  SKILL_BY_MODE,
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
  version: 1;
  sessionId: string;
  sessionTitle: string;
  initialPrompt: string;
  agentMode: AgentMode;
  aiExpandKeywords: boolean;
  productName: string;
  competitors: string;
  selectedPlatforms: string[];
  messages: ChatMessage[];
  workspaceEvents: MentionWorkspaceEvent[];
  liveMentionSignals: AgentRunResponse["signals"];
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

function readPersistedSession(
  persistKey?: string
): PersistedMentionTrackingSession | null {
  if (!persistKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMentionTrackingSession;
    return parsed.version === 1 ? parsed : null;
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    () =>
      persistedSession?.selectedPlatforms || [
        "x",
        "reddit",
        "hackernews",
        "youtube",
        "github",
        "linkedin",
      ]
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    persistedSession?.messages ||
    (includeWelcomeMessage ? [welcomeMessage] : [])
  );

  const canSubmitPrompt = (value: string) =>
    value.trim().length >= 8 && !isSearching;

  const canSearch = canSubmitPrompt(prompt);

  const resolveSkill = (value: string) =>
    agentMode === "auto" ? inferSkillFromPrompt(value) : SKILL_BY_MODE[agentMode];

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

  const runAgent = async ({
    message,
    skill,
    token,
    keywords,
    addUserMessage,
  }: {
    message: string;
    skill: string;
    token: string;
    keywords?: string[];
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

    const isMentionRun = skill === "mention-tracking";
    setIsSearching(true);
    setStreamStatus("Starting mention tracking...");
    setLiveReasoning("");
    setWorkspaceEvents([
      {
        id: createClientId(),
        type: "thinking",
        label: isMentionRun
          ? "Preparing mention tracking"
          : "Planning mention search",
        detail: "Extracting keywords and search plan.",
        createdAt: Date.now(),
      },
    ]);
    if (isMentionRun) {
      setLiveMentionSignals([]);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(getApiUrl("agent-runtime/stream"), {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          skill,
          tool_options: {
            mention_tracking: {
              ai_expand_keywords: false,
              platforms: selectedPlatforms,
              ...(keywords?.length ? { keywords } : {}),
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
        }),
      });

      if (!response.ok) {
        const error = await readError(response);
        throw new Error(error || "Mention tracking run failed");
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
          const event = parseSseChunk(chunk);
          if (!event) continue;

          if (event.status === "thinking" && event.message) {
            setLiveReasoning((current) => current + event.message);
          } else {
            handleMentionStreamEvent(event);
          }

          if (event.status === "complete" && event.data) {
            const data = event.data as AgentRunResponse;
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
              label: `Run completed with ${data.signals.length} mention${
                data.signals.length === 1 ? "" : "s"
              }`,
              count: data.signals.length,
            });
            setStreamStatus(null);
          } else if (event.status === "error") {
            throw new Error(event.message || "Agent runtime failed");
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((current) => [
          ...current,
          {
            id: createClientId(),
            role: "assistant",
            content: "I stopped the current mention run. You can adjust the prompt or sources and run it again.",
          },
        ]);
        return;
      }

      const messageText =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Mention tracking failed", { description: messageText });
      pushWorkspaceEvent({
        type: "error",
        label: messageText,
      });
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "assistant",
          content: `I could not complete that run. ${messageText}`,
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
        description: "A login token is required to run mention tracking.",
      });
      return false;
    }

    const skill = resolveSkill(trimmedPrompt);
    if (!initialPrompt) {
      setInitialPrompt(trimmedPrompt);
      setSessionTitle(titleFromPrompt(trimmedPrompt));
    }
    setMessages((current) => [
      ...current,
      {
        id: createClientId(),
        role: "user",
        content: trimmedPrompt,
      },
    ]);
    setPrompt("");

    if (skill === "mention-tracking") {
      await previewMentionKeywords(trimmedPrompt, token);
      return true;
    }

    await runAgent({
      message: trimmedPrompt,
      skill,
      token,
      addUserMessage: false,
    });
    return true;
  };

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
    await runAgent({
      message,
      skill: "mention-tracking",
      token,
      keywords,
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
      version: 1,
      sessionId,
      sessionTitle: sessionTitle || titleFromPrompt(initialPrompt),
      initialPrompt,
      agentMode,
      aiExpandKeywords,
      productName,
      competitors,
      selectedPlatforms,
      messages,
      workspaceEvents,
      liveMentionSignals,
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
    selectedPlatforms,
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
    selectedPlatforms,
    setSelectedPlatforms,
    messages,
    canSearch,
    hasSessionActivity,
    submitPrompt,
    submitSearch,
    stopSearch,
    resetSession,
    confirmMentionKeywords,
    workspaceData,
    liveMentionSignals,
    liveReasoning,
  };
}

export type MentionTrackingChatState = ReturnType<typeof useMentionTrackingChat>;
