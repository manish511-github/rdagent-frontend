"use client";

import { DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchAgentData,
  selectDisplayPosts,
  selectAgentData,
  selectAgentState,
  selectAgentType,
  updateAgentStatus,
  type DisplayPost,
  type PostStatus,
} from "@/store/features/agentSlice";
import {
  Users,
  Edit,
  Trash2,
  MessageSquare,
  RefreshCw,
  Search,
  CheckIcon,
  XIcon,
  UserPlusIcon,
  FlagIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  ExternalLink,
  BarChart2,
  Settings,
  Menu,
  Hash,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/kokonutui/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { selectPostById } from "@/store/features/agentSlice";
import {
  fetchAgentDetails,
  selectAgentDetails,
  selectAgentDetailsStatus,
  updateAgentDetails,
  type AgentDetails,
} from "@/store/features/agentSlice";
import MarkdownRender from "../markdown-render";
import ResponseComposer from "./response-generator";
import { InfinitePostsList } from "./infinite-posts-list";
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";
import { getApiUrl } from "@/lib/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import HackerNewsView from "./hackernews-view";
import { final_stories_output as HN_FINAL } from "./hackernews_dummy_data";

// Add this utility function to hide scrollbars
const scrollbarHideClass = "scrollbar-hide";

// Add this CSS class to the component's styles
const styles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Performance data for the agent
const performanceData = {
  dailyLeads: [12, 15, 10, 18, 25, 22, 20],
  weeklyEngagement: [65, 72, 68, 80, 85, 75, 78],
  responseRate: 92,
  conversionRate: 28,
  averageResponseTime: "15 min",
  topKeywords: ["MDM", "security", "iOS", "enterprise", "pricing"],
  platformBreakdown: {
    reddit: 65,
    twitter: 20,
    linkedin: 15,
  },
  sentimentAnalysis: {
    positive: 45,
    neutral: 40,
    negative: 15,
  },
};

// Update the status badge rendering
const getStatusBadgeClass = (status: PostStatus) => {
  switch (status) {
    case "pending":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "needs_review":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "discarded":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    case "escalated":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "processed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getStatusLabel = (status: PostStatus) => {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "needs_review":
      return "Needs Review";
    case "discarded":
      return "Discarded";
    case "escalated":
      return "Escalated to Sales";
    case "processed":
      return "Processed";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};

// Performance Metrics Component
const PerformanceMetrics = React.memo(function PerformanceMetrics({
  setActiveView,
  agentId,
}: {
  setActiveView: (view: string) => void;
  agentId: string;
}) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data when component mounts
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = Cookies.get("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(getApiUrl(`agents/${agentId}/analytics`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAnalytics();
    }
  }, [agentId]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="p-3 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-7 w-24" />
      </div>

      {/* Performance Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="h-40 flex items-end justify-between gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-8 h-32" />
                <Skeleton className="h-3 w-4 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800"
          >
            <CardContent className="p-3">
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Keywords Skeleton */}
      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="p-3 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Performance Metrics</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveView("content")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Back to Content
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <XIcon className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-sm font-medium mb-1">
              Failed to Load Analytics
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // No data state
  if (!analyticsData) {
    return (
      <div className="p-3 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Performance Metrics</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveView("content")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Back to Content
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-2">
              <BarChart2 className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-sm font-medium mb-1">No Analytics Data</h3>
            <p className="text-xs text-muted-foreground">
              Analytics data is not available for this agent yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from analytics response
  const { runs, posts, per_run } = analyticsData;

  // Extract nested data from posts object
  const engagement = posts?.engagement;
  const relevance = posts?.relevance;
  const top_posts = posts?.top_posts;

  // Debug logging to see what data we're receiving
  console.log("Analytics data received:", {
    runs,
    posts: posts
      ? {
          total_distinct: posts.total_distinct,
          by_subreddit_count: posts.by_subreddit?.length,
          time_series_count: posts.time_series?.length,
          engagement: posts.engagement,
          relevance: posts.relevance,
          top_posts: posts.top_posts?.length || 0,
        }
      : null,
    extracted_engagement: engagement,
    extracted_relevance: relevance,
    extracted_top_posts: top_posts?.length || 0,
    per_run,
  });

  // Calculate derived metrics
  const successRate =
    runs.total > 0 ? Math.round((runs.completed / runs.total) * 100) : 0;
  const avgPostsPerRun = per_run?.posts_per_run?.avg || 0;
  const avgRelevance = relevance?.avg ? Math.round(relevance.avg * 100) : 0;

  return (
    <div className="p-3 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Performance Metrics</h2>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setActiveView("content")}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Back to Content
        </Button>
      </div>

      {/* Debug Info - Remove this after testing */}
      {/* <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-3">
          <h3 className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
            Debug Info
          </h3>
          <div className="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
            <div>Posts: {posts?.total_distinct || 0} total</div>
            <div>Subreddits: {posts?.by_subreddit?.length || 0} found</div>
            <div>Time Series: {posts?.time_series?.length || 0} points</div>
            <div>Top Posts: {top_posts?.length || 0} found</div>
            <div>Engagement: {engagement ? "Available" : "Missing"}</div>
            <div>Relevance: {relevance ? "Available" : "Missing"}</div>
            <div>
              Time Series Sample: {posts?.time_series?.[0]?.ts || "None"}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Posts</p>
                <p className="text-xl font-bold">
                  {posts?.total_distinct?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold">{successRate}%</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Posts/Run</p>
                <p className="text-xl font-bold">
                  {avgPostsPerRun.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics & Top Subreddits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Engagement Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Avg Upvotes
                </span>
                <span className="text-sm font-medium">
                  {engagement?.upvotes?.avg?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Avg Comments
                </span>
                <span className="text-sm font-medium">
                  {engagement?.comments?.avg?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Max Upvotes
                </span>
                <span className="text-sm font-medium">
                  {engagement?.upvotes?.max?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Max Comments
                </span>
                <span className="text-sm font-medium">
                  {engagement?.comments?.max?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Relevance Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Avg Relevance
                </span>
                <span className="text-sm font-medium">{avgRelevance}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Min Relevance
                </span>
                <span className="text-sm font-medium">
                  {relevance?.min ? Math.round(relevance.min * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Max Relevance
                </span>
                <span className="text-sm font-medium">
                  {relevance?.max ? Math.round(relevance.max * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {posts?.by_subreddit && posts.by_subreddit.length > 0 && (
          <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-3">Top Subreddits</h3>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {posts.by_subreddit
                    .sort((a: any, b: any) => b.count - a.count)
                    .map((subreddit: any, index: number) => {
                      const percentage =
                        posts.total_distinct > 0
                          ? Math.round(
                              (subreddit.count / posts.total_distinct) * 100
                            )
                          : 0;

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">
                              r/{subreddit.subreddit}
                            </span>
                            <span>
                              {subreddit.count} posts ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Time Series Chart */}
      {posts?.time_series && posts.time_series.length > 0 && (
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Posts Over Time</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={posts.time_series.slice(-14).map((item: any) => ({
                    ...item,
                    name: new Date(item.ts).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Posts */}
      {top_posts && top_posts.length > 0 && (
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Top Performing Posts</h3>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {top_posts.map((post: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium line-clamp-1 flex-1 mr-2">
                        {post.post_title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {Math.round(post.combined_relevance * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>r/{post.subreddit}</span>
                      <span>•</span>
                      <span>{post.upvotes} upvotes</span>
                      <span>•</span>
                      <span>{post.comment_count || 0} comments</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs ml-auto"
                        asChild
                      >
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Run Statistics */}
      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <h3 className="text-sm font-medium mb-3">Execution Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {runs?.total || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {runs?.completed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {runs?.scheduled || 0}
              </div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {runs?.failed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {runs?.last_completed_at && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last completed:</span>
                <span>{new Date(runs.last_completed_at).toLocaleString()}</span>
              </div>
            )}
            {runs?.next_run_at && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Next run:</span>
                <span>{new Date(runs.next_run_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Configuration Component (re-built to use backend details shape)
const ConfigurationSection = React.memo(function ConfigurationSection({
  agentId,
  setActiveView,
}: {
  agentId: string;
  setActiveView: (view: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector(selectAgentDetails);
  const detailsStatus = useSelector(selectAgentDetailsStatus);

  const [form, setForm] = React.useState<Partial<AgentDetails> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [newKeyword, setNewKeyword] = React.useState("");

  React.useEffect(() => {
    if (!agentId) return;
    dispatch(fetchAgentDetails(agentId));
  }, [agentId, dispatch]);

  React.useEffect(() => {
    if (details) {
      setForm(details);
    }
  }, [details]);

  const onChange = <K extends keyof AgentDetails>(
    key: K,
    value: AgentDetails[K]
  ) => {
    setForm((prev) => ({ ...(prev || {}), [key]: value } as AgentDetails));
  };

  const onNestedChange = (path: string[], value: any) => {
    setForm((prev) => {
      const next: any = { ...(prev || {}) };
      let ptr = next;
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        ptr[k] = ptr[k] ? { ...ptr[k] } : {};
        ptr = ptr[k];
      }
      ptr[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        agent_name: form.agent_name,
        agent_platform: form.agent_platform,
        agent_status: form.agent_status,
        goals: form.goals,
        instructions: form.instructions || "",
        expectations: form.expectations || "",
        project_id: form.project_id,
        mode: form.mode,
        review_minutes: form.review_minutes || 0,
        advanced_settings: form.advanced_settings || {},
        platform_settings: form.platform_settings || {},
        agent_keywords: form.agent_keywords || [],
        schedule: form.schedule || undefined,
      } as any;

      await dispatch(
        updateAgentDetails({ agentId, updates: payload }) as any
      ).unwrap();
    } catch (e) {
      // handled by slice error
    } finally {
      setSaving(false);
    }
  };

  if (detailsStatus === "loading" || !form) {
    return (
      <div className="p-3 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Agent Configuration</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveView("content")}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Back to Content
            </Button>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Agent Configuration</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveView("content")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Back to Content
          </Button>
        </div>

        {/* Basic Settings */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="agent_name" className="text-sm">
                  Agent Name
                </Label>
                <Input
                  id="agent_name"
                  className="h-11"
                  value={form.agent_name || ""}
                  onChange={(e) => onChange("agent_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Platform</Label>
                <Input
                  id="agent_platform"
                  className="h-11"
                  value={form.agent_platform || ""}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={form.agent_status || "active"}
                  onValueChange={(v) => onChange("agent_status", v as any)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Mode</Label>
                <Select
                  value={form.mode || "copilot"}
                  onValueChange={(v) => onChange("mode", v as any)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copilot">Copilot</SelectItem>
                    <SelectItem value="assisted">Assisted</SelectItem>
                    <SelectItem value="autonomous">Autonomous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_minutes" className="text-sm">
                  Review Minutes
                </Label>
                <Input
                  id="review_minutes"
                  type="number"
                  className="h-11"
                  value={form.review_minutes ?? 0}
                  onChange={(e) =>
                    onChange("review_minutes", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                className="min-h-[100px]"
                value={form.description || ""}
                onChange={(e) => onChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  className="min-h-[100px]"
                  value={form.instructions || ""}
                  onChange={(e) => onChange("instructions", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectations" className="text-sm">
                  Expectations
                </Label>
                <Textarea
                  id="expectations"
                  className="min-h-[100px]"
                  value={form.expectations || ""}
                  onChange={(e) => onChange("expectations", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agent Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-3 border rounded-md bg-background/60 dark:bg-card/60">
              {(form.agent_keywords || []).map((kw: string) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                >
                  {kw}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                    onClick={() =>
                      onChange(
                        "agent_keywords",
                        (form.agent_keywords || []).filter((k) => k !== kw)
                      )
                    }
                    tabIndex={-1}
                  >
                    <span className="sr-only">Remove</span>
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
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                className="h-11 flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newKeyword.trim()) {
                    e.preventDefault();
                    const currentKeywords = form.agent_keywords || [];
                    if (!currentKeywords.includes(newKeyword.trim())) {
                      onChange("agent_keywords", [
                        ...currentKeywords,
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
                  if (newKeyword.trim()) {
                    const currentKeywords = form.agent_keywords || [];
                    if (!currentKeywords.includes(newKeyword.trim())) {
                      onChange("agent_keywords", [
                        ...currentKeywords,
                        newKeyword.trim(),
                      ]);
                    }
                    setNewKeyword("");
                  }
                }}
                className="h-11 px-4"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Settings (Reddit) */}
        {form.platform_settings?.reddit !== undefined && (
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
            <h3 className="text-sm font-medium">Reddit Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="space-y-2">
                <Label className="text-sm">Subreddit</Label>
                <Input
                  className="h-11"
                  value={form.platform_settings.reddit.subreddit || ""}
                  onChange={(e) =>
                    onNestedChange(
                      ["platform_settings", "reddit", "subreddit"],
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Time Range</Label>
                <Select
                  value={form.platform_settings.reddit.timeRange || ""}
                  onValueChange={(v) =>
                    onNestedChange(
                      ["platform_settings", "reddit", "timeRange"],
                      v
                    )
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Min Upvotes</Label>
                <Input
                  type="number"
                  className="h-11"
                  value={form.platform_settings.reddit.minUpvotes || 0}
                  onChange={(e) =>
                    onNestedChange(
                      ["platform_settings", "reddit", "minUpvotes"],
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="space-y-2">
                <Label className="text-sm">Relevance Threshold</Label>
                <Input
                  type="number"
                  className="h-11"
                  value={form.platform_settings.reddit.relevanceThreshold || 0}
                  onChange={(e) =>
                    onNestedChange(
                      ["platform_settings", "reddit", "relevanceThreshold"],
                      Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between mt-8">
                <Label className="text-sm">Monitor Comments</Label>
                <Switch
                  checked={Boolean(
                    form.platform_settings.reddit.monitorComments
                  )}
                  onCheckedChange={(v) =>
                    onNestedChange(
                      ["platform_settings", "reddit", "monitorComments"],
                      v
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
          <h3 className="text-sm font-medium">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm">Type</Label>
              <Select
                value={form.schedule?.schedule_type || "daily"}
                onValueChange={(v) =>
                  onNestedChange(["schedule", "schedule_type"], v)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Time</Label>
              <Input
                type="datetime-local"
                className="h-11"
                value={
                  form.schedule?.schedule_time
                    ? form.schedule.schedule_time.toString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  onNestedChange(["schedule", "schedule_time"], e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-1">
          <Button
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
});

// Content Management Component
const ContentManagement = React.memo(function ContentManagement({
  filteredContent,
  selectedContentId,
  setSelectedContentId,
  showDetailPane,
  toggleDetailPane,
  isMobile,
  getStatusBadgeClass,
  getStatusLabel,
  isFilterExpanded,
  toggleFilterExpanded,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  agentId,
}: {
  filteredContent: DisplayPost[];
  selectedContentId: string | null;
  setSelectedContentId: (id: string) => void;
  showDetailPane: boolean;
  toggleDetailPane: () => void;
  isMobile: boolean;
  getStatusBadgeClass: (status: PostStatus) => string;
  getStatusLabel: (status: PostStatus) => string;
  isFilterExpanded: boolean;
  toggleFilterExpanded: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  agentId: string;
}) {
  const [selectedPost, setSelectedPost] = React.useState<DisplayPost | null>(
    null
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Flexbox Layout */}
      <div className="flex flex-1 min-h-0 mx-3 overflow-hidden">
        {/* Left Pane - Content Feed */}
        <div
          className={cn(
            "flex flex-col min-h-0 min-w-0 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60",
            isMobile
              ? "w-full"
              : showDetailPane
              ? "flex-[2] max-w-[600px]"
              : "flex-1"
          )}
          id="content-list-container"
        >
          {/* Search Bar - Inside the scrollable container */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60">
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search posts, keywords, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-10 h-9 text-sm bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    title="Filter by Status"
                  >
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      All Status
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Pending
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Approved
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("needs_review")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Needs Review
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("discarded")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Discarded
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("escalated")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Escalated
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("processed")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      Processed
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Failed
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort By */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    title="Sort Posts"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setSortBy("relevance")}>
                    <Hash className="h-4 w-4 mr-2" />
                    Most Relevant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("most_comments")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Most Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("least_comments")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Least Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("most_upvotes")}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Most Upvotes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("least_upvotes")}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Least Upvotes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content List - Infinite Scroll */}
          <div
            className="flex-1 overflow-y-auto min-h-0"
            id="content-list-scroll-area"
          >
            <InfinitePostsList
              agentId={agentId}
              searchQuery={searchQuery}
              sortBy={sortBy}
              statusFilter={statusFilter}
              selectedContentId={selectedContentId}
              onSelectContent={setSelectedContentId}
              onSelectedPostChange={setSelectedPost}
              showDetailPane={showDetailPane}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
              ContentListItem={ContentListItem}
            />
          </div>
        </div>

        {/* Right Pane - Content Details (Desktop) */}
        {showDetailPane && !isMobile && selectedContentId && selectedPost && (
          <div className="flex flex-col min-w-0 min-h-0 ml-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60 overflow-hidden flex-[3]">
            <ContentDetails
              selectedContentId={selectedContentId}
              selectedPost={selectedPost}
              agentId={agentId}
              toggleDetailPane={toggleDetailPane}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </div>
        )}
      </div>

      {/* Mobile Detail View - Only shown on mobile devices */}
      {showDetailPane && selectedContentId && selectedPost && isMobile && (
        <div className="mt-2 mx-3 mb-3 bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <ContentDetails
            selectedContentId={selectedContentId}
            selectedPost={selectedPost}
            agentId={agentId}
            toggleDetailPane={toggleDetailPane}
            getStatusBadgeClass={getStatusBadgeClass}
            getStatusLabel={getStatusLabel}
          />
        </div>
      )}
    </div>
  );
});

export default function IndividualAgentPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const displayPosts = useSelector(selectDisplayPosts);
  const agentType = useSelector(selectAgentType);
  const agentData = useSelector(selectAgentData);
  const agentState = useSelector(selectAgentState);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(
    agentData?.agent_name || "Hexnode Reddit Lead Finder"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDetailPane, setShowDetailPane] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [showAgentStats, setShowAgentStats] = useState(false);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [activeView, setActiveView] = useState("content");

  const [hasInitialData, setHasInitialData] = useState(false);

  // Update useEffect to handle loading state and prevent repeated calls
  useEffect(() => {
    const fetchData = async () => {
      // Skip if already loading or has data
      if (isLoading || hasInitialData) return;

      setIsLoading(true);
      try {
        console.log("Dispatching fetchAgentData for agentId:", agentId);
        await dispatch(fetchAgentData(agentId));
        setHasInitialData(true);
      } catch (error) {
        console.error("Failed to fetch agent data:", error);
        // Add error state handling here if needed
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchData();
    }
  }, [dispatch, agentId, isLoading, hasInitialData]); // Include isLoading to prevent double fetches

  // Debounced search to improve performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize the search suggestions function
  const getSearchSuggestions = React.useCallback(
    (query: string) => {
      const suggestions = [];

      // Author suggestions
      const authors = [...new Set(displayPosts.map((item) => item.author))];
      const matchingAuthors = authors
        .filter((author) => author.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2);

      matchingAuthors.forEach((author) => {
        suggestions.push({
          type: "author",
          label: `Author: ${author}`,
          query: `author:${author}`,
          count: displayPosts.filter((item) => item.author === author).length,
        });
      });

      // Keyword suggestions
      const allKeywords = displayPosts.flatMap((item) => item.keywords);
      const uniqueKeywords = [...new Set(allKeywords)];
      const matchingKeywords = uniqueKeywords
        .filter((keyword) =>
          keyword.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3);

      matchingKeywords.forEach((keyword) => {
        suggestions.push({
          type: "keyword",
          label: keyword,
          query: keyword,
          count: displayPosts.filter((item) => item.keywords.includes(keyword))
            .length,
        });
      });

      // Status suggestions
      if ("pending".includes(query.toLowerCase())) {
        suggestions.push({
          type: "status",
          label: "Status: Pending",
          query: "status:pending",
          count: displayPosts.filter((item) => item.status === "pending")
            .length,
        });
      }

      return suggestions.slice(0, 5);
    },
    [displayPosts]
  );

  // Add this style tag for the scrollbar hiding
  React.useEffect(() => {
    // Add the style to hide scrollbars
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Memoize the filtered content calculation
  const filteredContent = React.useMemo(() => {
    let filtered = displayPosts.filter((item) => {
      // Apply status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Apply search filter - simple text search in title and content
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Apply sorting
    // Parse time strings for comparison (assuming format like "2 hours ago", "5 mins ago")
    const getTimeValue = (timeStr: string) => {
      if (timeStr.includes("min")) {
        return parseInt(timeStr);
      } else if (timeStr.includes("hour")) {
        return parseInt(timeStr) * 60;
      } else if (timeStr.includes("day")) {
        return parseInt(timeStr) * 60 * 24;
      }
      return 0;
    };

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return (b.relevance || 0) - (a.relevance || 0);

        case "newest":
          return getTimeValue(a.time) - getTimeValue(b.time);

        case "oldest":
          return getTimeValue(b.time) - getTimeValue(a.time);

        case "most_comments":
          return (
            parseInt(b.comments.toString()) - parseInt(a.comments.toString())
          );

        case "least_comments":
          return (
            parseInt(a.comments.toString()) - parseInt(b.comments.toString())
          );

        case "most_upvotes":
          return (
            parseInt(b.upvotes.toString()) - parseInt(a.upvotes.toString())
          );

        case "least_upvotes":
          return (
            parseInt(a.upvotes.toString()) - parseInt(b.upvotes.toString())
          );

        default:
          return (b.relevance || 0) - (a.relevance || 0);
      }
    });

    return filtered;
  }, [displayPosts, statusFilter, debouncedSearchQuery, sortBy]);

  // Memoize the selected content
  const selectedContent = React.useMemo(() => {
    return (
      filteredContent.find((item) => item.id === selectedContentId) ||
      filteredContent[0]
    );
  }, [filteredContent, selectedContentId]);

  // Memoize the agent object
  const agent = React.useMemo(
    () => ({
      id: agentId,
      name: agentData?.agent_name || editedName,
      platform: agentType,
      status: agentState,
      lastActive: "5 mins ago",
      keyMetric: {
        value: displayPosts.length.toString(),
        label: "Posts Found",
      },
      secondaryMetric: {
        value: agentData?.goals?.length?.toString() || "0",
        label: "Goals",
      },
      healthScore: 90,
      weeklyActivity: displayPosts.length,
      description:
        agentData?.description ||
        "Identifies potential leads by monitoring relevant subreddits.",
    }),
    [agentId, agentData, editedName, agentType, agentState, displayPosts.length]
  );

  const toggleAgentStatus = React.useCallback(async () => {
    try {
      const newStatus = agentState === "active" ? "paused" : "active";
      await dispatch(updateAgentStatus({ agentId, status: newStatus }));
    } catch (error) {
      console.error("Failed to update agent status:", error);
    }
  }, [agentState, dispatch, agentId]);

  const saveAgentName = React.useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDeleteAgent = React.useCallback(() => {
    setIsDeleteDialogOpen(false);
    router.push("/projects/1/agents");
  }, [router]);

  const toggleDetailPane = React.useCallback(() => {
    setShowDetailPane(!showDetailPane);
  }, [showDetailPane]);

  const toggleFilterExpanded = React.useCallback(() => {
    setIsFilterExpanded(!isFilterExpanded);
  }, [isFilterExpanded]);

  const toggleAgentStats = React.useCallback(() => {
    setShowAgentStats(!showAgentStats);
  }, [showAgentStats]);

  const togglePerformance = React.useCallback(() => {
    setIsPerformanceExpanded(!isPerformanceExpanded);
  }, [isPerformanceExpanded]);

  const toggleConfig = React.useCallback(() => {
    setIsConfigExpanded(!isConfigExpanded);
  }, [isConfigExpanded]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Loading agent details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If this is a HackerNews agent, render the HN view with dummy data for now
  if (agentType === "hackernews") {
    const dummyStories = (HN_FINAL as any[]).map((it) => ({
      id: Number(it.id),
      title: typeof it.title === "string" ? it.title : "(no title)",
      url: it.url ?? null,
      score: typeof it.score === "number" ? it.score : 0,
      time: typeof it.time === "number" ? it.time : undefined,
    	descendants: Array.isArray(it.children) ? it.children.length : 0,
    	children: Array.isArray(it.children) ? it.children : [],
    	relevant_comment_ids: Array.isArray(it.relevant_comment_ids)
    	  ? it.relevant_comment_ids
    	  : [],
    }));

    return (
      <Layout>
        <div className="h-[calc(100vh-80px)]">
          <HackerNewsView stories={dummyStories} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Navigation Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-1 flex-shrink-0 bg-white dark:bg-gray-900/60">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Agent Info and Search in Same Line */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Agent Name and Status - Compact */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                  {agent.platform === "reddit" && (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  )}
                  {agent.platform === "twitter" && (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {agent.platform === "mixed" && (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">{agent.name}</h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5 h-5",
                      agent.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                        : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        agent.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      )}
                    />
                    {agent.status === "active" ? "Active" : "Paused"}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {displayPosts.length} posts
                  </span>
                </div>
              </div>

              {/* Spacer for layout balance */}
              <div className="flex-1" />
            </div>

            {/* Right Side - View Selector and Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Quick Stats - Only show on larger screens */}
              <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last active {agent.lastActive}</span>
                </div>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={activeView === "content" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    activeView === "content"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setActiveView("content")}
                  title="Content"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === "performance" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    activeView === "performance"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setActiveView("performance")}
                  title="Analytics"
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === "config" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    activeView === "config"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-primary hover:bg-primary/10 hover:text-primary"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setActiveView("config")}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Agent Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleAgentStatus}>
                    <div className="flex items-center gap-2">
                      {agent.status === "active" ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          Pause Agent
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Activate Agent
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Agent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 max-w-full overflow-hidden">
          {/* Content Management Section */}
          {activeView === "content" && (
            <ContentManagement
              filteredContent={filteredContent}
              selectedContentId={selectedContentId}
              setSelectedContentId={setSelectedContentId}
              showDetailPane={showDetailPane}
              toggleDetailPane={toggleDetailPane}
              isMobile={isMobile}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
              isFilterExpanded={isFilterExpanded}
              toggleFilterExpanded={toggleFilterExpanded}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              agentId={agentId}
            />
          )}

          {/* Performance Section */}
          {activeView === "performance" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <PerformanceMetrics
                setActiveView={setActiveView}
                agentId={agentId}
              />
            </div>
          )}

          {/* Configuration Section */}
          {activeView === "config" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <ConfigurationSection
                agentId={agentId}
                setActiveView={setActiveView}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ContentDetails Component
interface ContentDetailsProps {
  selectedContentId: string;
  selectedPost: DisplayPost;
  agentId: string;
  toggleDetailPane: () => void;
  getStatusBadgeClass: (status: PostStatus) => string;
  getStatusLabel: (status: PostStatus) => string;
}

const ContentDetails = React.memo(function ContentDetails({
  selectedContentId,
  selectedPost,
  agentId,
  toggleDetailPane,
  getStatusBadgeClass,
  getStatusLabel,
}: ContentDetailsProps) {
  const isMobile = useIsMobile();
  const detailContainerRef = React.useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = React.useState(0);

  // Measure parent width and update markdown max-width
  React.useEffect(() => {
    const measureParentWidth = () => {
      if (detailContainerRef.current) {
        const width = detailContainerRef.current.offsetWidth;
        setParentWidth(width);
      }
    };

    // Initial measurement
    measureParentWidth();

    // Measure on resize
    const resizeObserver = new ResizeObserver(measureParentWidth);
    if (detailContainerRef.current) {
      resizeObserver.observe(detailContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate max-width for markdown content
  const markdownMaxWidth = React.useMemo(() => {
    if (parentWidth === 0) return "100%";
    // Set markdown max-width to 90% of parent width with some padding
    const calculatedWidth = parentWidth - 48; // Account for padding
    return `${Math.max(calculatedWidth, 200)}px`; // Minimum 200px
  }, [parentWidth]);

  // Use the selected post data passed from the parent component
  const content = selectedPost;

  // Early return for loading state
  if (!selectedContentId) {
    return null;
  }

  // Show loading state while content is being fetched
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <h3 className="text-sm font-medium mb-1">Loading content...</h3>
          <p className="text-xs text-muted-foreground">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={detailContainerRef} className="flex flex-col h-full">
      {/* Detail Header - Fixed */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Content Details</h3>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-0",
                  getStatusBadgeClass(content.status)
                )}
              >
                {getStatusLabel(content.status)}
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50 text-xs px-1.5 py-0"
              >
                #{(content as any).subreddit || "reddit"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleDetailPane}
              >
                {isMobile ? (
                  <XIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-0.5 rounded-full">
              <div className="h-3.5 w-3.5 flex items-center justify-center font-bold text-xs">
                R
              </div>
            </div>
            <span className="font-medium">
              r/{(content as any).subreddit || "reddit"}
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs flex items-center gap-1"
              asChild
            >
              <a href={content.url} target="_blank" rel="noopener noreferrer">
                View Original
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Content - Scrollable */}
      <div
        className={cn(
          "flex-1 overflow-y-auto min-h-0",
          isMobile && "max-h-[50vh]"
        )}
      >
        <div className="p-3 space-y-4">
          {/* Original Content */}
          <div className="w-full">
            {/* <h4 className="text-sm font-medium mb-1.5">Original Content</h4> */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-base">u/{"Unknown"}</span>
                <span className="text-sm text-muted-foreground">
                  {content.time}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-3">{content.title}</h3>
              <div
                className="prose prose-invert overflow-hidden overflow-x-auto"
                style={{
                  maxWidth: markdownMaxWidth,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <MarkdownRender content={content?.content || ""} />
              </div>
            </div>
          </div>

          {/* Response Composer - only if not discarded */}
          {content.status !== "discarded" && (
            <div className="w-full mt-4">
              <ResponseComposer
                post={{
                  id: content.id,
                  title: content.title,
                  body: content.content,
                  author: content.author,
                  subreddit: content.subreddit || content.tag || "reddit",
                  url: content.url,
                }}
                agentId={agentId}
                // TODO: Implement onSend to handle reply submission
                onSend={(markdown) => {
                  // Handle reply submission here
                  // e.g., call an API or update state
                  console.log("Reply sent:", markdown);
                }}
              />
            </div>
          )}

          {/* Discarded Reason */}
          {content.status === "discarded" && (
            <div>
              <h4 className="text-sm font-medium mb-1.5 flex items-center">
                <XIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Discarded
              </h4>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-muted-foreground">
                  This content was discarded because it was deemed not relevant
                  enough for a response.
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Discarded yesterday by AI Agent</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed */}
      {content.status !== "discarded" && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div
            className={cn(
              "flex gap-2",
              isMobile ? "grid grid-cols-2" : "flex-wrap"
            )}
          >
            {content.status === "pending" && (
              <Button
                className={cn("gap-1.5 h-8 text-xs", isMobile && "col-span-2")}
              >
                <CheckIcon className="h-3.5 w-3.5" />
                Approve & Post
              </Button>
            )}
            {(content.status === "pending" ||
              content.status === "needs_review") && (
              <Button variant="outline" className="gap-1.5 h-8 text-xs">
                <XIcon className="h-3.5 w-3.5" />
                Reject
              </Button>
            )}
            {content.status !== "escalated" && (
              <Button variant="outline" className="gap-1.5 h-8 text-xs">
                <UserPlusIcon className="h-3.5 w-3.5" />
                Escalate
              </Button>
            )}
            {!isMobile && (
              <>
                <Button variant="outline" className="gap-1.5 h-8 text-xs">
                  <FlagIcon className="h-3.5 w-3.5" />
                  Flag
                </Button>
                <Button variant="outline" className="gap-1.5 h-8 text-xs">
                  <ShareIcon className="h-3.5 w-3.5" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// ContentListItem Component for optimized rendering
interface ContentListItemProps {
  item: DisplayPost;
  isSelected: boolean;
  onSelect: (id: string) => void;
  showDetailPane: boolean;
  getStatusBadgeClass: (status: PostStatus) => string;
  getStatusLabel: (status: PostStatus) => string;
}

const ContentListItem = React.memo(function ContentListItem({
  item,
  isSelected,
  onSelect,
  showDetailPane,
  getStatusBadgeClass,
  getStatusLabel,
}: ContentListItemProps) {
  const handleClick = React.useCallback(() => {
    if (showDetailPane) {
      onSelect(item.id);
    } else {
      // Open in new tab if details are hidden
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }, [showDetailPane, onSelect, item.id, item.url]);

  const handleExternalLinkClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={cn(
        "p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 w-full min-w-0",
        isSelected &&
          "bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400"
      )}
      onClick={handleClick}
      id="content-list-item"
    >
      <div
        className="flex items-center gap-1 mb-1 w-full min-w-0"
        id="content-list-item-header"
      >
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-0.5 rounded-full flex-shrink-0">
          <div className="h-4 w-4 flex items-center justify-center font-bold text-xs">
            R
          </div>
        </div>
        {item.platform === "reddit" && (
          <span className="text-xs font-medium truncate min-w-0 max-w-[120px]">
            r/{item.subreddit || item.tag}
          </span>
        )}
        <div
          className={cn(
            "ml-auto px-1.5 py-0.5 rounded-full text-xs flex-shrink-0",
            getStatusBadgeClass(item.status)
          )}
        >
          {getStatusLabel(item.status)}
        </div>
      </div>

      {/* Post Title */}
      <h4 className="text-sm font-medium mb-1 line-clamp-1 w-full min-w-0 break-words overflow-hidden">
        {item.title}
      </h4>

      {/* Post Content */}
      {/* <p className="text-xs leading-tight line-clamp-2 mb-1 text-muted-foreground break-words whitespace-normal overflow-hidden w-full min-w-0">
        {item.content}
      </p> */}

      <div className="flex items-center text-xs text-muted-foreground w-full min-w-0">
        <span className="font-medium truncate max-w-[80px]">
          u/{item.author}
        </span>
        <span className="mx-1 flex-shrink-0">•</span>
        <span className="flex-shrink-0">{item.time}</span>

        {/* Comments and Upvotes */}
        <div className="flex items-center gap-2 ml-auto mr-1 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3 flex-shrink-0" />
            <span className="min-w-0">{item.comments}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
            <span className="min-w-0">{item.upvotes}</span>
          </div>
        </div>

        {/* External Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          onClick={handleExternalLinkClick}
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
});
