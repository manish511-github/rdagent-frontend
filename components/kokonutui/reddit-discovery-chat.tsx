"use client";

import { FormEvent, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  ArrowUp,
  ArrowUpDown,
  Bot,
  Check,
  ExternalLink,
  Filter,
  Loader2,
  Plus,
  SlidersHorizontal,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { getApiUrl } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AgentSignal = {
  platform?: string;
  source?: string;
  title?: string;
  url?: string;
  snippet?: string;
  text?: string;
  author?: string | null;
  author_name?: string | null;
  subreddit?: string | null;
  subx?: string | null;
  post_id?: string | null;
  overall_score?: number;
  category?: string;
  reason?: string;
  suggested_action?: string;
  query?: string;
  published_at?: string | null;
  created_at?: string | null;
  matched_terms?: string[];
  matched_keywords?: string[];
  sentiment?: string;
  signal_strength?: string;
  noise_type?: string | null;
  is_actionable?: boolean;
  metadata?: Record<string, unknown>;
  score?: number;
  relevance?: number;
  time?: number;
  relevant_comment_ids?: number[];
};

type AgentToolCall = {
  name: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
};

type AgentRunResponse = {
  answer: string;
  skill_used: string;
  tool_calls: AgentToolCall[];
  signals: AgentSignal[];
};

type MentionKeywordPlan = {
  message: string;
  extracted_keywords: string[];
  suggested_keywords: string[];
};

type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      data?: AgentRunResponse;
      keywordPlan?: MentionKeywordPlan;
    };

type AgentMode = "auto" | "reddit" | "hackernews" | "x" | "mention";
type QuickFilter =
  | "all"
  | "comments"
  | "hide_promo"
  | "actionable"
  | "market"
  | "news"
  | "promo"
  | "low_relevance";

const QUICK_FILTERS: Array<{ value: QuickFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "comments", label: "Comments only" },
  { value: "hide_promo", label: "Hide promo" },
  { value: "actionable", label: "Actionable" },
  { value: "market", label: "Market" },
  { value: "news", label: "News" },
  { value: "promo", label: "Promo" },
  { value: "low_relevance", label: "Low relevance" },
];

const EXAMPLE_PROMPTS = [
  "Track Apollo complaints from the last 30 days",
  "Track invoice automation mentions from the last 60 days",
  "Find Reddit posts about customer support automation for SaaS teams",
  "Find HN discussions about observability tools for startups",
];

const SKILL_BY_MODE: Record<Exclude<AgentMode, "auto">, string> = {
  reddit: "reddit-lead-discovery",
  hackernews: "hackernews-lead-discovery",
  x: "x-lead-discovery",
  mention: "mention-tracking",
};

export default function RedditDiscoveryChat() {
  const [prompt, setPrompt] = useState("");
  const [agentMode, setAgentMode] = useState<AgentMode>("auto");
  const [aiExpandKeywords, setAiExpandKeywords] = useState(true);
  const [productName, setProductName] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "x",
    "reddit",
    "hackernews",
    "youtube",
    "github",
    "linkedin",
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Tell me what audience, pain, competitor, or market signal you want to find. I can search Reddit, X/Twitter, or Hacker News through the agent runtime.",
    },
  ]);

  const canSearch = prompt.trim().length >= 8 && !isSearching;

  const resolveSkill = (value: string) =>
    agentMode === "auto" ? inferSkillFromPrompt(value) : SKILL_BY_MODE[agentMode];

  const submitSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !canSearch) return;

    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first", {
        description: "A login token is required to run the agent.",
      });
      return;
    }

    const skill = resolveSkill(trimmedPrompt);
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedPrompt,
      },
    ]);
    setPrompt("");

    if (skill === "mention-tracking") {
      await previewMentionKeywords(trimmedPrompt, token);
      return;
    }

    await runAgent({
      message: trimmedPrompt,
      skill,
      token,
      addUserMessage: false,
    });
  };

  const previewMentionKeywords = async (message: string, token: string) => {
    setIsSearching(true);
    setStreamStatus("Planning mention keywords...");

    try {
      const response = await fetch(getApiUrl("agent-runtime/mention-keywords/plan"), {
        method: "POST",
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

      const keywordPlan = (await response.json()) as MentionKeywordPlan;
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Confirm the mention keywords before I start tracking. I selected the exact keywords from your prompt and added optional suggestions for you to approve.",
          keywordPlan,
        },
      ]);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Keyword planning failed", { description: messageText });
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I could not plan mention keywords. ${messageText}`,
        },
      ]);
    } finally {
      setIsSearching(false);
      setStreamStatus(null);
    }
  };

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
          id: crypto.randomUUID(),
          role: "user",
          content: message,
        },
      ]);
    }

    setIsSearching(true);
    setStreamStatus("Starting agent...");

    try {
      const response = await fetch(getApiUrl("agent-runtime/stream"), {
        method: "POST",
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
                ? { competitors: competitors.split(",").map((s) => s.trim()).filter(Boolean) }
                : {}),
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await readError(response);
        throw new Error(error || "Agent run failed");
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

          if (event.status === "complete" && event.data) {
            const data = event.data as AgentRunResponse;
            setMessages((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.answer,
                data,
              },
            ]);
            setStreamStatus(null);
          } else if (event.status === "error") {
            throw new Error(event.message || "Agent runtime failed");
          } else if (event.message) {
            setStreamStatus(event.message);
          }
        }
      }
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Agent failed", { description: messageText });
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I could not complete that run. ${messageText}`,
        },
      ]);
    } finally {
      setIsSearching(false);
      setStreamStatus(null);
    }
  };

  const confirmMentionKeywords = async (message: string, keywords: string[]) => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please sign in first", {
        description: "A login token is required to run the agent.",
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
      .find(isAssistantMessageWithData)?.data;
  }, [messages]);

  return (
    <div className="flex h-full min-h-[calc(100vh-2.5rem)] flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Bot className="size-4" />
              </div>
              <h1 className="text-xl font-semibold">Agent Chat</h1>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ask for lead research, customer pain, competitor complaints, or
              market signals across available agent tools.
            </p>
          </div>

          {latestData && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {latestData.skill_used.replaceAll("-", " ")}
              </Badge>
              {latestData.tool_calls.map((call) => (
                <Badge key={call.name} variant="outline">
                  {call.name.replaceAll("_", " ")}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSearching={isSearching}
              onConfirmKeywordPlan={confirmMentionKeywords}
            />
          ))}

          {isSearching && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Loader2 className="size-4 animate-spin" />
                  {streamStatus || "Planning tool call and running agent..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <form onSubmit={submitSearch} className="mx-auto max-w-5xl space-y-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
              >
                {example}
              </button>
            ))}
          </div>

          {showSettings && (
            <div className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <label className="mb-2 block text-xs text-zinc-500 dark:text-zinc-400">
                  Agent tool
                </label>
                <select
                  value={agentMode}
                  onChange={(event) => setAgentMode(event.target.value as AgentMode)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="auto">Auto select from prompt</option>
                  <option value="reddit">Reddit discovery</option>
                  <option value="hackernews">Hacker News discovery</option>
                  <option value="x">X / Twitter discovery</option>
                  <option value="mention">Mention tracking</option>
                </select>
              </div>

              {(agentMode === "mention" || agentMode === "auto") && (
                <>
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500 dark:text-zinc-400">
                      Platforms to track
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "x", label: "X / Twitter" },
                        { id: "reddit", label: "Reddit" },
                        { id: "hackernews", label: "Hacker News" },
                        { id: "youtube", label: "YouTube" },
                        { id: "github", label: "GitHub" },
                        { id: "linkedin", label: "LinkedIn" },
                        { id: "devto", label: "Dev.to" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlatforms((prev) =>
                              prev.includes(p.id)
                                ? prev.filter((id) => id !== p.id)
                                : [...prev, p.id]
                            );
                          }}
                          className={`rounded-full px-3 py-1 text-xs border ${
                            selectedPlatforms.includes(p.id)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-zinc-500 dark:text-zinc-400">
                      Product Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Zooptics"
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500 dark:text-zinc-400">
                      Competitors (Optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      placeholder="e.g. HubSpot, Apollo"
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <label className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={aiExpandKeywords}
              onChange={(event) => setAiExpandKeywords(event.target.checked)}
              className="mt-0.5 size-4 rounded border-zinc-300 text-emerald-600"
            />
            <span>
              <span className="block font-medium">Suggest extra mention keywords</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                You approve the final keyword list before tracking starts.
              </span>
            </span>
          </label>

          <div className="flex items-end gap-2">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Find X posts where founders complain Apollo is not working for cold outreach"
              className="min-h-[72px] resize-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowSettings((value) => !value)}
              aria-label="Toggle agent settings"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
            <Button type="submit" size="icon" disabled={!canSearch}>
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isSearching,
  onConfirmKeywordPlan,
}: {
  message: ChatMessage;
  isSearching: boolean;
  onConfirmKeywordPlan: (message: string, keywords: string[]) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && <Avatar role="assistant" />}
      <div
        className={`max-w-[min(860px,90%)] rounded-md border px-4 py-3 shadow-sm ${
          isUser
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {message.role === "assistant" && message.keywordPlan && (
          <MentionKeywordConfirmation
            plan={message.keywordPlan}
            disabled={isSearching}
            onConfirm={onConfirmKeywordPlan}
          />
        )}
        {message.role === "assistant" && message.data && (
          <AgentResults data={message.data} />
        )}
      </div>
      {isUser && <Avatar role="user" />}
    </div>
  );
}

function MentionKeywordConfirmation({
  plan,
  disabled,
  onConfirm,
}: {
  plan: MentionKeywordPlan;
  disabled: boolean;
  onConfirm: (message: string, keywords: string[]) => void;
}) {
  const initialKeywords = useMemo(
    () => normalizeKeywords(plan.extracted_keywords),
    [plan.extracted_keywords]
  );
  const suggestedKeywords = useMemo(
    () =>
      normalizeKeywords(plan.suggested_keywords).filter(
        (keyword) =>
          !initialKeywords.some(
            (initialKeyword) => initialKeyword.toLowerCase() === keyword.toLowerCase()
          )
      ),
    [initialKeywords, plan.suggested_keywords]
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(initialKeywords);
  const [customKeyword, setCustomKeyword] = useState("");

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((current) => {
      const exists = current.some((item) => item.toLowerCase() === keyword.toLowerCase());
      if (exists) {
        return current.filter((item) => item.toLowerCase() !== keyword.toLowerCase());
      }
      return [...current, keyword];
    });
  };

  const addCustomKeyword = () => {
    const keyword = customKeyword.trim();
    if (!keyword) return;
    setSelectedKeywords((current) => normalizeKeywords([...current, keyword]));
    setCustomKeyword("");
  };

  const selectableKeywords = [
    ...initialKeywords.map((keyword) => ({ keyword, source: "From prompt" })),
    ...suggestedKeywords.map((keyword) => ({ keyword, source: "Suggested" })),
  ];

  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Final keywords
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Exact prompt keywords are selected. Add suggestions only if they fit.
          </div>
        </div>
        <Badge variant="outline">{selectedKeywords.length} selected</Badge>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {selectableKeywords.map(({ keyword, source }) => {
          const selected = selectedKeywords.some(
            (item) => item.toLowerCase() === keyword.toLowerCase()
          );
          return (
            <label
              key={`${source}-${keyword}`}
              className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                selected
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-800"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => toggleKeyword(keyword)}
                className="mt-0.5 size-4 rounded border-zinc-300 text-emerald-600"
              />
              <span className="min-w-0">
                <span className="block break-words font-medium">{keyword}</span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  {source}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={customKeyword}
          onChange={(event) => setCustomKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomKeyword();
            }
          }}
          placeholder="Add a keyword or exact phrase"
          className="min-h-10 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCustomKeyword}
          disabled={disabled || !customKeyword.trim()}
        >
          <Plus className="mr-2 size-4" />
          Add
        </Button>
      </div>

      {selectedKeywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {selectedKeywords.map((keyword) => (
            <Badge key={keyword} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          onClick={() => onConfirm(plan.message, selectedKeywords)}
          disabled={disabled || selectedKeywords.length === 0}
        >
          {disabled ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Track mentions
        </Button>
      </div>
    </div>
  );
}

function AgentResults({ data }: { data: AgentRunResponse }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sortOrder, setSortOrder] = useState<string>("score_desc");

  const queries = useMemo(() => extractQueries(data), [data]);
  const isMentionTracking = isMentionTrackingResult(data);
  const mentionCounts = useMemo(() => countMentionBuckets(data.signals), [data.signals]);
  const categories = useMemo(() => {
    const cats = new Set(data.signals.map((signal) => signal.category).filter(Boolean));
    return ["all", ...Array.from(cats)] as string[];
  }, [data.signals]);

  const filteredAndSorted = useMemo(() => {
    let filtered = data.signals;
    if (isMentionTracking) {
      filtered = applyQuickFilter(filtered, quickFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((signal) => signal.category === categoryFilter);
    }
    const sorted = [...filtered];
    switch (sortOrder) {
      case "score_asc":
        sorted.sort((a, b) => signalScore(a) - signalScore(b));
        break;
      case "newest":
        sorted.sort((a, b) => signalTime(b) - signalTime(a));
        break;
      case "oldest":
        sorted.sort((a, b) => signalTime(a) - signalTime(b));
        break;
      default:
        sorted.sort((a, b) => signalScore(b) - signalScore(a));
    }
    return sorted;
  }, [data.signals, categoryFilter, isMentionTracking, quickFilter, sortOrder]);

  if (!data.signals.length && !queries.length) return null;

  return (
    <div className="mt-4 space-y-4">
      {queries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {queries.slice(0, 12).map((query) => (
            <Badge key={query} variant="outline" className="max-w-full truncate">
              <Sparkles className="mr-1 size-3" />
              {query}
            </Badge>
          ))}
        </div>
      )}

      {data.signals.length > 0 && (
        <>
          {isMentionTracking && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <MentionCount label="Total" value={mentionCounts.total} />
                <MentionCount label="Actionable" value={mentionCounts.actionable} />
                <MentionCount label="Market" value={mentionCounts.market} />
                <MentionCount label="Comments" value={mentionCounts.comments} />
                <MentionCount label="News" value={mentionCounts.news} />
                <MentionCount label="Promo" value={mentionCounts.promo} />
                <MentionCount label="Low relevance" value={mentionCounts.lowRelevance} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setQuickFilter(filter.value)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      quickFilter === filter.value
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 1 && (
              <div className="flex items-center gap-1">
                <Filter className="size-3 text-zinc-400" />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="size-3 text-zinc-400" />
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="score_desc">Score: High to Low</option>
                <option value="score_asc">Score: Low to High</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <span className="text-xs text-zinc-400">
              {filteredAndSorted.length} of {data.signals.length} results
            </span>
          </div>

          <div className="grid gap-3">
            {filteredAndSorted.map((signal, index) => (
              <SignalCard key={`${signal.url || signal.title || index}`} signal={signal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SignalCard({ signal }: { signal: AgentSignal }) {
  const score = signalScore(signal);
  const platform = signalPlatform(signal);
  const sourceType = signalSourceType(signal);
  const createdAt = signal.created_at || signal.published_at;
  const author = signal.author || signal.author_name || signal.subx;
  const body = signal.snippet || signal.text;
  const terms = [
    ...(signal.matched_terms || []),
    ...(signal.matched_keywords || []),
  ].filter((term, index, values) => {
    const clean = term.trim();
    return clean && !clean.startsWith("noise:") && values.indexOf(term) === index;
  });

  return (
    <article className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={scoreColor(score)}>{formatScore(score)}</Badge>
            <Badge variant="secondary">{platform}</Badge>
            {sourceType && (
              <Badge variant="outline">{sourceType.replaceAll("_", " ")}</Badge>
            )}
            {signal.category && (
              <Badge variant="outline">{signal.category.replaceAll("_", " ")}</Badge>
            )}
            {signal.is_actionable && <Badge variant="outline">actionable</Badge>}
            {signal.sentiment && (
              <Badge variant="outline">{signal.sentiment.replaceAll("_", " ")}</Badge>
            )}
            {signal.signal_strength && (
              <Badge variant="outline">{signal.signal_strength} strength</Badge>
            )}
            {signal.subreddit && <Badge variant="outline">r/{signal.subreddit}</Badge>}
            {author && <Badge variant="outline">@{author}</Badge>}
            {createdAt && (
              <Badge variant="outline">{formatDate(createdAt)}</Badge>
            )}
          </div>
          <h2 className="mt-3 text-base font-semibold leading-6">
            {signal.title || "Untitled result"}
          </h2>
        </div>
        {signal.url && (
          <a
            href={signal.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            aria-label="Open result"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>

      {body && (
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {body}
        </p>
      )}
      {terms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {terms.slice(0, 8).map((term) => (
            <span
              key={term}
              className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {term}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 grid gap-2 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {signal.reason && <p>{signal.reason}</p>}
        {signal.suggested_action && <p>{signal.suggested_action}</p>}
        {signal.noise_type && <p>Noise type: {signal.noise_type.replaceAll("_", " ")}</p>}
        {signal.relevant_comment_ids && signal.relevant_comment_ids.length > 0 && (
          <p>{signal.relevant_comment_ids.length} relevant comments matched.</p>
        )}
      </div>
    </article>
  );
}

function MentionCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-lg font-semibold leading-none text-zinc-900 dark:text-zinc-50">
        {value}
      </div>
    </div>
  );
}

function Avatar({ role }: { role: "assistant" | "user" }) {
  const Icon = role === "assistant" ? Bot : User;

  return (
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
        role === "assistant"
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
          : "bg-emerald-600 text-white"
      }`}
    >
      <Icon className="size-4" />
    </div>
  );
}

function inferSkillFromPrompt(prompt: string) {
  if (
    /\b(track|tracking|monitor|watch|mentions?|social listening|keyword tracking|brand monitoring)\b/i.test(
      prompt
    )
  ) {
    return "mention-tracking";
  }
  if (/\b(hacker news|hackernews|hn)\b/i.test(prompt)) {
    return "hackernews-lead-discovery";
  }
  if (/\b(twitter|x\.com|x)\b/i.test(prompt)) {
    return "x-lead-discovery";
  }
  return "reddit-lead-discovery";
}

function isAssistantMessageWithData(
  message: ChatMessage
): message is Extract<ChatMessage, { role: "assistant" }> & {
  data: AgentRunResponse;
} {
  return message.role === "assistant" && Boolean(message.data);
}

function isMentionTrackingResult(data: AgentRunResponse) {
  return (
    data.skill_used === "mention-tracking" ||
    data.tool_calls.some((call) => call.name === "mention_tracking")
  );
}

function applyQuickFilter(signals: AgentSignal[], filter: QuickFilter) {
  switch (filter) {
    case "comments":
      return signals.filter((signal) => signalSourceType(signal) === "comment");
    case "hide_promo":
      return signals.filter(
        (signal) =>
          signal.category !== "promo" &&
          !["promo", "explainer"].includes(signal.noise_type || "")
      );
    case "actionable":
      return signals.filter((signal) => signal.is_actionable);
    case "market":
      return signals.filter((signal) =>
        ["market_signal", "customer_praise"].includes(signal.category || "")
      );
    case "news":
      return signals.filter((signal) => signal.category === "news");
    case "promo":
      return signals.filter(
        (signal) => signal.category === "promo" || signal.noise_type === "promo"
      );
    case "low_relevance":
      return signals.filter((signal) =>
        ["low_relevance", "irrelevant"].includes(signal.category || "")
      );
    default:
      return signals;
  }
}

function countMentionBuckets(signals: AgentSignal[]) {
  return {
    total: signals.length,
    actionable: signals.filter((signal) => signal.is_actionable).length,
    market: signals.filter((signal) =>
      ["market_signal", "customer_praise"].includes(signal.category || "")
    ).length,
    comments: signals.filter((signal) => signalSourceType(signal) === "comment").length,
    news: signals.filter((signal) => signal.category === "news").length,
    promo: signals.filter(
      (signal) => signal.category === "promo" || signal.noise_type === "promo"
    ).length,
    lowRelevance: signals.filter((signal) =>
      ["low_relevance", "irrelevant"].includes(signal.category || "")
    ).length,
  };
}

function extractQueries(data: AgentRunResponse) {
  const queries = new Set<string>();
  for (const call of data.tool_calls) {
    const result = call.result || {};
    const resultQueries = result.queries || result.expanded_queries;
    if (Array.isArray(resultQueries)) {
      resultQueries.forEach((query) => {
        if (typeof query === "string" && query.trim()) queries.add(query);
      });
    }
  }
  return Array.from(queries);
}

function parseSseChunk(chunk: string) {
  const line = chunk
    .split("\n")
    .find((item) => item.startsWith("data: "));
  if (!line) return null;

  try {
    return JSON.parse(line.slice(6)) as {
      status?: string;
      message?: string;
      data?: unknown;
    };
  } catch {
    return null;
  }
}

function signalScore(signal: AgentSignal) {
  if (typeof signal.overall_score === "number") return signal.overall_score;
  if (typeof signal.relevance === "number") return signal.relevance;
  if (typeof signal.score === "number") return signal.score;
  return 0;
}

function signalTime(signal: AgentSignal) {
  if (signal.created_at) {
    const date = new Date(signal.created_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (signal.published_at) {
    const date = new Date(signal.published_at).getTime();
    return Number.isNaN(date) ? 0 : date;
  }
  if (typeof signal.time === "number") return signal.time * 1000;
  return 0;
}

function signalPlatform(signal: AgentSignal) {
  const url = signal.url || "";
  if (signal.platform === "x" || signal.source === "x") return "X/Twitter";
  if (signal.platform === "reddit") return "Reddit";
  if (signal.platform === "hackernews") return "Hacker News";
  if (signal.platform === "youtube") return "YouTube";
  if (signal.platform === "github") return "GitHub";
  if (signal.platform === "linkedin") return "LinkedIn";
  if (signal.platform === "devto") return "Dev.to";
  if (signal.subreddit || /reddit\.com/i.test(url)) return "Reddit";
  if (signal.subx || /\b(?:x|twitter)\.com\//i.test(url)) return "X/Twitter";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/github\.com/i.test(url)) return "GitHub";
  if (/linkedin\.com/i.test(url)) return "LinkedIn";
  if (/dev\.to/i.test(url)) return "Dev.to";
  return "Hacker News";
}

function signalSourceType(signal: AgentSignal) {
  const metadata = signal.metadata || {};
  const value = metadata.source_type;
  return typeof value === "string" && value.trim() ? value : "";
}

function normalizeKeywords(values: string[]) {
  const out: string[] = [];
  for (const value of values) {
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    if (out.some((item) => item.toLowerCase() === cleaned.toLowerCase())) continue;
    out.push(cleaned);
  }
  return out;
}

async function readError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail[0]?.msg;
    return data.message;
  } catch {
    return response.statusText;
  }
}

function scoreColor(score: number) {
  if (score >= 45 || (score > 0 && score <= 1 && score >= 0.7)) {
    return "bg-emerald-600 text-white hover:bg-emerald-600";
  }
  if (score >= 30 || (score > 0 && score <= 1 && score >= 0.55)) {
    return "bg-amber-500 text-white hover:bg-amber-500";
  }
  if (score >= 15 || (score > 0 && score <= 1 && score >= 0.4)) {
    return "bg-orange-500 text-white hover:bg-orange-500";
  }
  return "bg-zinc-700 text-white hover:bg-zinc-700";
}

function formatScore(score: number) {
  return score > 0 && score <= 1 ? score.toFixed(2) : Math.round(score).toString();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
