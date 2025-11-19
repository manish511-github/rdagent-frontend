"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Hash,
  Layers,
  CheckCircle,
  Brain,
  Rocket,
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  LoaderCircle,
  Smile,
  Eye,
} from "lucide-react";
import { PlatformIcon } from "@/components/kokonutui/platform-icons";
import { toast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getApiUrl } from "../../lib/config";
import { Checkbox } from "@/components/ui/checkbox";

const platforms = [
  { value: "reddit", label: "Reddit", icon: "reddit" },
  { value: "hackernews", label: "HackerNews", icon: "hackernews" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  // { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { value: "twitter", label: "Twitter", icon: "twitter", comingSoon: true },
  {
    value: "instagram",
    label: "Instagram",
    icon: "instagram",
    comingSoon: true,
  },
];

const goalOptions = [
  {
    value: "lead_generation",
    label: "Lead Generation",
    icon: Users,
    description: "Find and engage with potential customers",
    color: "from-zinc-800 to-zinc-950",
  },
  {
    value: "brand_awareness",
    label: "Brand Awareness",
    icon: CheckCircle,
    description: "Increase brand visibility and recognition",
    color: "from-zinc-800 to-zinc-950",
  },
  {
    value: "engagement",
    label: "Engagement",
    icon: MessageSquare,
    description: "Build community and foster interactions",
    color: "from-zinc-800 to-zinc-950",
  },
  {
    value: "support",
    label: "Customer Support",
    icon: Users,
    description: "Provide assistance and resolve issues",
    color: "from-zinc-800 to-zinc-950",
  },
];

const getPlatformGradient = (platform: string) => {
  switch (platform) {
    case "reddit":
      return "from-orange-500 to-red-600";
    case "linkedin":
      return "from-blue-600 to-blue-800";
    case "twitter":
      return "from-sky-400 to-blue-600";
    case "instagram":
      return "from-purple-500 to-pink-600";
    case "hackernews":
      return "from-orange-500 to-red-600";
    case "youtube":
      return "from-red-500 to-red-600";
    case "email":
      return "from-emerald-500 to-teal-600";
    default:
      return "from-gray-500 to-gray-700";
  }
};

type PlatformSettings = {
  reddit?: {
    subreddit: string;
    timeRange: string;
    relevanceThreshold: number;
    minUpvotes: number;
    monitorComments: boolean;
    targetAudience?: string;
    keywords?: string;
    schedule?: {
      type: string;
    };
  };
  twitter?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    language: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  instagram?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  linkedin?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    industryFilter: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  tiktok?: {
    keywords: string;
    accountsToMonitor: string;
    timeRange: string;
    minEngagement: number;
    relevanceThreshold: number;
    contentType: string;
    soundFilter: string;
    sentiment: string;
    mode: string;
    reviewPeriod: string;
    action: string;
    targetAudience?: string;
  };
  youtube?: {
    minViews: number;
    maxAgeDays: number;
  };
};

export type AgentCreateModalProps = {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  projectId: string | null;
  project: any;
  handleCreateAgent: (agentData: any) => void;
  createStatus: string;
};

async function generateAgentProfile(input: {
  agent_name: string;
  goals: string[];
  project_id: string;
  existing_context?: string;
}) {
  const response = await fetch(
    getApiUrl("agents/generate-instruction-personality"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate agent profile");
  }

  return response.json();
}

async function generateExpectedOutcomes(input: {
  agent_name: string;
  goals: string[];
  project_id: string;
  instructions: string;
}) {
  const response = await fetch(getApiUrl("agents/generate-expected-outcomes"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to generate expected outcomes");
  }

  return response.json();
}

export const AgentCreateModal: React.FC<AgentCreateModalProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  projectId,
  project,
  handleCreateAgent,
  createStatus,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
    name: string;
    platform: string;
    goal: string;
    instructions: string;
    expectations: string;
    mode: string | null;
    reviewPeriod: string;
    reviewMinutes: string;
    advancedSettings: Record<string, any>;
    platformSettings: PlatformSettings;
  }>({
    name: "",
    platform: "reddit",
    goal: "",
    instructions: "",
    expectations: "",
    mode: null,
    reviewPeriod: "daily",
    reviewMinutes: "30",
    advancedSettings: {},
    platformSettings: {},
  });
  const [agentKeywords, setAgentKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<string>("daily");
  const [redditLoading, setRedditLoading] = useState(false);
  const [redditConnected, setRedditConnected] = useState(false);
  const [redditOauthAccountId, setRedditOauthAccountId] = useState<
    string | null
  >(null);

  const keywordDotColors = [
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const getKeywordDotColor = (index: number) =>
    keywordDotColors[index % keywordDotColors.length];

  const generateProfileMutation = useMutation({
    mutationFn: generateAgentProfile,
    onSuccess: (data: any) => {
      handleInputChange("instructions", data.context);
      toast({
        title: "Success",
        description: "Agent profile generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to generate agent profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateOutcomesMutation = useMutation({
    mutationFn: generateExpectedOutcomes,
    onSuccess: (data: any) => {
      handleInputChange("expectations", data.expected_outcomes);
      toast({
        title: "Success",
        description: "Expected outcomes generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to generate expected outcomes. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isCreateModalOpen) {
      setFormData({
        name: "",
        platform: "reddit",
        goal: "",
        instructions: "",
        expectations: "",
        mode: null,
        reviewPeriod: "daily",
        reviewMinutes: "30",
        advancedSettings: {},
        platformSettings: {},
      });
      setCurrentStep(1);
      setAgentKeywords([]);
      setNewKeyword("");
    } else if (project && Array.isArray(project.keywords)) {
      setAgentKeywords(project.keywords);
      setNewKeyword("");
    } else {
      setAgentKeywords([]);
      setNewKeyword("");
    }
  }, [isCreateModalOpen, project]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlatformSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      platformSettings: {
        ...prev.platformSettings,
        [formData.platform]: {
          ...prev.platformSettings[formData.platform as keyof PlatformSettings],
          [field]: value,
        },
      },
    }));
  };

  const goToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  useEffect(() => {
    function handleRedditAuthMessage(event: MessageEvent) {
      if (event.data && event.data.type === "REDDIT_AUTH_SUCCESS") {
        setRedditLoading(false);
        setRedditConnected(true);
        if (event.data.oauth_account_id) {
          setRedditOauthAccountId(event.data.oauth_account_id);
        }
        toast({
          title: "Reddit Connected!",
          description: "Your Reddit account has been connected successfully.",
          variant: "default",
        });
      }
    }
    window.addEventListener("message", handleRedditAuthMessage);
    return () => window.removeEventListener("message", handleRedditAuthMessage);
  }, []);

  const handleConnectPlatform = (platform: string) => {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      toast({
        title: "Authentication Required",
        description: `Please sign in to connect your ${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } account.`,
        variant: "destructive",
      });
      return;
    }
    if (platform === "reddit") {
      setRedditLoading(true);
      fetch(getApiUrl("auth/reddit/state"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to get Reddit state");
          return res.json();
        })
        .then((data) => {
          const state = data.state;
          window.open(getApiUrl(`auth/reddit/login?state=${state}`), "_blank");
        })
        .catch((err) => {
          setRedditLoading(false);
          toast({
            title: "Reddit Auth Error",
            description: err.message,
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Coming Soon",
        description: `OAuth for ${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } is not yet implemented.`,
        variant: "default",
      });
    }
  };

  const createAgentHandler = () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    let platform_settings = { ...formData.platformSettings };
    if (formData.platform === "reddit") {
      const redditSettings: Partial<PlatformSettings["reddit"]> =
        platform_settings.reddit || {};
      platform_settings = {
        ...platform_settings,
        reddit: {
          subreddit: redditSettings.subreddit || "",
          timeRange: redditSettings.timeRange || "",
          relevanceThreshold: redditSettings.relevanceThreshold ?? 0,
          minUpvotes: redditSettings.minUpvotes ?? 0,
          monitorComments: redditSettings.monitorComments ?? false,
          targetAudience: redditSettings.targetAudience,
          keywords: redditSettings.keywords,
        },
      };
    } else if (formData.platform === "youtube") {
      const youtubeSettings: Partial<PlatformSettings["youtube"]> =
        platform_settings.youtube || {};
      platform_settings = {
        ...platform_settings,
        youtube: {
          minViews: youtubeSettings.minViews ?? 100,
          maxAgeDays: youtubeSettings.maxAgeDays ?? 365,
        },
      };
    }
    const newAgent = {
      agent_name: formData.name,
      agent_platform: formData.platform,
      agent_status: "active",
      goals: formData.goal,
      instructions: formData.instructions,
      expectations: formData.expectations,
      project_id: projectId,
      mode: null,
      review_period: formData.reviewPeriod,
      review_minutes: formData.reviewMinutes,
      advanced_settings: formData.advancedSettings,
      platform_settings,
      agent_keywords: agentKeywords,
      schedule: { schedule_type: scheduleType },
      ...(formData.platform === "reddit" && redditOauthAccountId
        ? { oauth_account_id: redditOauthAccountId }
        : {}),
    };

    handleCreateAgent(newAgent);
  };

  const renderPlatformSettings = () => {
    if (!formData.platform) return null;

    switch (formData.platform) {
      case "reddit":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="subreddit">Subreddit to Monitor</Label>
                </div>
                <Input
                  id="subreddit"
                  placeholder="e.g., AskReddit, marketing"
                  value={formData.platformSettings.reddit?.subreddit || ""}
                  onChange={(e) =>
                    handlePlatformSettingChange("subreddit", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.reddit?.timeRange || ""}
                  onValueChange={(value) =>
                    handlePlatformSettingChange("timeRange", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="relevanceThreshold">
                    Relevance Threshold
                  </Label>
                </div>
                <Input
                  id="relevanceThreshold"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={
                    formData.platformSettings.reddit?.relevanceThreshold || ""
                  }
                  onChange={(e) =>
                    handlePlatformSettingChange(
                      "relevanceThreshold",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minUpvotes">Minimum Upvotes</Label>
                </div>
                <Input
                  id="minUpvotes"
                  type="number"
                  min="0"
                  placeholder="Minimum upvotes"
                  value={formData.platformSettings.reddit?.minUpvotes || ""}
                  onChange={(e) =>
                    handlePlatformSettingChange("minUpvotes", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="monitorComments"
                checked={
                  formData.platformSettings.reddit?.monitorComments || false
                }
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  handlePlatformSettingChange("monitorComments", checked)
                }
              />
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="monitorComments">
                  Also check keywords in comments
                </Label>
              </div>
            </div>
          </div>
        );
      case "youtube":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minViews">Minimum Views</Label>
                </div>
                <Input
                  id="minViews"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.platformSettings.youtube?.minViews || ""}
                  onChange={(e) =>
                    handlePlatformSettingChange(
                      "minViews",
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum number of views required for a video to be considered
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="maxAgeDays">Maximum Age (Days)</Label>
                </div>
                <Input
                  id="maxAgeDays"
                  type="number"
                  min="0"
                  placeholder="e.g., 365"
                  value={formData.platformSettings.youtube?.maxAgeDays || ""}
                  onChange={(e) =>
                    handlePlatformSettingChange(
                      "maxAgeDays",
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum age of videos in days to be considered
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div></div>;
    }
  };
  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-[780px] md:max-w-[820px] max-h-[85vh] flex flex-col text-[13px] leading-5 dark:bg-gray-900/60 dark:border-gray-800 dark:backdrop-blur dark:supports-[backdrop-filter]:bg-gray-900/50">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-base font-semibold">
            Create AI Agent
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set up your intelligent agent in just a few steps. Choose a goal,
            select a platform, and configure the settings.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="relative mb-8">
          <div className="absolute top-5 left-6 right-0 h-0.5 bg-slate-300 dark:bg-slate-800" />
          <div className="relative flex justify-between">
            {[
              { step: 1, label: "Goal & Details", icon: Target },
              { step: 2, label: "Agent Settings", icon: Hash },
              { step: 3, label: "Platform", icon: Layers },
              { step: 4, label: "Review", icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                      currentStep === item.step
                        ? "border-blue-800 bg-blue-800 text-white shadow-lg shadow-blue-700/25 dark:border-blue-400 dark:bg-blue-400"
                        : currentStep > item.step
                        ? "border-slate-700 bg-slate-700 text-white dark:border-slate-500 dark:bg-slate-500"
                        : "border-gray-300 bg-white dark:bg-gray-900/70 dark:border-gray-800 text-gray-400"
                    )}
                  >
                    {currentStep > item.step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      currentStep === item.step
                        ? "text-blue-800 dark:text-blue-300"
                        : currentStep > item.step
                        ? "text-slate-700 dark:text-slate-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
          {/* Step 1: Goal & Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="text-sm font-medium">
                  Agent Name
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Reddit Lead Hunter, LinkedIn Thought Leader"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-11"
                />
              </div>
              {/* Goal Selection UI */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Your Goal</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalOptions.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.value}
                        className={cn(
                          "relative cursor-pointer rounded-xl border-2 p-5 transition-all",
                          "hover:shadow-md hover:border-zinc-400",
                          formData.goal === goal.value
                            ? "border-zinc-600 bg-zinc-50 dark:bg-zinc-900/20 shadow-md"
                            : "border-zinc-200 dark:border-zinc-800"
                        )}
                        onClick={() => handleInputChange("goal", goal.value)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-lg bg-gradient-to-br text-white shadow-lg",
                              "ring-1 ring-black/10 dark:ring-white/5",
                              "relative overflow-hidden group",
                              goal.color
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                              <Icon className="h-6 w-6 drop-shadow-sm" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold mb-1">
                              {goal.label}
                            </h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                        {formData.goal === goal.value && (
                          <div className="absolute top-3 right-3">
                            <Check className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="agent-instructions"
                    className="text-sm font-medium"
                  >
                    Instructions & Personality
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (!projectId) {
                        toast({
                          title: "Error",
                          description: "Project ID is required",
                          variant: "destructive",
                        });
                        return;
                      }

                      generateProfileMutation.mutate({
                        agent_name: formData.name,
                        goals: [formData.goal],
                        project_id: projectId as string,
                        existing_context: formData.instructions,
                      });
                    }}
                    disabled={generateProfileMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="agent-instructions"
                  placeholder="Describe how your agent should behave, what tone to use, and any specific guidelines..."
                  className="min-h-[120px] resize-none"
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="agent-expectations"
                    className="text-sm font-medium"
                  >
                    Expected Outcomes
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (!projectId) {
                        toast({
                          title: "Error",
                          description: "Project ID is required",
                          variant: "destructive",
                        });
                        return;
                      }

                      if (
                        !formData.name ||
                        !formData.goal ||
                        !formData.instructions
                      ) {
                        toast({
                          title: "Missing Information",
                          description:
                            "Please provide agent name, goal, and instructions before generating expected outcomes.",
                          variant: "destructive",
                        });
                        return;
                      }

                      generateOutcomesMutation.mutate({
                        agent_name: formData.name,
                        goals: [formData.goal],
                        project_id: projectId as string,
                        instructions: formData.instructions,
                      });
                    }}
                    disabled={generateOutcomesMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="agent-expectations"
                  placeholder="Describe what you expect the agent to achieve, key metrics to track, and success criteria..."
                  className="min-h-[120px] resize-none"
                  value={formData.expectations}
                  onChange={(e) =>
                    handleInputChange("expectations", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Agent Settings */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agent Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-900/30">
                  {agentKeywords.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No keywords yet. Add your first keyword.
                    </span>
                  )}
                  {agentKeywords.map((kw: string, idx: number) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full text-[11px] border bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all"
                    >
                      <span className="px-0.5 font-medium text-slate-700 dark:text-slate-200">
                        {kw}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 p-0 ml-0.5 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                        onClick={() =>
                          setAgentKeywords(
                            agentKeywords.filter((k) => k !== kw)
                          )
                        }
                        tabIndex={-1}
                        aria-label={`Remove ${kw}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    className="w-40 h-7 text-[11px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newKeyword.trim()) {
                        e.preventDefault();
                        if (!agentKeywords.includes(newKeyword.trim())) {
                          setAgentKeywords([
                            ...agentKeywords,
                            newKeyword.trim(),
                          ]);
                        }
                        setNewKeyword("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (
                        newKeyword.trim() &&
                        !agentKeywords.includes(newKeyword.trim())
                      ) {
                        setAgentKeywords([...agentKeywords, newKeyword.trim()]);
                      }
                      setNewKeyword("");
                    }}
                    disabled={!newKeyword.trim()}
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                  >
                    Add Keyword
                  </Button>
                </div>
                {agentKeywords.length > 8 && (
                  <div className="text-[11px] text-muted-foreground">
                    Showing {Math.min(agentKeywords.length, 50)} keywords
                  </div>
                )}
              </div>
              {/* Schedule Section */}
              <div className="space-y-2 mt-6">
                <div className="rounded-lg border p-3 bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Schedule Type</Label>
                  </div>
                  <RadioGroup
                    value={scheduleType}
                    onValueChange={setScheduleType}
                    className="flex gap-2"
                  >
                    <div
                      className={cn(
                        "relative cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                        scheduleType === "daily"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      )}
                    >
                      <RadioGroupItem
                        value="daily"
                        id="schedule-daily"
                        className="sr-only"
                      />
                      <Label
                        htmlFor="schedule-daily"
                        className="cursor-pointer"
                      >
                        Daily
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "relative cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                        scheduleType === "weekly"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      )}
                    >
                      <RadioGroupItem
                        value="weekly"
                        id="schedule-weekly"
                        className="sr-only"
                      />
                      <Label
                        htmlFor="schedule-weekly"
                        className="cursor-pointer"
                      >
                        Weekly
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "relative cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                        scheduleType === "monthly"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      )}
                    >
                      <RadioGroupItem
                        value="monthly"
                        id="schedule-monthly"
                        className="sr-only"
                      />
                      <Label
                        htmlFor="schedule-monthly"
                        className="cursor-pointer"
                      >
                        Monthly
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Platform Selection */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Choose Your Platform
                </Label>
                <div className="grid grid-cols-5 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.value}
                      className={cn(
                        "relative rounded-xl border-2 p-4 transition-all duration-200",
                        "group",
                        platform.comingSoon
                          ? "cursor-not-allowed opacity-50 border-zinc-200 dark:border-zinc-800"
                          : "cursor-pointer hover:shadow-lg hover:border-cyan-400 hover:-translate-y-0.5",
                        formData.platform === platform.value
                          ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 shadow-lg"
                          : "border-zinc-200 dark:border-zinc-800"
                      )}
                      onClick={() =>
                        !platform.comingSoon &&
                        handleInputChange("platform", platform.value)
                      }
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            "p-4 rounded-xl bg-gradient-to-br text-white shadow-lg",
                            "ring-1 ring-black/10 dark:ring-white/5",
                            "relative overflow-hidden group-hover:scale-105 transition-transform duration-200",
                            getPlatformGradient(platform.value)
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="relative">
                            <PlatformIcon
                              platform={platform.value}
                              className="h-7 w-7 drop-shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-xs block">
                            {platform.label}
                          </span>
                        </div>
                      </div>
                      {formData.platform === platform.value && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-cyan-600 text-white p-1 rounded-full shadow-lg">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      {platform.comingSoon && (
                        <div className="absolute bottom-2 left-2 right-2 bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full text-center">
                          Coming Soon
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Connection Section */}
              {formData.platform && formData.platform !== "hackernews" && formData.platform !== "youtube" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Account Connection
                  </Label>
                  <div className="rounded-xl border-2 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-lg bg-gradient-to-br text-white shadow-lg",
                            getPlatformGradient(formData.platform)
                          )}
                        >
                          <PlatformIcon
                            platform={formData.platform}
                            className="h-6 w-6"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">
                            Login with{" "}
                            {formData.platform.charAt(0).toUpperCase() +
                              formData.platform.slice(1)}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Connect your account to post content
                          </p>
                        </div>
                      </div>
                      {formData.platform === "reddit" && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <Button
                            className={cn(
                              "h-8",
                              redditConnected &&
                                !redditLoading &&
                                "opacity-100 cursor-default"
                            )}
                            onClick={() =>
                              handleConnectPlatform(formData.platform)
                            }
                            disabled={redditLoading || redditConnected}
                            style={
                              redditConnected && !redditLoading
                                ? {
                                    pointerEvents: "none",
                                    filter: "none",
                                    opacity: 1,
                                  }
                                : {}
                            }
                          >
                            {redditLoading ? (
                              <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                            ) : redditConnected ? (
                              <>
                                <span className="mr-2">✅</span>Reddit Connected
                              </>
                            ) : (
                              <>
                                Connect {""}
                                {formData.platform.charAt(0).toUpperCase() +
                                  formData.platform.slice(1)}
                              </>
                            )}
                          </Button>

                          {redditLoading && !redditConnected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRedditLoading(false)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* <div className="space-y-3">
                <Label className="text-sm font-medium">Operation Mode</Label>
                <RadioGroup
                  value={formData.mode}
                  onValueChange={(value) => handleInputChange("mode", value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200",
                      "hover:shadow-lg hover:border-cyan-400 hover:-translate-y-0.5",
                      formData.mode === "copilot"
                        ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 shadow-lg"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <RadioGroupItem
                      value="copilot"
                      id="copilot"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="copilot"
                      className="flex items-start gap-4 cursor-pointer"
                    >
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-1">Copilot Mode</h3>
                        <p className="text-xs text-muted-foreground">
                          Agent suggests actions and waits for your approval
                          before executing
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200",
                      "hover:shadow-lg hover:border-cyan-400 hover:-translate-y-0.5",
                      formData.mode === "autopilot"
                        ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 shadow-lg"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <RadioGroupItem
                      value="autopilot"
                      id="autopilot"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="autopilot"
                      className="flex items-start gap-4 cursor-pointer"
                    >
                      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-1">Autopilot Mode</h3>
                        <p className="text-xs text-muted-foreground">
                          Agent works autonomously based on your instructions
                          and guidelines
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {formData.mode === "autopilot" && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="review-minutes"
                        className="text-sm font-medium"
                      >
                        Review period (minutes)
                      </Label>
                      <Input
                        id="review-minutes"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.reviewMinutes}
                        onChange={(e) =>
                          handleInputChange("reviewMinutes", e.target.value)
                        }
                        className="w-20 h-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The agent will wait for you to review content before
                      posting
                    </p>
                  </div>
                )}
              </div> */}

              <Collapsible className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Advanced Settings
                  </Label>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-4 pt-2">
                  <div className="rounded-lg border p-6">
                    {formData.platform && renderPlatformSettings()}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Main Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
                          getPlatformGradient(formData.platform)
                        )}
                      >
                        <PlatformIcon
                          platform={formData.platform}
                          className="h-8 w-8"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-200">
                          {formData.name || "Unnamed Agent"}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="capitalize">
                            {formData.goal.replace("_", " ") || "No goal set"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            {formData.mode === "copilot" ? (
                              <>
                                <Brain className="h-4 w-4 text-blue-500" />
                                <span>Copilot Mode</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="h-4 w-4 text-emerald-500" />
                                <span>Autopilot Mode</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      Review Settings
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Schedule
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-300 capitalize">
                        {formData.reviewPeriod}
                      </span>
                    </div>
                    {formData.mode === "autopilot" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Wait Time
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-300">
                            {formData.reviewMinutes}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            minutes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Instructions & Personality
                      </h4>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/30">
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {formData.instructions || "No instructions provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Expected Outcomes
                      </h4>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/30">
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {formData.expectations || "No expectations defined"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Settings Card */}
              {formData.platform && (
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      Platform Settings
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {formData.platform === "reddit" && (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Subreddit
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.reddit?.subreddit ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.reddit.subreddit}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Time Range
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.reddit?.timeRange ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.reddit.timeRange}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Target className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Relevance
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.reddit
                              ?.relevanceThreshold ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {
                                  formData.platformSettings.reddit
                                    .relevanceThreshold
                                }
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Min Upvotes
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.reddit?.minUpvotes ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.reddit.minUpvotes}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              Monitor Comments:
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                formData.platformSettings.reddit
                                  ?.monitorComments
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  formData.platformSettings.reddit
                                    ?.monitorComments
                                    ? "bg-emerald-500 dark:bg-emerald-400"
                                    : "bg-slate-400 dark:bg-slate-500"
                                )}
                              ></span>
                              {formData.platformSettings.reddit?.monitorComments
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {formData.platform === "twitter" && (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Hash className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Keywords
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.twitter?.keywords ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.twitter.keywords}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Accounts
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.twitter
                              ?.accountsToMonitor ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {
                                  formData.platformSettings.twitter
                                    .accountsToMonitor
                                }
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Time Range
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.twitter?.timeRange ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.twitter.timeRange}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Min Engagement
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.twitter
                              ?.minEngagement ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {
                                  formData.platformSettings.twitter
                                    .minEngagement
                                }
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Smile className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              Sentiment:
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                formData.platformSettings.twitter?.sentiment
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  formData.platformSettings.twitter?.sentiment
                                    ? "bg-blue-500 dark:bg-blue-400"
                                    : "bg-slate-400 dark:bg-slate-500"
                                )}
                              ></span>
                              {formData.platformSettings.twitter?.sentiment ||
                                "Not set"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {formData.platform === "youtube" && (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Minimum Views
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.youtube?.minViews ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.youtube.minViews.toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Maximum Age (Days)
                            </span>
                          </div>
                          <div className="text-xs">
                            {formData.platformSettings.youtube?.maxAgeDays ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formData.platformSettings.youtube.maxAgeDays} days
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
                                Not set
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6 border-t mt-4">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevStep}
              className="gap-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              onClick={goToNextStep}
              size="sm"
              className="gap-2 w-full sm:w-auto h-8"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={createAgentHandler}
              size="sm"
              className="gap-2 w-full sm:w-auto h-8"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Launch Agent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
