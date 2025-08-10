"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Settings,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  Activity,
  Layers,
  BrainCircuit,
  Rocket,
  Shield,
  Star,
  MoreVertical,
  Hash,
  Globe,
  Smile,
  Image,
  FileText,
  Building2,
  Video,
  Music,
  CheckCircle,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PlatformIcon, RedditIcon } from "./platform-icons";
import Layout from "./layout";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getApiUrl } from "../../lib/config";
import {
  fetchAgents,
  createAgent,
  updateAgentStatus,
  selectAgents,
  selectAgentsStatus,
  selectAgentsError,
  selectAgentsLoading,
  selectCreateAgentStatus,
  clearAgents,
  clearError,
  clearCreateStatus,
  updateAgentStatusLocally,
  type Agent as ReduxAgent,
  type ApiAgent as ReduxApiAgent,
} from "@/store/slices/agentsSlice";
import {
  selectCurrentProject,
  fetchCurrentProject,
} from "@/store/slices/currentProjectSlice";
import { AgentCreateModal } from "../agent/agent-create-modal";

// Mock data for agents

// Platform options for the form
const platformOptions = [
  { value: "reddit", label: "Reddit", icon: "reddit" },
  { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { value: "twitter", label: "Twitter", icon: "twitter" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "tiktok", label: "TikTok", icon: "tiktok" },
];

// Goal options for the form
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
    icon: Eye,
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
    icon: Shield,
    description: "Provide assistance and resolve issues",
    color: "from-zinc-800 to-zinc-950",
  },
];

// Helper functions
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
    case "email":
      return "from-emerald-500 to-teal-600";
    default:
      return "from-gray-500 to-gray-700";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "paused":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
    case "error":
      return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400";
    case "pending":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getGoalIcon = (goal: string) => {
  switch (goal) {
    case "lead_generation":
      return Users;
    case "brand_awareness":
      return Eye;
    case "engagement":
      return MessageSquare;
    case "support":
      return Shield;
    default:
      return Target;
  }
};

// Add platform settings types
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
};

// Use Redux types for Agent and ApiAgent
type Agent = ReduxAgent;
type ApiAgent = ReduxApiAgent;

// Add this function to get auth token
function getAuthToken(): string | undefined {
  return Cookies.get("token");
}

// fetchAgents is now handled by Redux slice

// updateAgentStatus is now handled by Redux slice

// createNewAgent is now handled by Redux slice

// Add API call function
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

// Add new API call function for expected outcomes
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

// Add this type definition
type Project = {
  uuid: string;
  id: string;
  keywords: string[];
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  dueDate?: string;
  startDate?: string;
  lastUpdated?: string;
  priority?: string;
  category?: string;
  budget?: number;
  budgetSpent?: number;
  team?: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tags?: string[];
  metrics?: {
    tasks: number;
    completed: number;
    comments: number;
    attachments: number;
  };
  health?: string;
  starred?: boolean;
  icon?: any;
};

export default function AgentsPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const agents = useSelector((state: RootState) => selectAgents(state));
  const isLoading = useSelector((state: RootState) =>
    selectAgentsLoading(state)
  );
  const error = useSelector((state: RootState) => selectAgentsError(state));
  const createStatus = useSelector((state: RootState) =>
    selectCreateAgentStatus(state)
  );

  // Get current project from currentProject slice (has full project data including keywords)
  const currentProject = useSelector((state: RootState) =>
    selectCurrentProject(state)
  );

  // Extract project ID from URL with better validation
  const projectId = (() => {
    // First try to get from URL params (route parameter is [id])
    const id =
      typeof params?.id === "string"
        ? params.id
        : typeof params?.project_id === "string"
        ? params.project_id
        : typeof params?.projectId === "string"
        ? params.projectId
        : null;

    // If not found in params, try to extract from pathname
    if (!id && pathname) {
      // Support both /projects/ and /project/ patterns
      const match = pathname.match(/\/projects?\/([^/]+)/);
      return match ? match[1] : null;
    }

    // Validate UUID format
    if (
      id &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      console.warn("Invalid UUID format for project ID:", id);
      return null;
    }

    return id;
  })();

  // Use currentProject from currentProject slice instead of searching projects.items
  const project = currentProject;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Add SSE connection state
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);

  // Add validation for project ID
  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Invalid project ID. Redirecting to projects page...",
        variant: "destructive",
      });
      router.push("/projects");
      return;
    }

    // If we're on /agents without a project ID, redirect to the project's agents page
    if (pathname === "/agents" && projectId) {
      router.push(`/projects/${projectId}/agents`);
      return;
    }
  }, [projectId, router, pathname]);

  // Setup SSE connection
  useEffect(() => {
    if (!projectId) return;

    const token = getAuthToken();
    if (!token) return;

    // Create SSE connection
    const eventSource = new EventSource(
      getApiUrl(`sse/projects/${projectId}/events?token=${token}`)
    );

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Event:", data);

        // Handle different types of events
        if (data.type === "agent_status") {
          const { agent_id, status } = data.data;

          // Update agent status in Redux store

          // If status is completed, update the agent in React Query cache
          if (status === "completed") {
            queryClient.setQueryData(
              ["agents", projectId],
              (oldData: Agent[] | undefined) => {
                if (!oldData) return oldData;

                return oldData.map((agent) => {
                  if (agent.id === agent_id) {
                    console.log("Matched agent:", agent);
                    return { ...agent, agent_status: "completed" }; // Update status
                  }
                  return agent;
                });
              }
            );
          }
        }
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    setSseConnection(eventSource);

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [projectId, queryClient]);

  // Fetch agents using Redux when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchAgents(projectId));
    } else {
      dispatch(clearAgents());
    }
  }, [projectId, dispatch]);

  // Fetch current project data when projectId changes
  useEffect(() => {
    if (projectId) {
      // Only fetch if we don't have the project data or if it's a different project
      if (!currentProject || currentProject.uuid !== projectId) {
        dispatch(fetchCurrentProject(projectId));
      }
    }
  }, [projectId, dispatch, currentProject]);

  // Add error handling for authentication and missing project ID
  useEffect(() => {
    if (error) {
      if (error === "Authentication failed") {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue",
          variant: "destructive",
        });
        // You can add router.push('/login') here if needed
      } else if (error === "Project not found") {
        toast({
          title: "Error",
          description: "Project not found. Redirecting to projects page...",
          variant: "destructive",
        });
        router.push("/projects");
      } else {
        toast({
          title: "Error",
          description: error || "Failed to load agents",
          variant: "destructive",
        });
      }
    }
  }, [error, router, toast]);

  // Redux action for updating agent status
  const handleUpdateAgentStatus = async (agentId: string, status: string) => {
    if (!projectId) return;

    try {
      // Optimistic update
      dispatch(updateAgentStatusLocally({ agentId, status }));

      const result = await dispatch(
        updateAgentStatus({ projectId, agentId, status })
      );

      if (updateAgentStatus.fulfilled.match(result)) {
        toast({
          title: "Status updated",
          description: "Agent status has been updated successfully.",
        });
      } else {
        throw new Error(
          (result.payload as string) || "Failed to update agent status"
        );
      }
    } catch (error) {
      // Revert optimistic update on error
      dispatch(fetchAgents(projectId));
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  // Redux action for creating new agent
  const handleCreateAgent = async (agentData: ApiAgent) => {
    try {
      const result = await dispatch(createAgent(agentData));

      if (createAgent.fulfilled.match(result)) {
        setIsCreateModalOpen(false);
        toast({
          title: "Agent created",
          description: "New agent has been created successfully.",
        });
        // Clear create status after successful creation
        dispatch(clearCreateStatus());
      } else {
        throw new Error((result.payload as string) || "Failed to create agent");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create agent",
        variant: "destructive",
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter agents based on search query and filters
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      (agent.agent_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (agent.instructions || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (agent.expectations || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesPlatform =
      filterPlatform === "all" || agent.agent_platform === filterPlatform;
    const matchesStatus =
      filterStatus === "all" || agent.agent_status === filterStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Toggle agent status
  const toggleAgentStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const agent = agents.find((a) => a.id === id);
    if (agent) {
      const newStatus = agent.agent_status === "active" ? "paused" : "active";
      handleUpdateAgentStatus(id, newStatus);
    }
  };

  // Create a new agent
  const createAgentHandler = (
    agentData: ApiAgent & { oauth_account_id?: string }
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }
    handleCreateAgent(agentData);
  };

  // Calculate total stats
  const totalActive = agents.filter((a) => a.agent_status === "active").length;
  const totalMessages = agents.reduce(
    (sum, a) => sum + (a.advanced_settings?.messages || 0),
    0
  );
  const totalEngagement = agents.reduce(
    (sum, a) => sum + (a.advanced_settings?.engagement || 0),
    0
  );
  const totalConversions = agents.reduce(
    (sum, a) => sum + (a.advanced_settings?.conversions || 0),
    0
  );
  const avgPerformance = Math.round(
    agents.reduce(
      (sum, a) => sum + (a.advanced_settings?.performance || 0),
      0
    ) / agents.length
  );

  // Navigate to agent detail page
  const navigateToAgentDetail = (agentId: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }
    router.push(`/projects/${projectId}/agents/${agentId}`);
  };

  // Update the agents grid to handle loading and error states
  return (
    <Layout>
      <div className="space-y-8 p-4">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Modern Elegant Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
            {/* Circuit Board Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 800 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="circuit-pattern"
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(5)"
                  >
                    <path
                      d="M0 50h100M50 0v100M25 25h25v25h25M75 75h-25v-25h-25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                    <circle cx="50" cy="50" r="3" fill="currentColor" />
                    <circle cx="25" cy="25" r="2" fill="currentColor" />
                    <circle cx="75" cy="75" r="2" fill="currentColor" />
                    <circle cx="75" cy="25" r="2" fill="currentColor" />
                    <circle cx="25" cy="75" r="2" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
              </svg>
            </div>

            {/* Glowing Accent Elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />

              {/* Digital Data Stream Effect */}
              <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
                    style={{
                      top: `${30 + i * 30}%`,
                      left: 0,
                      right: 0,
                      opacity: 0.3 + Math.random() * 0.3,
                      animation: `dataStream ${
                        5 + Math.random() * 5
                      }s linear infinite`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Floating Tech Elements */}
            <div className="absolute top-8 right-1/4 w-12 h-12 border border-cyan-500/20 rounded-lg rotate-12 backdrop-blur-sm" />
            <div className="absolute bottom-8 left-1/4 w-14 h-14 border border-blue-500/20 rounded-full backdrop-blur-sm" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Section - Title and Description */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-xl">
                    <BrainCircuit className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      AI Agents
                    </h1>
                    <p className="text-cyan-100/80 text-sm">
                      Intelligent automation across platforms
                    </p>
                  </div>
                </div>
                <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                  Deploy intelligent agents to automate engagement, generate
                  leads, and grow your business on autopilot.
                </p>
              </div>

              {/* Right Section - Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:max-w-2xl">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">
                      {totalActive}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {agents.length}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Messages</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">
                      {totalMessages}
                    </span>
                    <span className="text-xs text-emerald-400">+24%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Engaged</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">
                      {totalEngagement}
                    </span>
                    <span className="text-xs text-emerald-400">+18%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Converts</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">
                      {totalConversions}
                    </span>
                    <span className="text-xs text-emerald-400">+32%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Avg Perf</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">
                      {avgPerformance}%
                    </span>
                    <span className="text-xs text-emerald-400">+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or description..."
              className="pl-10 h-11 bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-[180px] h-11 bg-white dark:bg-gray-900/60">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <SelectValue placeholder="All Platforms" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon
                        platform={option.value}
                        className="h-4 w-4"
                      />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] h-11 bg-white dark:bg-gray-900/60">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Paused</span>
                  </div>
                </SelectItem>
                <SelectItem value="error">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Error</span>
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading ? (
            // Loading state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 animate-spin">
                <RedditIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Loading agents...</h3>
            </div>
          ) : error ? (
            // Error state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <BrainCircuit className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Error loading agents
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {error || "Failed to load agents"}
              </p>
              <Button
                onClick={() => projectId && dispatch(fetchAgents(projectId))}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <BrainCircuit className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Try adjusting your filters or create a new agent to get started.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          ) : (
            // Existing agents grid
            filteredAgents.map((agent) => {
              return (
                <Card
                  key={agent.id}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-300 mb-4",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800",
                    // Add disabled state for scheduled agents
                    agent.agent_status === "scheduled" &&
                      "opacity-70 pointer-events-none"
                  )}
                  onClick={() => navigateToAgentDetail(agent.id)}
                >
                  {/* Add circular progress indicator for scheduled status without blur */}
                  {agent.agent_status === "scheduled" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/5 dark:bg-white/5 z-10">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Processing...
                      </span>
                    </div>
                  )}

                  <CardHeader className="relative pb-3 pt-4 px-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg bg-gradient-to-br text-white shadow-lg",
                            getPlatformGradient(agent.agent_platform)
                          )}
                        >
                          <PlatformIcon
                            platform={agent.agent_platform}
                            className="h-6 w-6 text-white"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {agent.agent_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs px-2 py-0.5",
                                getStatusColor(agent.agent_status)
                              )}
                            >
                              {agent.agent_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Settings menu can be added here
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {agent.instructions}
                    </p>
                  </CardHeader>

                  <CardContent className="relative px-4 py-2">
                    {/* Display agent goals */}
                    <div className="text-xs font-medium capitalize text-muted-foreground">
                      {agent.goals.replace("_", " ")}
                    </div>
                  </CardContent>

                  <CardFooter className="relative pt-2 pb-3 px-4 border-t">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {agent.advanced_settings?.lastActive || "Never"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={agent.agent_status === "active"}
                          onCheckedChange={() =>
                            toggleAgentStatus(agent.id, {
                              stopPropagation: () => {},
                            } as any)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="scale-90 data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* Create Agent Modal */}
        <AgentCreateModal
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          projectId={projectId}
          project={project}
          handleCreateAgent={handleCreateAgent}
          createStatus={createStatus}
        />
      </div>
    </Layout>
  );
}

// Add animations
const dataStream = `@keyframes dataStream {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}`;

const float = `@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(10px);
  }
  50% {
    transform: translateY(0) translateX(20px);
  }
  75% {
    transform: translateY(10px) translateX(10px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}`;

// Add this at the end of the file, after the animations
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(203 213 225);
    border-radius: 20px;
    transition: background-color 0.2s ease;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgb(148 163 184);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(51 65 85);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgb(71 85 105);
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
