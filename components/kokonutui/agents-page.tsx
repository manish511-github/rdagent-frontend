"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Bot,
  Brain,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PlatformIcon } from "./platform-icons"
import Layout from "./layout"
import { cn } from "@/lib/utils"

// Mock data for agents
const mockAgents = [
  {
    id: "1",
    name: "Hexnode Reddit Lead Finder",
    platform: "reddit",
    status: "active",
    goal: "lead_generation",
    lastActive: "5 mins ago",
    keyMetric: {
      value: "25",
      label: "Leads Today",
      trend: "+12%",
    },
    secondaryMetric: {
      value: "142",
      label: "Posts Monitored",
    },
    description:
      "Identifies potential leads by monitoring relevant subreddits and engaging with users showing interest in MDM solutions.",
    performance: 85,
    messages: 128,
    engagement: 76,
    conversions: 24,
    rating: 4.8,
  },
  {
    id: "2",
    name: "LinkedIn Thought Leader",
    platform: "linkedin",
    status: "active",
    goal: "brand_awareness",
    lastActive: "1 hour ago",
    keyMetric: {
      value: "12",
      label: "New Followers",
      trend: "+8%",
    },
    secondaryMetric: {
      value: "8",
      label: "Posts Published",
    },
    description:
      "Shares industry insights and engages with relevant content to establish brand authority in the MDM space.",
    performance: 92,
    messages: 256,
    engagement: 64,
    conversions: 18,
    rating: 4.9,
  },
  {
    id: "3",
    name: "Twitter Support Bot",
    platform: "twitter",
    status: "paused",
    goal: "support",
    lastActive: "Yesterday",
    keyMetric: {
      value: "15",
      label: "Tickets Resolved",
      trend: "-5%",
    },
    secondaryMetric: {
      value: "95%",
      label: "Resolution Rate",
    },
    description:
      "Monitors Twitter for customer support requests and provides initial responses and escalation when needed.",
    performance: 78,
    messages: 64,
    engagement: 42,
    conversions: 8,
    rating: 4.5,
  },
  {
    id: "4",
    name: "Instagram Content Promoter",
    platform: "instagram",
    status: "active",
    goal: "engagement",
    lastActive: "3 hours ago",
    keyMetric: {
      value: "87%",
      label: "Engagement Rate",
      trend: "+15%",
    },
    secondaryMetric: {
      value: "1.5K",
      label: "Interactions",
    },
    description: "Promotes visual content and engages with followers to increase brand visibility and engagement.",
    performance: 94,
    messages: 312,
    engagement: 89,
    conversions: 32,
    rating: 4.7,
  },
  {
    id: "5",
    name: "Email Campaign Manager",
    platform: "email",
    status: "error",
    goal: "lead_generation",
    lastActive: "2 days ago",
    keyMetric: {
      value: "3.2%",
      label: "Conversion Rate",
      trend: "-2%",
    },
    secondaryMetric: {
      value: "15K",
      label: "Emails Sent",
    },
    description: "Manages email campaigns, analyzes performance, and optimizes for better conversion rates.",
    performance: 45,
    messages: 96,
    engagement: 38,
    conversions: 12,
    rating: 3.8,
  },
  {
    id: "6",
    name: "Reddit Community Manager",
    platform: "reddit",
    status: "pending",
    goal: "engagement",
    lastActive: "Not active yet",
    keyMetric: {
      value: "0",
      label: "Interactions",
      trend: "—",
    },
    description: "Will manage and grow our Reddit community by posting relevant content and engaging with members.",
    performance: 0,
    messages: 0,
    engagement: 0,
    conversions: 0,
    rating: 0,
  },
]

// Platform options for the form
const platformOptions = [
  { value: "reddit", label: "Reddit", icon: "reddit" },
  { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { value: "twitter", label: "Twitter", icon: "twitter" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "tiktok", label: "TikTok", icon: "tiktok" },
]

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
]

// Helper functions
const getPlatformGradient = (platform: string) => {
  switch (platform) {
    case "reddit":
      return "from-orange-500 to-red-600"
    case "linkedin":
      return "from-blue-600 to-blue-800"
    case "twitter":
      return "from-sky-400 to-blue-600"
    case "instagram":
      return "from-purple-500 to-pink-600"
    case "email":
      return "from-emerald-500 to-teal-600"
    default:
      return "from-gray-500 to-gray-700"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "paused":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
    case "error":
      return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400"
    case "pending":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400"
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
  }
}

const getGoalIcon = (goal: string) => {
  switch (goal) {
    case "lead_generation":
      return Users
    case "brand_awareness":
      return Eye
    case "engagement":
      return MessageSquare
    case "support":
      return Shield
    default:
      return Target
  }
}

// Add platform settings types
type PlatformSettings = {
  reddit?: {
    subreddit: string;
    timeRange: string;
    relevanceThreshold: number;
    minUpvotes: number;
    monitorComments: boolean;
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
  };
};

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState(mockAgents)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    instructions: "",
    expectations: "",
    platform: "reddit",
    mode: "copilot",
    reviewPeriod: "weekly",
    reviewMinutes: "0",
    advancedSettings: {},
    platformSettings: {} as PlatformSettings,
  })

  // Filter agents based on search query and filters
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = filterPlatform === "all" || agent.platform === filterPlatform
    const matchesStatus = filterStatus === "all" || agent.status === filterStatus

    return matchesSearch && matchesPlatform && matchesStatus
  })

  // Toggle agent status
  const toggleAgentStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, status: agent.status === "active" ? "paused" : "active" } : agent,
      ),
    )
  }

  // Navigate to agent detail page
  const navigateToAgentDetail = (agentId: string) => {
    router.push(`/projects/1/agents/${agentId}`)
  }

  // Reset form data when modal is closed
  useEffect(() => {
    if (!isCreateModalOpen) {
      setFormData({
        name: "",
        goal: "",
        instructions: "",
        expectations: "",
        platform: "reddit",
        mode: "copilot",
        reviewPeriod: "weekly",
        reviewMinutes: "0",
        advancedSettings: {},
        platformSettings: {} as PlatformSettings,
      })
      setCurrentStep(1)
    }
  }, [isCreateModalOpen])

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle advanced settings changes
  const handleAdvancedSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
        [field]: value,
      },
    }))
  }

  // Handle platform settings changes
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
    }))
  }

  // Go to next step in the form
  const goToNextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  // Go to previous step in the form
  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Create a new agent
  const createAgent = () => {
    const newAgent = {
      id: (agents.length + 1).toString(),
      name: formData.name,
      platform: formData.platform,
      status: "active" as const,
      goal: formData.goal,
      lastActive: "Just now",
      keyMetric: {
        value: "0",
        label: "Starting up...",
        trend: "—",
      },
      description: formData.instructions,
      performance: 0,
      messages: 0,
      engagement: 0,
      conversions: 0,
      rating: 0,
    }

    setAgents([...agents, newAgent])
    setIsCreateModalOpen(false)
  }

  // Calculate total stats
  const totalActive = agents.filter((a) => a.status === "active").length
  const totalMessages = agents.reduce((sum, a) => sum + a.messages, 0)
  const totalEngagement = agents.reduce((sum, a) => sum + a.engagement, 0)
  const totalConversions = agents.reduce((sum, a) => sum + a.conversions, 0)
  const avgPerformance = Math.round(agents.reduce((sum, a) => sum + a.performance, 0) / agents.length)

  // Add renderPlatformSettings function
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
                  onChange={(e) => handlePlatformSettingChange("subreddit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.reddit?.timeRange || ""}
                  onValueChange={(value) => handlePlatformSettingChange("timeRange", value)}
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
                  <Label htmlFor="relevanceThreshold">Relevance Threshold</Label>
                </div>
                <Input
                  id="relevanceThreshold"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={formData.platformSettings.reddit?.relevanceThreshold || ""}
                  onChange={(e) => handlePlatformSettingChange("relevanceThreshold", e.target.value)}
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
                  onChange={(e) => handlePlatformSettingChange("minUpvotes", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="monitorComments"
                checked={formData.platformSettings.reddit?.monitorComments || false}
                onCheckedChange={(checked) => handlePlatformSettingChange("monitorComments", checked)}
              />
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="monitorComments">Also check keywords in comments</Label>
              </div>
            </div>
          </div>
        );
      case "twitter":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="keywords">Keywords / Hashtags</Label>
                </div>
                <Input
                  id="keywords"
                  placeholder="Enter keywords or hashtags"
                  value={formData.platformSettings.twitter?.keywords || ""}
                  onChange={(e) => handlePlatformSettingChange("keywords", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountsToMonitor">Accounts to Monitor</Label>
                </div>
                <Input
                  id="accountsToMonitor"
                  placeholder="Enter account handles"
                  value={formData.platformSettings.twitter?.accountsToMonitor || ""}
                  onChange={(e) => handlePlatformSettingChange("accountsToMonitor", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.twitter?.timeRange || ""}
                  onValueChange={(value) => handlePlatformSettingChange("timeRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Past Hour</SelectItem>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minEngagement">Minimum Engagement</Label>
                </div>
                <Input
                  id="minEngagement"
                  type="number"
                  min="0"
                  placeholder="Min likes/retweets"
                  value={formData.platformSettings.twitter?.minEngagement || ""}
                  onChange={(e) => handlePlatformSettingChange("minEngagement", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="language">Language Filter</Label>
                </div>
                <Select
                  value={formData.platformSettings.twitter?.language || ""}
                  onValueChange={(value) => handlePlatformSettingChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sentiment">Sentiment Filter</Label>
                </div>
                <Select
                  value={formData.platformSettings.twitter?.sentiment || ""}
                  onValueChange={(value) => handlePlatformSettingChange("sentiment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "instagram":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="keywords">Keywords / Hashtags</Label>
                </div>
                <Input
                  id="keywords"
                  placeholder="Enter keywords or hashtags"
                  value={formData.platformSettings.instagram?.keywords || ""}
                  onChange={(e) => handlePlatformSettingChange("keywords", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountsToMonitor">Accounts to Monitor</Label>
                </div>
                <Input
                  id="accountsToMonitor"
                  placeholder="Enter account handles"
                  value={formData.platformSettings.instagram?.accountsToMonitor || ""}
                  onChange={(e) => handlePlatformSettingChange("accountsToMonitor", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.instagram?.timeRange || ""}
                  onValueChange={(value) => handlePlatformSettingChange("timeRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Past Hour</SelectItem>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minEngagement">Minimum Engagement</Label>
                </div>
                <Input
                  id="minEngagement"
                  type="number"
                  min="0"
                  placeholder="Min likes/comments"
                  value={formData.platformSettings.instagram?.minEngagement || ""}
                  onChange={(e) => handlePlatformSettingChange("minEngagement", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="contentType">Content Type</Label>
                </div>
                <Select
                  value={formData.platformSettings.instagram?.contentType || ""}
                  onValueChange={(value) => handlePlatformSettingChange("contentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sentiment">Sentiment Filter</Label>
                </div>
                <Select
                  value={formData.platformSettings.instagram?.sentiment || ""}
                  onValueChange={(value) => handlePlatformSettingChange("sentiment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "linkedin":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="keywords">Keywords / Hashtags</Label>
                </div>
                <Input
                  id="keywords"
                  placeholder="Enter keywords or hashtags"
                  value={formData.platformSettings.linkedin?.keywords || ""}
                  onChange={(e) => handlePlatformSettingChange("keywords", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountsToMonitor">Accounts to Monitor</Label>
                </div>
                <Input
                  id="accountsToMonitor"
                  placeholder="Enter company or profile names"
                  value={formData.platformSettings.linkedin?.accountsToMonitor || ""}
                  onChange={(e) => handlePlatformSettingChange("accountsToMonitor", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.linkedin?.timeRange || ""}
                  onValueChange={(value) => handlePlatformSettingChange("timeRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minEngagement">Minimum Engagement</Label>
                </div>
                <Input
                  id="minEngagement"
                  type="number"
                  min="0"
                  placeholder="Min reactions/comments"
                  value={formData.platformSettings.linkedin?.minEngagement || ""}
                  onChange={(e) => handlePlatformSettingChange("minEngagement", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="contentType">Content Type</Label>
                </div>
                <Select
                  value={formData.platformSettings.linkedin?.contentType || ""}
                  onValueChange={(value) => handlePlatformSettingChange("contentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="industryFilter">Industry / Job Role Filter</Label>
                </div>
                <Input
                  id="industryFilter"
                  placeholder="Enter industries or job roles"
                  value={formData.platformSettings.linkedin?.industryFilter || ""}
                  onChange={(e) => handlePlatformSettingChange("industryFilter", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case "tiktok":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="keywords">Keywords / Hashtags</Label>
                </div>
                <Input
                  id="keywords"
                  placeholder="Enter keywords or hashtags"
                  value={formData.platformSettings.tiktok?.keywords || ""}
                  onChange={(e) => handlePlatformSettingChange("keywords", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountsToMonitor">Accounts to Monitor</Label>
                </div>
                <Input
                  id="accountsToMonitor"
                  placeholder="Enter creator handles"
                  value={formData.platformSettings.tiktok?.accountsToMonitor || ""}
                  onChange={(e) => handlePlatformSettingChange("accountsToMonitor", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="timeRange">Time Range</Label>
                </div>
                <Select
                  value={formData.platformSettings.tiktok?.timeRange || ""}
                  onValueChange={(value) => handlePlatformSettingChange("timeRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Past Hour</SelectItem>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="minEngagement">Minimum Engagement</Label>
                </div>
                <Input
                  id="minEngagement"
                  type="number"
                  min="0"
                  placeholder="Min likes/views/comments"
                  value={formData.platformSettings.tiktok?.minEngagement || ""}
                  onChange={(e) => handlePlatformSettingChange("minEngagement", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="contentType">Content Type</Label>
                </div>
                <Select
                  value={formData.platformSettings.tiktok?.contentType || ""}
                  onValueChange={(value) => handlePlatformSettingChange("contentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="soundFilter">Sound / Trend Filter</Label>
                </div>
                <Input
                  id="soundFilter"
                  placeholder="Enter sound or trend names"
                  value={formData.platformSettings.tiktok?.soundFilter || ""}
                  onChange={(e) => handlePlatformSettingChange("soundFilter", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
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
                      animation: `dataStream ${5 + Math.random() * 5}s linear infinite`,
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
                    <Bot className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">AI Agents</h1>
                    <p className="text-cyan-100/80 text-sm">Intelligent automation across platforms</p>
                  </div>
                </div>
                <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                  Deploy intelligent agents to automate engagement, generate leads, and grow your business on autopilot.
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
                    <span className="text-xl font-bold text-white">{totalActive}</span>
                    <span className="text-xs text-slate-400">/ {agents.length}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Messages</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{totalMessages}</span>
                    <span className="text-xs text-emerald-400">+24%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Engaged</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{totalEngagement}</span>
                    <span className="text-xs text-emerald-400">+18%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Converts</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{totalConversions}</span>
                    <span className="text-xs text-emerald-400">+32%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-700/50 shadow-lg transition-all hover:border-cyan-500/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Avg Perf</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{avgPerformance}%</span>
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
                      <PlatformIcon platform={option.value} className="h-4 w-4" />
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
          {filteredAgents.map((agent) => {
            const GoalIcon = getGoalIcon(agent.goal)
            return (
              <Card
                key={agent.id}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-1",
                  "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800",
                )}
                onClick={() => navigateToAgentDetail(agent.id)}
              >
                {/* Gradient Background */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity",
                    "bg-gradient-to-br",
                    getPlatformGradient(agent.platform),
                  )}
                />

                <CardHeader className="relative pb-3 pt-4 px-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-gradient-to-br text-white shadow-lg",
                          getPlatformGradient(agent.platform),
                        )}
                      >
                        <PlatformIcon platform={agent.platform} className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs px-2 py-0.5", getStatusColor(agent.status))}
                          >
                            {agent.status}
                          </Badge>
                          {agent.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">{agent.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Settings menu can be added here
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{agent.description}</p>
                </CardHeader>

                <CardContent className="relative space-y-3 px-4 py-2">
                  {/* Goal Badge */}
                  <div className="flex items-center gap-1.5">
                    <GoalIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium capitalize">{agent.goal.replace("_", " ")}</span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{agent.keyMetric.label}</span>
                        {agent.keyMetric.trend !== "—" && (
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              agent.keyMetric.trend.startsWith("+") ? "text-emerald-600" : "text-red-600",
                            )}
                          >
                            {agent.keyMetric.trend}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold">{agent.keyMetric.value}</span>
                    </div>
                    {agent.secondaryMetric && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <div className="text-[10px] text-muted-foreground mb-0.5">{agent.secondaryMetric.label}</div>
                        <span className="text-sm font-bold">{agent.secondaryMetric.value}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium">Performance</span>
                      <span className="text-[10px] font-bold">{agent.performance}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          agent.performance >= 80
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            : agent.performance >= 60
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-red-500 to-red-600",
                        )}
                        style={{ width: `${agent.performance}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="relative pt-2 pb-3 px-4 border-t">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{agent.lastActive}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={agent.status === "active"}
                        onCheckedChange={() => toggleAgentStatus(agent.id, { stopPropagation: () => {} } as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-90 data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Try adjusting your filters or create a new agent to get started.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          )}
        </div>

        {/* Create Agent Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold">Create AI Agent</DialogTitle>
              <DialogDescription>
                Set up your intelligent agent in just a few steps. Choose a goal, select a platform, and configure the
                settings.
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="relative mb-8">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="relative flex justify-between">
                {[
                  { step: 1, label: "Goal & Details", icon: Target },
                  { step: 2, label: "Platform", icon: Layers },
                  { step: 3, label: "Review", icon: CheckCircle },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.step} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                          currentStep === item.step
                            ? "border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                            : currentStep > item.step
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-400",
                        )}
                      >
                        {currentStep > item.step ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-xs font-medium",
                          currentStep === item.step
                            ? "text-cyan-600"
                            : currentStep > item.step
                              ? "text-emerald-600"
                              : "text-gray-500",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
              {/* Step 1: Goal & Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name" className="text-base font-medium">
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

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Select Your Goal</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goalOptions.map((goal) => {
                        const Icon = goal.icon
                        return (
                          <div
                            key={goal.value}
                            className={cn(
                              "relative cursor-pointer rounded-xl border-2 p-5 transition-all",
                              "hover:shadow-md hover:border-zinc-400",
                              formData.goal === goal.value
                                ? "border-zinc-600 bg-zinc-50 dark:bg-zinc-900/20 shadow-md"
                                : "border-zinc-200 dark:border-zinc-800",
                            )}
                            onClick={() => handleInputChange("goal", goal.value)}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-3 rounded-lg bg-gradient-to-br text-white shadow-lg",
                                "ring-1 ring-black/10 dark:ring-white/5",
                                "relative overflow-hidden group",
                                goal.color
                              )}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                <div className="relative">
                                  <Icon className="h-6 w-6 drop-shadow-sm" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{goal.label}</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{goal.description}</p>
                              </div>
                            </div>
                            {formData.goal === goal.value && (
                              <div className="absolute top-3 right-3">
                                <Check className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-instructions" className="text-base font-medium">
                      Instructions & Personality
                    </Label>
                    <Textarea
                      id="agent-instructions"
                      placeholder="Describe how your agent should behave, what tone to use, and any specific guidelines..."
                      className="min-h-[120px] resize-none"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-expectations" className="text-base font-medium">
                      Expected Outcomes
                    </Label>
                    <Textarea
                      id="agent-expectations"
                      placeholder="Describe what you expect the agent to achieve, key metrics to track, and success criteria..."
                      className="min-h-[120px] resize-none"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange("expectations", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Platform Selection */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Choose Your Platform</Label>
                    <div className="grid grid-cols-5 gap-4">
                      {platformOptions.map((platform) => (
                        <div
                          key={platform.value}
                          className={cn(
                            "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                            "hover:shadow-lg hover:border-cyan-400 hover:-translate-y-0.5",
                            "group",
                            formData.platform === platform.value
                              ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 shadow-lg"
                              : "border-zinc-200 dark:border-zinc-800",
                          )}
                          onClick={() => handleInputChange("platform", platform.value)}
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
                                <PlatformIcon platform={platform.value} className="h-7 w-7 drop-shadow-sm" />
                              </div>
                            </div>
                            <div className="text-center">
                              <span className="font-medium text-sm block">{platform.label}</span>
                            </div>
                          </div>
                          {formData.platform === platform.value && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-cyan-600 text-white p-1 rounded-full shadow-lg">
                                <Check className="h-3 w-3" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Connection Section */}
                  {formData.platform && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Account Connection</Label>
                      <div className="rounded-xl border-2 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "p-3 rounded-lg bg-gradient-to-br text-white shadow-lg",
                                getPlatformGradient(formData.platform)
                              )}
                            >
                              <PlatformIcon platform={formData.platform} className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Login with {formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1)}</h3>
                              <p className="text-sm text-muted-foreground">Connect your account to post content</p>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                            Connect Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Operation Mode</Label>
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
                            : "border-zinc-200 dark:border-zinc-800",
                        )}
                      >
                        <RadioGroupItem value="copilot" id="copilot" className="sr-only" />
                        <Label htmlFor="copilot" className="flex items-start gap-4 cursor-pointer">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                            <Brain className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">Copilot Mode</h3>
                            <p className="text-sm text-muted-foreground">
                              Agent suggests actions and waits for your approval before executing
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
                            : "border-zinc-200 dark:border-zinc-800",
                        )}
                      >
                        <RadioGroupItem value="autopilot" id="autopilot" className="sr-only" />
                        <Label htmlFor="autopilot" className="flex items-start gap-4 cursor-pointer">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                            <Rocket className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">Autopilot Mode</h3>
                            <p className="text-sm text-muted-foreground">
                              Agent works autonomously based on your instructions and guidelines
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.mode === "autopilot" && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="review-minutes" className="text-sm font-medium">Review period (minutes)</Label>
                          <Input
                            id="review-minutes"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.reviewMinutes}
                            onChange={(e) => handleInputChange("reviewMinutes", e.target.value)}
                            className="w-20 h-8"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          The agent will wait for you to review content before posting
                        </p>
                      </div>
                    )}
                  </div>

                  <Collapsible className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Advanced Settings</Label>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
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

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  {/* Main Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-950/40 p-4 border border-slate-200 dark:border-slate-700/30 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
                            getPlatformGradient(formData.platform)
                          )}>
                            <PlatformIcon platform={formData.platform} className="h-8 w-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1 text-slate-900 dark:text-slate-200">{formData.name || "Unnamed Agent"}</h3>
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
                        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-200">Review Settings</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Schedule</span>
                          <span className="font-medium text-slate-900 dark:text-slate-300 capitalize">{formData.reviewPeriod}</span>
                        </div>
                        {formData.mode === "autopilot" && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Wait Time</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-slate-300">{formData.reviewMinutes}</span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">minutes</span>
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
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-200">Instructions & Personality</h4>
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
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-200">Expected Outcomes</h4>
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
                        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-200">Platform Settings</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {formData.platform === "reddit" && (
                          <>
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Subreddit</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.reddit?.subreddit ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.reddit.subreddit}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Time Range</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.reddit?.timeRange ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.reddit.timeRange}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Relevance</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.reddit?.relevanceThreshold ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.reddit.relevanceThreshold}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Min Upvotes</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.reddit?.minUpvotes ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.reddit.minUpvotes}</span>
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
                                <span className="font-medium text-slate-700 dark:text-slate-300">Monitor Comments:</span>
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  formData.platformSettings.reddit?.monitorComments
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                )}>
                                  <span className={cn(
                                    "w-1 h-1 rounded-full",
                                    formData.platformSettings.reddit?.monitorComments
                                      ? "bg-emerald-500 dark:bg-emerald-400"
                                      : "bg-slate-400 dark:bg-slate-500"
                                  )}></span>
                                  {formData.platformSettings.reddit?.monitorComments ? "Enabled" : "Disabled"}
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Keywords</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.twitter?.keywords ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.twitter.keywords}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Accounts</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.twitter?.accountsToMonitor ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.twitter.accountsToMonitor}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Time Range</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.twitter?.timeRange ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.twitter.timeRange}</span>
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
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Min Engagement</span>
                              </div>
                              <div className="text-xs">
                                {formData.platformSettings.twitter?.minEngagement ? (
                                  <span className="text-slate-600 dark:text-slate-400">{formData.platformSettings.twitter.minEngagement}</span>
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
                                <span className="font-medium text-slate-700 dark:text-slate-300">Sentiment:</span>
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  formData.platformSettings.twitter?.sentiment
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                )}>
                                  <span className={cn(
                                    "w-1 h-1 rounded-full",
                                    formData.platformSettings.twitter?.sentiment
                                      ? "bg-blue-500 dark:bg-blue-400"
                                      : "bg-slate-400 dark:bg-slate-500"
                                  )}></span>
                                  {formData.platformSettings.twitter?.sentiment || "Not set"}
                                </span>
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
                <Button variant="outline" onClick={goToPrevStep} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  onClick={goToNextStep}
                  className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={createAgent}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Launch Agent
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

// Add animations
const dataStream = `@keyframes dataStream {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}`

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
}`

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
`

// Add the styles to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = scrollbarStyles
  document.head.appendChild(style)
}
