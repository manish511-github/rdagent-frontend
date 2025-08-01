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
import MarkdownRender from "../markdown-render";
import ResponseComposer from "./response-generator";
import { InfinitePostsList } from "./infinite-posts-list";

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
}: {
  setActiveView: (view: string) => void;
}) {
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

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Response Rate</p>
                <p className="text-xl font-bold">
                  {performanceData.responseRate}%
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">
                  {performanceData.conversionRate}%
                </p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-xl font-bold">
                  {performanceData.averageResponseTime}
                </p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <h3 className="text-sm font-medium mb-3">Weekly Engagement Trends</h3>
          <div className="h-40 flex items-end justify-between gap-1">
            {performanceData.weeklyEngagement.map((value, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <div
                  className="w-8 bg-blue-500 dark:bg-blue-600 rounded-t-sm"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs mt-1">D{index + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform & Sentiment Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Platform Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(performanceData.platformBreakdown).map(
                ([platform, percentage]) => (
                  <div key={platform} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize">{platform}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          platform === "reddit"
                            ? "bg-orange-500"
                            : platform === "twitter"
                            ? "bg-blue-400"
                            : "bg-blue-700"
                        )}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-3">Sentiment Analysis</h3>
            <div className="space-y-2">
              {Object.entries(performanceData.sentimentAnalysis).map(
                ([sentiment, percentage]) => (
                  <div key={sentiment} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize">{sentiment}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          sentiment === "positive"
                            ? "bg-green-500"
                            : sentiment === "neutral"
                            ? "bg-gray-400"
                            : "bg-red-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <h3 className="text-sm font-medium mb-3">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {performanceData.topKeywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Configuration Component
const ConfigurationSection = React.memo(function ConfigurationSection({
  agent,
  setActiveView,
}: {
  agent: any;
  setActiveView: (view: string) => void;
}) {
  return (
    <div className="p-3 space-y-4 overflow-y-auto">
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

      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name" className="text-sm">
              Agent Name
            </Label>
            <Input id="agent-name" defaultValue={agent.name} className="h-9" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="agent-description"
              defaultValue={agent.description}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Platform</Label>
            <Select defaultValue={agent.platform}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Agent Mode</Label>
            <Select defaultValue="assisted">
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assisted">
                  Assisted (Requires Approval)
                </SelectItem>
                <SelectItem value="autonomous">Autonomous</SelectItem>
                <SelectItem value="learning">Learning Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-respond" className="text-sm cursor-pointer">
              Auto-Respond to Mentions
            </Label>
            <Switch id="auto-respond" defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm cursor-pointer">
              Email Notifications
            </Label>
            <Switch id="notifications" defaultChecked={true} />
          </div>

          <div className="pt-2">
            <Button className="w-full">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-medium">Advanced Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="max-responses" className="text-sm">
              Maximum Daily Responses
            </Label>
            <Input
              id="max-responses"
              type="number"
              defaultValue="50"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence-threshold" className="text-sm">
              Confidence Threshold (%)
            </Label>
            <Input
              id="confidence-threshold"
              type="number"
              defaultValue="75"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Minimum confidence score required for auto-approval
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Response Tone</Label>
            <Select defaultValue="professional">
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 border-red-200 dark:border-red-800/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            These actions cannot be undone. Please be certain.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Reset Agent
            </Button>
            <Button
              variant="outline"
              className="border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Delete Agent
            </Button>
          </div>
        </CardContent>
      </Card>
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
  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and Filters */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-9 text-sm w-full"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs flex-1 md:flex-none md:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="discarded">Discarded</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-xs flex-1 md:flex-none md:w-[140px]">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_comments">Most Comments</SelectItem>
                <SelectItem value="least_comments">Least Comments</SelectItem>
                <SelectItem value="most_upvotes">Most Upvotes</SelectItem>
                <SelectItem value="least_upvotes">Least Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Flexbox Layout */}
      <div className="flex flex-1 min-h-0 mx-3 overflow-hidden">
        {/* Left Pane - Content Feed */}
        <div
          className={cn(
            "flex flex-col min-h-0 min-w-0 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/60",
            isMobile
              ? "w-full"
              : showDetailPane
              ? "flex-[2] max-w-[500px]"
              : "flex-1"
          )}
          id="content-list-container"
        >
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "MDM solutions",
    "Hexnode",
    "competitor mention",
  ]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
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

  React.useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Save search to recent when user presses Enter
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && searchQuery && isSearchFocused) {
        setRecentSearches((prev) => {
          const updated = [
            searchQuery,
            ...prev.filter((s) => s !== searchQuery),
          ].slice(0, 5);
          return updated;
        });
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [searchQuery, isSearchFocused]);

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

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Navigation Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-3 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{agent.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5",
                  agent.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50"
                )}
              >
                {agent.status === "active" ? "Active" : "Paused"}
              </Badge>
            </div>

            {/* View Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={activeView === "content" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs",
                  activeView !== "content" &&
                    "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveView("content")}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Content
              </Button>
              <Button
                variant={activeView === "performance" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs",
                  activeView !== "performance" &&
                    "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveView("performance")}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Performance
              </Button>
              <Button
                variant={activeView === "config" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs",
                  activeView !== "config" &&
                    "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveView("config")}
              >
                <Settings className="h-3.5 w-3.5" />
                Config
              </Button>
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
              <PerformanceMetrics setActiveView={setActiveView} />
            </div>
          )}

          {/* Configuration Section */}
          {activeView === "config" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <ConfigurationSection
                agent={agent}
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
