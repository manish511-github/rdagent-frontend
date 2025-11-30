"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import { PlatformIcon } from "@/components/kokonutui/platform-icons";
import { selectCurrentProject } from "@/store/slices/currentProjectSlice";
import {
  selectUserInfo,
  selectHasEnoughCreditsForRedditPostGeneration,
  selectRedditPostGenerationCost,
  selectRemainingCredits,
} from "@/store/slices/userSlice";
import { getApiUrl } from "@/lib/config";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DraftItem {
  subreddit: string;
  title: string;
  body: string;
  engagement_score?: number;
  risk_score?: number;
  rule_checks?: { passed?: boolean };
}

export default function RedditPostGeneratorPage({
  projectId,
}: {
  projectId: string;
}) {
  const { toast } = useToast();
  const currentProject = useSelector(selectCurrentProject);
  const resolvedProjectUuid = currentProject?.uuid ?? projectId;
  const user = useSelector(selectUserInfo);
  const isSubscriptionInactive = user?.subscription?.status === 'inactive';

  // Credit-related selectors
  const hasEnoughCredits = useSelector(
    selectHasEnoughCreditsForRedditPostGeneration
  );
  const redditCost = useSelector(selectRedditPostGenerationCost);
  const remainingCredits = useSelector(selectRemainingCredits);

  const [subredditsInput, setSubredditsInput] = useState("Anthropic");
  const [userQuery, setUserQuery] = useState("");
  const [timeWindowDays, setTimeWindowDays] = useState<number>(30);
  const [analyzeTemplates, setAnalyzeTemplates] = useState<boolean>(false);
  const [useSerp, setUseSerp] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleGenerate = async () => {
    // Check if user has sufficient credits
    if (!hasEnoughCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${redditCost} credits for Reddit post generation, but you only have ${remainingCredits} credits remaining.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentDraftIndex(0);
    try {
      const subreddits = subredditsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        user_query: userQuery,
        subreddits,
        time_window_days: Math.max(1, Number(timeWindowDays) || 1),
        project_uuid: resolvedProjectUuid,
        analyze_subreddit_templates: analyzeTemplates,
        use_serp_context: useSerp,
      };

      let accessToken = Cookies.get("access_token") || "";
      const url = getApiUrl("/reddit/generator/simple");

      const doFetch = async (token: string) => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return res;
      };

      let res = await doFetch(accessToken);
      if (res.status === 401) {
        try {
          await refreshAccessToken();
          accessToken = Cookies.get("access_token") || "";
          res = await doFetch(accessToken);
        } catch (e) {
          // fallthrough to handle non-OK below
        }
      }

      // Handle insufficient credits (402 Payment Required)
      if (res.status === 402) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage =
          errorData?.detail || "Insufficient credits to generate Reddit posts.";
        toast({
          title: "Insufficient Credits",
          description: errorMessage,
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
      }

      const json = (await res.json()) as { drafts?: DraftItem[] };
      const received = Array.isArray(json?.drafts) ? json.drafts : [];
      setDrafts(received);
    } catch (e: any) {
      setError(e?.message || "Failed to generate drafts");
      setDrafts(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextDraft = () => {
    if (drafts && currentDraftIndex < drafts.length - 1) {
      setCurrentDraftIndex(currentDraftIndex + 1);
    }
  };

  const prevDraft = () => {
    if (currentDraftIndex > 0) {
      setCurrentDraftIndex(currentDraftIndex - 1);
    }
  };

  const currentDraft =
    drafts && drafts.length > 0 ? drafts[currentDraftIndex] : null;

  const handleCopyTitle = async () => {
    if (!currentDraft?.title) return;
    try {
      await navigator.clipboard.writeText(currentDraft.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 1200);
    } catch {}
  };

  const handleCopyBody = async () => {
    if (!currentDraft?.body) return;
    try {
      await navigator.clipboard.writeText(currentDraft.body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 1200);
    } catch {}
  };

  return (
    <section className="py-4 md:py-0">
      <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"></div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full rounded-md overflow-hidden">
          <div className="w-full px-4 md:px-6 py-4 flex items-center">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-50/10 ring-1 ring-white/10">
                <PlatformIcon platform="reddit" className="h-4 w-4" />
              </div>
              Reddit Post Generator
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4 bg-white/70 dark:bg-gray-900/50 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/30 border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm font-semibold">Compose request</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Cmd/Ctrl + Enter
                  </div>
                </div>

                {/* Request textarea */}
                <div>
                  <div className="text-sm font-medium mb-1">Your Request</div>
                  <Textarea
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Write your prompt as: Post Type + User Query + (optional) Context — for example: Write a discussion post about Claude 3.5 vs GPT-4 for coding .Context: Claude is cheaper/faster with 200k context but GPT-4 is more accurate."
                    className="min-h-[160px] resize-none bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-gray-900/30"
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (!isGenerating && userQuery.trim()) handleGenerate();
                      }
                    }}
                  />
                  <div className="mt-1 flex items-center justify-end">
                    <div className="text-[11px] text-muted-foreground">
                      {userQuery.length} chars
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="rounded-lg border p-3 bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="useSerp"
                      checked={useSerp}
                      onCheckedChange={(v) => setUseSerp(Boolean(v))}
                    />
                    <Label htmlFor="useSerp" className="text-sm">
                      Use SERP context
                    </Label>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Checkbox
                      id="analyzeTemplates"
                      checked={analyzeTemplates}
                      onCheckedChange={(v) => setAnalyzeTemplates(Boolean(v))}
                    />
                    <Label htmlFor="analyzeTemplates" className="text-sm">
                      Analyze subreddit templates
                    </Label>
                  </div>

                  {analyzeTemplates && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Subreddits (comma-separated)
                        </div>
                        <Input
                          value={subredditsInput}
                          onChange={(e) => setSubredditsInput(e.target.value)}
                          placeholder="e.g., programming, startups"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Time Window (days)
                        </div>
                        <Input
                          type="number"
                          min={1}
                          value={timeWindowDays}
                          onChange={(e) =>
                            setTimeWindowDays(Number(e.target.value || 0))
                          }
                          className="h-9 w-32"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>
                        <Button
                          className="h-9"
                          onClick={() => {
                            if (!isSubscriptionInactive) {
                              handleGenerate();
                            }
                          }}
                          disabled={!userQuery || isGenerating || !hasEnoughCredits || isSubscriptionInactive}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate Drafts
                        </Button>
                      </div>
                    </PopoverTrigger>
                    {isSubscriptionInactive && (
                      <PopoverContent className="w-80 p-4" side="bottom" align="start">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Subscription Inactive</h4>
                          <p className="text-sm text-muted-foreground">
                            Your subscription is inactive. Please activate your plan to generate Reddit posts.
                          </p>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => window.location.href = "/pricing"}
                          >
                            Activate Subscription
                          </Button>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                  <Button
                    variant="secondary"
                    className="h-9"
                    onClick={() => {
                      setDrafts(null);
                      setError(null);
                      setCurrentDraftIndex(0);
                    }}
                  >
                    Clear
                  </Button>
                </div>
                {error && (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <Card className="p-4 h-[600px] flex flex-col bg-white/70 dark:bg-gray-900/50 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/30 border">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">Draft Preview</div>
                {currentDraft && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleCopyTitle}
                      disabled={!currentDraft?.title}
                    >
                      <Copy className="h-3 w-3 mr-1" />{" "}
                      {copiedTitle ? "Copied" : "Copy title"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleCopyBody}
                      disabled={!currentDraft?.body}
                    >
                      <Copy className="h-3 w-3 mr-1" />{" "}
                      {copiedBody ? "Copied" : "Copy body"}
                    </Button>
                  </div>
                )}
              </div>
              {!drafts && !isGenerating && (
                <div className="text-sm text-muted-foreground flex-1 flex items-center justify-center">
                  Generated drafts will appear here after you submit your
                  request.
                </div>
              )}
              {isGenerating && (
                <div className="flex items-center justify-center text-sm text-muted-foreground flex-1">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  Generating...
                </div>
              )}
              {currentDraft && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    <div className="text-[11px] text-muted-foreground">
                      r/{currentDraft?.subreddit ?? "unknown"}
                    </div>
                    <div className="text-sm font-medium">
                      {currentDraft?.title || "Untitled"}
                    </div>
                    {currentDraft?.body ? (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {currentDraft.body}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        (No body provided)
                      </div>
                    )}
                  </div>

                  {/* Navigation - Fixed at bottom */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      Draft {currentDraftIndex + 1} of {drafts?.length || 0}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevDraft}
                        disabled={currentDraftIndex === 0}
                        className="h-7 px-2"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextDraft}
                        disabled={
                          !drafts || currentDraftIndex === drafts.length - 1
                        }
                        className="h-7 px-2"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
