"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Clock,
  Target,
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  Activity,
  BrainCircuit,
  Shield,
  MoreVertical,
  LoaderCircle,
  Grid3X3,
  List,
  Hash,
  FileText,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlatformIcon, RedditIcon } from "./platform-icons";
import Layout from "./layout";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getApiUrl } from "../../lib/config";
import {
  selectAgentLimitUsed,
  selectAgentLimitTotal,
} from "@/store/slices/userSlice";
import {
  fetchAgents,
  createAgent,
  updateAgentStatus,
  selectAgents,
  selectAgentsError,
  selectAgentsLoading,
  selectCreateAgentStatus,
  clearCreateStatus,
  updateAgentStatusLocally,
} from "@/store/slices/agentsSlice";
import type {
  Agent as ReduxAgent,
  ApiAgent as ReduxApiAgent,
} from "@/types/agentDataTypes";
import {
  selectCurrentProject,
  fetchCurrentProject,
} from "@/store/slices/currentProjectSlice";
import { AgentCreateModal } from "../agent/agent-create-modal";

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

// Use Redux types for Agent and ApiAgent
type Agent = ReduxAgent;
type ApiAgent = ReduxApiAgent;

// Add this function to get auth token
function getAuthToken(): string | undefined {
  return Cookies.get("token");
}

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

  // Agent limits from user slice
  const agentLimitUsed = useSelector((state: RootState) =>
    selectAgentLimitUsed(state)
  );
  const agentLimitTotal = useSelector((state: RootState) =>
    selectAgentLimitTotal(state)
  );
  const isAgentLimitReached =
    agentLimitUsed >= agentLimitTotal && agentLimitTotal > 0;

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [projectId, queryClient]);

  // Fetch agents using Redux when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchAgents(projectId));
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
  const handleUpdateAgentStatus = async (agentId: number, status: string) => {
    if (!projectId) return;

    try {
      // Optimistic update
      dispatch(updateAgentStatusLocally({ agentId, status }));

      const result = await dispatch(
        updateAgentStatus({ projectId, agentId: agentId.toString(), status })
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

  // Filter agents based on search query
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;

    return (
      (agent.agent_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (agent.instructions || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (agent.expectations || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  // Toggle agent status
  const toggleAgentStatus = (id: number, e: React.MouseEvent) => {
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

  // Navigate to agent detail page
  const navigateToAgentDetail = (agentId: number) => {
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
        {/* Banner with stats */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full rounded-md overflow-hidden">
          <div className="w-full px-4 md:px-6 py-6 md:py-4">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1 space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  AI Agents
                </h2>
                <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl font-normal">
                  Deploy intelligent agents to automate engagement, generate
                  leads, and grow your business on autopilot.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="gap-1.5 h-7 text-xs bg-white text-slate-900 hover:bg-white/90"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-3 w-3" /> Create agent
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Activity className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="text-xs text-slate-300">Active</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">
                        {totalActive}
                      </span>
                      <span className="text-xs text-slate-300">
                        / {agents.length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="text-xs text-slate-300">Messages</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">
                        {totalMessages}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Users className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="text-xs text-slate-300">Engaged</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">
                        {totalEngagement}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
                      <span className="text-xs text-slate-300">Converts</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">
                        {totalConversions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-2 mb-4 w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md p-0.5 h-7">
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0 rounded-sm"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-sm"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] h-7 text-xs pl-7 pr-2"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    className="h-7 text-xs gap-1 px-2.5"
                    onClick={() => {
                      if (!isAgentLimitReached) {
                        setIsCreateModalOpen(true);
                      }
                    }}
                    disabled={isAgentLimitReached}
                  >
                    <Plus className="h-3 w-3" />
                    <span>New agent</span>
                  </Button>
                </div>
              </PopoverTrigger>
              {isAgentLimitReached && (
                <PopoverContent className="w-80 p-4" side="bottom" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Agent Limit Reached</h4>
                    <p className="text-sm text-muted-foreground">
                      You've reached your agent limit ({agentLimitUsed}/
                      {agentLimitTotal}). Upgrade your plan to create more
                      agents.
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => router.push("/upgrade")}
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                </PopoverContent>
              )}
            </Popover>
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
                    "group relative overflow-hidden cursor-pointer transition-all duration-300 mb-4 rounded-xl",
                    "hover:shadow-lg hover:-translate-y-0.5 hover:border-cyan-200/50 dark:hover:border-cyan-900/40",
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

                  {/* Subtle gradient bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-sky-500/70 via-cyan-400/70 to-transparent" />

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
                          <CardTitle className="text-base font-semibold tracking-tight">
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

                    {/* description hidden */}
                  </CardHeader>

                  <CardContent className="relative px-4 py-2">
                    {/* Display agent goals */}
                    <div className="text-xs font-medium capitalize text-muted-foreground">
                      {agent.goals.replace("_", " ")}
                    </div>
                    {/* Compact meta cards */}
                    <div className="mt-2 grid gap-1.5">
                      <div className="rounded-md border bg-muted/30 px-2.5 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 text-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            Instruction
                          </span>
                        </div>
                        <div className="text-[12px] mt-0.5 text-muted-foreground line-clamp-2">
                          {agent.instructions || "-"}
                        </div>
                      </div>
                      <div className="rounded-md border bg-muted/30 px-2.5 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Target className="h-3.5 w-3.5 text-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            Expectation
                          </span>
                        </div>
                        <div className="text-[12px] mt-0.5 text-muted-foreground line-clamp-2">
                          {agent.expectations || "-"}
                        </div>
                      </div>
                      {(() => {
                        const platformSettings = (agent as any)
                          ?.platform_settings;
                        const reddit = platformSettings?.reddit;
                        if (agent.agent_platform === "reddit" && reddit) {
                          const subreddit = reddit.subreddit || "any";
                          const timeRange = reddit.timeRange || "any range";
                          const minUpvotes =
                            typeof reddit.minUpvotes === "number"
                              ? reddit.minUpvotes
                              : 0;
                          const relevance =
                            typeof reddit.relevanceThreshold === "number"
                              ? reddit.relevanceThreshold
                              : 0;
                          const comments = reddit.monitorComments
                            ? "Monitors comments"
                            : "Posts only";
                          return (
                            <div className="rounded-md border bg-muted/30 px-2.5 py-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                                <RedditIcon className="h-3.5 w-3.5" />
                                <span className="text-foreground/80 font-medium">
                                  Reddit Settings
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background/60 backdrop-blur-sm shadow-sm">
                                  <Hash className="h-3 w-3" /> r/{subreddit}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background/60 backdrop-blur-sm shadow-sm">
                                  <Clock className="h-3 w-3" /> {timeRange}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background/60 backdrop-blur-sm shadow-sm">
                                  <TrendingUp className="h-3 w-3" /> ≥
                                  {minUpvotes}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background/60 backdrop-blur-sm shadow-sm">
                                  {comments === "Monitors comments" ? (
                                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                  ) : (
                                    <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                                  )}
                                  {comments}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-background/60 backdrop-blur-sm shadow-sm">
                                  <span className="h-2 w-2 rounded-full bg-cyan-500" />{" "}
                                  Relevance {relevance}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {/* {agent.review_minutes ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            Review
                          </span>
                          <span className="text-foreground/40">—</span>
                          <span>every {agent.review_minutes} min</span>
                        </div>
                      ) : null} */}
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
          project={currentProject}
          handleCreateAgent={handleCreateAgent}
          createStatus={createStatus}
        />
      </div>
    </Layout>
  );
}
