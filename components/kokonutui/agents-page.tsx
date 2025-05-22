"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  Settings,
  RefreshCw,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Clock,
  Target,
  MessageSquare,
  Users,
  UserCheck,
  Zap,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Eye,
  BarChart,
  Download,
  Trash2,
  Activity,
  UserPlus,
  Shield,
  BellRing,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  LogIn,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Layout from "@/components/kokonutui/layout"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Reddit icon component since it's not available in lucide-react
const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8c2.648 0 5.028.826 6.675 2.14a2.5 2.5 0 0 1 2.326-1.64 2.5 2.5 0 0 1 2.5 2.5c0 1.278-.96 2.33-2.2 2.47A7.664 7.664 0 0 1 12 16a7.664 7.664 0 0 1-9.3-3.53 2.5 2.5 0 0 1-2.2-2.47 2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.325 1.64A12.078 12.078 0 0 1 12 8Z" />
    <path d="M17.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path d="M6.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path d="M10 17a2 2 0 1 0 4 0" />
  </svg>
)

// Define agent types
interface Agent {
  id: string
  name: string
  platform: "reddit" | "linkedin" | "twitter" | "instagram" | "email"
  status: "active" | "paused" | "error" | "pending"
  goal: "lead_generation" | "brand_awareness" | "engagement" | "support"
  lastActive: string
  keyMetric: {
    value: string
    label: string
  }
  secondaryMetric?: {
    value: string
    label: string
  }
  description: string
  createdAt: string
  performance?: number
  activity?: {
    today: number
    week: number
    month: number
  }
}

// Sample agent data
const SAMPLE_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Reddit Lead Finder",
    platform: "reddit",
    status: "active",
    goal: "lead_generation",
    lastActive: "5 mins ago",
    keyMetric: {
      value: "25",
      label: "Leads Found Today",
    },
    secondaryMetric: {
      value: "142",
      label: "Posts Monitored",
    },
    description:
      "Identifies potential leads by monitoring relevant subreddits and engaging with users showing interest in MDM solutions.",
    createdAt: "2025-04-15T10:30:00Z",
    performance: 85,
    activity: {
      today: 25,
      week: 120,
      month: 450,
    },
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
      label: "New Page Followers",
    },
    secondaryMetric: {
      value: "8",
      label: "Posts Published",
    },
    description:
      "Shares industry insights and engages with relevant content to establish brand authority in the MDM space.",
    createdAt: "2025-03-22T14:15:00Z",
    performance: 92,
    activity: {
      today: 12,
      week: 68,
      month: 245,
    },
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
      label: "Support Inquiries Handled",
    },
    secondaryMetric: {
      value: "95%",
      label: "Resolution Rate",
    },
    description:
      "Monitors Twitter for customer support requests and provides initial responses and escalation when needed.",
    createdAt: "2025-05-01T09:45:00Z",
    performance: 78,
    activity: {
      today: 0,
      week: 45,
      month: 180,
    },
  },
  {
    id: "4",
    name: "Instagram Content Promoter",
    platform: "instagram",
    status: "active",
    goal: "engagement",
    lastActive: "3 hours ago",
    keyMetric: {
      value: "87",
      label: "Engagement Rate",
    },
    secondaryMetric: {
      value: "1,500+",
      label: "Total Interactions",
    },
    description: "Promotes visual content and engages with followers to increase brand visibility and engagement.",
    createdAt: "2025-04-10T11:20:00Z",
    performance: 94,
    activity: {
      today: 87,
      week: 320,
      month: 1250,
    },
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
    },
    secondaryMetric: {
      value: "15,000",
      label: "Emails Sent",
    },
    description: "Manages email campaigns, analyzes performance, and optimizes for better conversion rates.",
    createdAt: "2025-02-18T16:30:00Z",
    performance: 45,
    activity: {
      today: 0,
      week: 15000,
      month: 45000,
    },
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
      label: "Community Interactions",
    },
    description: "Will manage and grow our Reddit community by posting relevant content and engaging with members.",
    createdAt: "2025-05-18T13:10:00Z",
    performance: 0,
    activity: {
      today: 0,
      week: 0,
      month: 0,
    },
  },
  {
    id: "7",
    name: "LinkedIn Lead Generator",
    platform: "linkedin",
    status: "active",
    goal: "lead_generation",
    lastActive: "Just now",
    keyMetric: {
      value: "8",
      label: "Qualified Leads Today",
    },
    secondaryMetric: {
      value: "42",
      label: "Connection Requests",
    },
    description: "Identifies and engages with potential leads on LinkedIn through personalized outreach.",
    createdAt: "2025-04-05T10:00:00Z",
    performance: 88,
    activity: {
      today: 8,
      week: 35,
      month: 120,
    },
  },
  {
    id: "8",
    name: "Twitter Trend Analyzer",
    platform: "twitter",
    status: "active",
    goal: "brand_awareness",
    lastActive: "30 mins ago",
    keyMetric: {
      value: "5",
      label: "Trending Topics Leveraged",
    },
    secondaryMetric: {
      value: "28",
      label: "Mentions Generated",
    },
    description: "Monitors industry trends and helps position our brand in relevant conversations.",
    createdAt: "2025-03-12T09:20:00Z",
    performance: 76,
    activity: {
      today: 5,
      week: 22,
      month: 85,
    },
  },
]

// Helper functions for platform icons and colors
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "reddit":
      return <RedditIcon className="h-5 w-5" />
    case "linkedin":
      return <Linkedin className="h-5 w-5" />
    case "twitter":
      return <Twitter className="h-5 w-5" />
    case "instagram":
      return <Instagram className="h-5 w-5" />
    case "email":
      return <Mail className="h-5 w-5" />
    default:
      return <MessageSquare className="h-5 w-5" />
  }
}

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "reddit":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
    case "linkedin":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    case "twitter":
      return "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
    case "instagram":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    case "email":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  }
}

const getPlatformGradient = (platform: string) => {
  switch (platform) {
    case "reddit":
      return "bg-gradient-to-br from-orange-50/30 via-card to-orange-50/10 dark:from-orange-950/10 dark:via-card dark:to-orange-950/5"
    case "linkedin":
      return "bg-gradient-to-br from-blue-50/30 via-card to-blue-50/10 dark:from-blue-950/10 dark:via-card dark:to-blue-950/5"
    case "twitter":
      return "bg-gradient-to-br from-sky-50/30 via-card to-sky-50/10 dark:from-sky-950/10 dark:via-card dark:to-sky-950/5"
    case "instagram":
      return "bg-gradient-to-br from-purple-50/30 via-card to-pink-50/10 dark:from-purple-950/10 dark:via-card dark:to-pink-950/5"
    case "email":
      return "bg-gradient-to-br from-emerald-50/30 via-card to-emerald-50/10 dark:from-emerald-950/10 dark:via-card dark:to-emerald-950/5"
    default:
      return "bg-gradient-to-br from-gray-50/30 via-card to-gray-50/10 dark:from-gray-950/10 dark:via-card dark:to-gray-950/5"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    case "paused":
      return <PauseCircle className="h-4 w-4 text-amber-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
    case "paused":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
    case "error":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
    case "pending":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
  }
}

const getGoalIcon = (goal: string) => {
  switch (goal) {
    case "lead_generation":
      return <UserCheck className="h-4 w-4" />
    case "brand_awareness":
      return <Eye className="h-4 w-4" />
    case "engagement":
      return <MessageSquare className="h-4 w-4" />
    case "support":
      return <Users className="h-4 w-4" />
    default:
      return <Target className="h-4 w-4" />
  }
}

const getGoalLabel = (goal: string) => {
  switch (goal) {
    case "lead_generation":
      return "Lead Generation"
    case "brand_awareness":
      return "Brand Awareness"
    case "engagement":
      return "Engagement"
    case "support":
      return "Support"
    default:
      return goal
  }
}

// Configure Agent Modal Component
const ConfigureAgentModal = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  const [agentName, setAgentName] = useState(agent.name)
  const [goal, setGoal] = useState(agent.goal)
  const [instructions, setInstructions] = useState(agent.description)
  const [expectations, setExpectations] = useState("")
  const [channel, setChannel] = useState(agent.platform)
  const [mode, setMode] = useState(agent.status === "active" ? "autopilot" : "copilot")
  const [reviewPeriod, setReviewPeriod] = useState(30)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [subreddit, setSubreddit] = useState("")
  const [timeFrame, setTimeFrame] = useState("week")
  const [relevanceThreshold, setRelevanceThreshold] = useState(50)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the form submission, update the agent, etc.
    console.log({
      agentName,
      goal,
      instructions,
      expectations,
      channel,
      mode,
      reviewPeriod,
      subreddit,
      timeFrame,
      relevanceThreshold,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(agent.platform)}`}
          >
            {getPlatformIcon(agent.platform)}
          </div>
          <div>
            <h3 className="font-medium">Configure Agent</h3>
            <p className="text-xs text-muted-foreground">Update settings for {agent.name}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="agent-name-edit" className="text-sm font-medium">
            Agent Name
          </Label>
          <p className="text-xs text-muted-foreground mb-2">A short name to identify your agent.</p>
          <Input
            id="agent-name-edit"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Enter agent name"
            required
          />
        </div>

        <div>
          <Label htmlFor="goal-edit" className="text-sm font-medium">
            Select Goal
          </Label>
          <p className="text-xs text-muted-foreground mb-2">What is their main objective?</p>
          <Select value={goal} onValueChange={setGoal} required>
            <SelectTrigger id="goal-edit">
              <SelectValue placeholder="Select a goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead_generation">Lead Generation</SelectItem>
              <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="support">Customer Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="instructions-edit" className="text-sm font-medium">
            Instructions
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Provide instructions to the agent to customize their style, tone, etc.
          </p>
          <Textarea
            id="instructions-edit"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for the agent..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="expectations-edit" className="text-sm font-medium">
            Expectations
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            What results do you expect from this agent? This helps measure success.
          </p>
          <Textarea
            id="expectations-edit"
            value={expectations}
            onChange={(e) => setExpectations(e.target.value)}
            placeholder="E.g., Generate 5 qualified leads per week, Increase engagement by 20%..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="channel-edit" className="text-sm font-medium">
              Channel
            </Label>
            <p className="text-xs text-muted-foreground mb-2">Social media channel</p>
            <Select value={channel} onValueChange={setChannel} required>
              <SelectTrigger id="channel-edit">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Mode</Label>
            <p className="text-xs text-muted-foreground mb-2">Choose how the agent operates.</p>
            <RadioGroup value={mode} onValueChange={setMode} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copilot" id="copilot-edit" />
                <Label htmlFor="copilot-edit">Copilot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="autopilot" id="autopilot-edit" />
                <Label htmlFor="autopilot-edit">Autopilot</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {mode === "copilot" && (
          <div>
            <Label htmlFor="review-period-edit" className="text-sm font-medium">
              Review Period (minutes)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              The agent will wait for you to review content before posting.
            </p>
            <Input
              id="review-period-edit"
              type="number"
              min={1}
              max={1440}
              value={reviewPeriod}
              onChange={(e) => setReviewPeriod(Number.parseInt(e.target.value))}
            />
          </div>
        )}

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="border rounded-md p-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <h3 className="text-sm font-medium">Advanced Settings</h3>
              {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {channel === "reddit" && (
              <>
                <div>
                  <Label htmlFor="subreddit-edit" className="text-sm font-medium">
                    Subreddit
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">To monitor a specific subreddit.</p>
                  <div className="flex items-center">
                    <span className="text-sm mr-1 text-muted-foreground">r/</span>
                    <Input
                      id="subreddit-edit"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      placeholder="e.g., sysadmin"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time-frame-edit" className="text-sm font-medium">
                    Time
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">To track mentions in this time period.</p>
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger id="time-frame-edit">
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Past hour</SelectItem>
                      <SelectItem value="day">Past 24 hours</SelectItem>
                      <SelectItem value="week">Past week</SelectItem>
                      <SelectItem value="month">Past month</SelectItem>
                      <SelectItem value="year">Past year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="relevance-edit" className="text-sm font-medium">
                      Relevance Threshold
                    </Label>
                    <span className="text-sm font-medium">{relevanceThreshold}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Mentions below this score will be discarded.</p>
                  <Slider
                    id="relevance-edit"
                    min={0}
                    max={100}
                    step={1}
                    value={[relevanceThreshold]}
                    onValueChange={(value) => setRelevanceThreshold(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </>
            )}

            {channel && channel !== "reddit" && (
              <div className="flex items-center justify-center p-4">
                <div className="text-center">
                  <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm">
                    Advanced settings for {channel.charAt(0).toUpperCase() + channel.slice(1)} will appear here.
                  </p>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}

// Replace the existing CreateAgentForm component with this enhanced version
const CreateAgentForm = ({ onClose }: { onClose: () => void }) => {
  const [agentName, setAgentName] = useState("")
  const [goal, setGoal] = useState("")
  const [instructions, setInstructions] = useState("")
  const [expectations, setExpectations] = useState("")
  const [channel, setChannel] = useState("")
  const [mode, setMode] = useState("copilot")
  const [reviewPeriod, setReviewPeriod] = useState(30)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [subreddit, setSubreddit] = useState("")
  const [timeFrame, setTimeFrame] = useState("week")
  const [relevanceThreshold, setRelevanceThreshold] = useState(50)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Simplified form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", {
      agentName,
      goal,
      instructions,
      expectations,
      channel,
      mode,
      reviewPeriod,
      subreddit,
      timeFrame,
      relevanceThreshold,
    })
    onClose()
  }

  const getLoginButtonText = () => {
    if (!channel) return "Login with Platform"
    return `Login with ${channel.charAt(0).toUpperCase() + channel.slice(1)}`
  }

  // Simplified navigation
  const goToNextStep = () => {
    console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`)
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1))
  }

  const goToPrevStep = () => {
    console.log(`Moving from step ${currentStep} to step ${currentStep - 1}`)
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  // Log current step for debugging
  useEffect(() => {
    console.log("Current step:", currentStep)
  }, [currentStep])

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto">
      {/* Progress indicator */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-100/50 dark:border-blue-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium text-lg">Create AI Agent</h3>
            <p className="text-sm text-muted-foreground">
              Configure your new AI assistant (Step {currentStep} of {totalSteps})
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="w-full flex items-center justify-between relative mt-2">
          <div className="absolute h-1 bg-muted inset-x-0 top-1/2 -translate-y-1/2"></div>
          <div
            className="absolute h-1 bg-gradient-to-r from-blue-500 to-indigo-600 inset-x-0 top-1/2 -translate-y-1/2"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>

          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              onClick={() => i + 1 <= currentStep && setCurrentStep(i + 1)}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                i + 1 <= currentStep
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Agent Identity */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-card rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Agent Identity
            </h4>

            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-sm font-medium">
                  Agent Name
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  A short name to identify your agent (e.g., 'Hexnode Reddit Leads').
                </p>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  className="border-blue-100 dark:border-blue-900/50 focus-visible:ring-blue-500"
                />
              </div>

              {/* Objective */}
              <div>
                <Label htmlFor="goal" className="text-sm font-medium">
                  Select Goal
                </Label>
                <p className="text-xs text-muted-foreground mb-2">What is their main objective?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      goal === "lead_generation"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                    }`}
                    onClick={() => setGoal("lead_generation")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-md">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Lead Generation
                          {goal === "lead_generation" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Find and qualify potential customers</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      goal === "brand_awareness"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                    }`}
                    onClick={() => setGoal("brand_awareness")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-md">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Brand Awareness
                          {goal === "brand_awareness" && <CheckCircle className="h-4 w-4 text-purple-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Increase visibility and recognition</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      goal === "engagement"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "hover:border-green-200 hover:bg-green-50/50 dark:hover:bg-green-900/10"
                    }`}
                    onClick={() => setGoal("engagement")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-md">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Engagement
                          {goal === "engagement" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Interact with users and build community</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      goal === "support"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "hover:border-amber-200 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                    }`}
                    onClick={() => setGoal("support")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-md">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Customer Support
                          {goal === "support" && <CheckCircle className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Assist users with questions and issues</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Platform Selection */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-card rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              Platform Selection
            </h4>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Where will this agent operate?</Label>
                <p className="text-xs text-muted-foreground mb-3">Choose the social platform for this agent</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      channel === "reddit"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
                    }`}
                    onClick={() => setChannel("reddit")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-full">
                        <RedditIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Reddit
                          {channel === "reddit" && <CheckCircle className="h-4 w-4 text-orange-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      channel === "linkedin"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                    }`}
                    onClick={() => setChannel("linkedin")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                        <Linkedin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          LinkedIn
                          {channel === "linkedin" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      channel === "twitter"
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                        : "hover:border-sky-200 hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
                    }`}
                    onClick={() => setChannel("twitter")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-2 rounded-full">
                        <Twitter className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Twitter
                          {channel === "twitter" && <CheckCircle className="h-4 w-4 text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${
                      channel === "instagram"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                    }`}
                    onClick={() => setChannel("instagram")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full">
                        <Instagram className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          Instagram
                          {channel === "instagram" && <CheckCircle className="h-4 w-4 text-purple-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Connection */}
              {channel && (
                <div className="animate-in fade-in duration-300 p-4 border rounded-lg mt-4">
                  <Label className="text-sm font-medium">Connect Account</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Button
                      type="button"
                      className={`flex items-center gap-2 ${
                        channel === "reddit"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : channel === "linkedin"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : channel === "twitter"
                              ? "bg-sky-500 hover:bg-sky-600"
                              : "bg-purple-500 hover:bg-purple-600"
                      }`}
                    >
                      <LogIn className="h-4 w-4" />
                      {getLoginButtonText()}
                    </Button>
                    <p className="text-xs text-muted-foreground">Connect your account to post content.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Agent Behavior & Settings */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300" style={{ display: "block" }}>
          {/* Behavior Instructions */}
          <div className="bg-card rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Agent Behavior
            </h4>

            <div className="space-y-4">
              <div>
                <Label htmlFor="instructions" className="text-sm font-medium">
                  Instructions
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Provide instructions to the agent to customize their style, tone, etc.
                  <span className="italic block mt-1">Ex: You must always sound professional and formal</span>
                </p>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter instructions for the agent..."
                  className="min-h-[100px] border-purple-100 dark:border-purple-900/50 focus-visible:ring-purple-500"
                />
              </div>

              <div>
                <Label htmlFor="expectations" className="text-sm font-medium">
                  Expectations
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  What results do you expect from this agent? This helps measure success.
                </p>
                <Textarea
                  id="expectations"
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  placeholder="E.g., Generate 5 qualified leads per week, Increase engagement by 20%..."
                  className="min-h-[80px] border-purple-100 dark:border-purple-900/50 focus-visible:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Mode Settings */}
          <div className="bg-card rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-500" />
              Operation Mode
            </h4>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Choose how the agent operates</Label>
              <RadioGroup value={mode} onValueChange={setMode} className="flex flex-col space-y-2">
                <div
                  className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors ${mode === "copilot" ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : ""}`}
                >
                  <RadioGroupItem value="copilot" id="copilot" />
                  <div>
                    <Label htmlFor="copilot" className="font-medium">
                      Copilot
                    </Label>
                    <p className="text-xs text-muted-foreground">Agent suggests actions for your approval</p>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors ${mode === "autopilot" ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                >
                  <RadioGroupItem value="autopilot" id="autopilot" />
                  <div>
                    <Label htmlFor="autopilot" className="font-medium">
                      Autopilot
                    </Label>
                    <p className="text-xs text-muted-foreground">Agent acts autonomously</p>
                  </div>
                </div>
              </RadioGroup>

              {/* Review Settings */}
              {mode === "copilot" && (
                <div className="p-4 border rounded-md bg-muted/30 mt-2">
                  <Label htmlFor="review-period" className="text-sm font-medium">
                    Review Period (minutes)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    The agent will wait for you to review content before posting.
                  </p>
                  <Input
                    id="review-period"
                    type="number"
                    min={1}
                    max={1440}
                    value={reviewPeriod}
                    onChange={(e) => setReviewPeriod(Number.parseInt(e.target.value))}
                    className="border-green-100 dark:border-green-900/50 focus-visible:ring-green-500 w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <Collapsible
            open={isAdvancedOpen}
            onOpenChange={setIsAdvancedOpen}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium">Advanced Settings</h3>
                </div>
                {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4 bg-card">
              {channel === "reddit" && (
                <>
                  <div>
                    <Label htmlFor="subreddit" className="text-sm font-medium">
                      Subreddit
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">To monitor a specific subreddit.</p>
                    <div className="flex items-center">
                      <span className="text-sm mr-1 text-muted-foreground">r/</span>
                      <Input
                        id="subreddit"
                        value={subreddit}
                        onChange={(e) => setSubreddit(e.target.value)}
                        placeholder="e.g., sysadmin"
                        className="border-amber-100 dark:border-amber-900/50 focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="time-frame" className="text-sm font-medium">
                      Time
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">To track mentions in this time period.</p>
                    <Select value={timeFrame} onValueChange={setTimeFrame}>
                      <SelectTrigger id="time-frame" className="border-amber-100 dark:border-amber-900/50">
                        <SelectValue placeholder="Select time frame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Past hour</SelectItem>
                        <SelectItem value="day">Past 24 hours</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="relevance" className="text-sm font-medium">
                        Relevance Threshold
                      </Label>
                      <span className="text-sm font-medium">{relevanceThreshold}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Mentions below this score will be discarded.</p>
                    <Slider
                      id="relevance"
                      min={0}
                      max={100}
                      step={1}
                      value={[relevanceThreshold]}
                      onChange={(value) => setRelevanceThreshold(value[0])}
                      className="[&>span]:bg-amber-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </>
              )}

              {channel && channel !== "reddit" && (
                <div className="flex items-center justify-center p-4">
                  <div className="text-center">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm">
                      Advanced settings for {channel.charAt(0).toUpperCase() + channel.slice(1)} will appear here.
                    </p>
                  </div>
                </div>
              )}

              {!channel && (
                <div className="flex items-center justify-center p-4">
                  <div className="text-center">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm">Select a channel to see platform-specific settings.</p>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Use the Copilot mode to first train the agents, and only enable Autopilot mode when you are confident it
            works the way you like.
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={goToPrevStep}>
            Back
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={goToNextStep}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Create Agent
          </Button>
        )}
      </div>
    </form>
  )
}

export default function AgentsPage() {
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [goalFilter, setGoalFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalLeadsGenerated: 0,
    totalEngagements: 0,
    averagePerformance: 0,
  })

  // Add this function to the AgentsPage component
  const openConfigureModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsConfigureModalOpen(true)
  }

  // Calculate dashboard stats
  useEffect(() => {
    const activeAgents = agents.filter((agent) => agent.status === "active")
    const totalLeadsGenerated = agents
      .filter((agent) => agent.goal === "lead_generation")
      .reduce((sum, agent) => sum + (agent.activity?.today || 0), 0)
    const totalEngagements = agents
      .filter((agent) => agent.goal === "engagement")
      .reduce((sum, agent) => sum + (agent.activity?.today || 0), 0)
    const averagePerformance =
      agents.reduce((sum, agent) => sum + (agent.performance || 0), 0) / agents.filter((a) => a.performance).length

    setDashboardStats({
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      totalLeadsGenerated,
      totalEngagements,
      averagePerformance: Math.round(averagePerformance),
    })
  }, [agents])

  // Filter agents based on search query and filters
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform = platformFilter === "all" || agent.platform === platformFilter
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter
    const matchesGoal = goalFilter === "all" || agent.goal === goalFilter

    return matchesSearch && matchesPlatform && matchesStatus && matchesGoal
  })

  // Simulate refreshing agents data
  const refreshAgents = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // In a real app, this would fetch fresh data from the API
      setIsRefreshing(false)
    }, 1500)
  }

  // Toggle agent status
  const toggleAgentStatus = (agentId: string) => {
    setAgents(
      agents.map((agent) => {
        if (agent.id === agentId) {
          const newStatus = agent.status === "active" ? "paused" : "active"
          return { ...agent, status: newStatus, lastActive: newStatus === "active" ? "Just now" : agent.lastActive }
        }
        return agent
      }),
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Section with Dashboard Stats */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Your AI Agents
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Manage and monitor your AI agents across different platforms
              </p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New AI Agent</DialogTitle>
                  <DialogDescription>
                    Configure your new AI agent to automate tasks across social platforms.
                  </DialogDescription>
                </DialogHeader>
                <CreateAgentForm onClose={() => setIsCreateModalOpen(false)} />
              </DialogContent>
            </Dialog>
            {/* Add this dialog right after the Create Agent dialog in the component */}
            <Dialog open={isConfigureModalOpen} onOpenChange={setIsConfigureModalOpen}>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                {selectedAgent && (
                  <ConfigureAgentModal agent={selectedAgent} onClose={() => setIsConfigureModalOpen(false)} />
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Agents</div>
              <div className="text-2xl font-bold">{dashboardStats.totalAgents}</div>
              <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2">
                  <Users className="h-4 w-4" />
                </div>
                <span>{dashboardStats.activeAgents} active</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance</div>
              <div className="text-2xl font-bold">{dashboardStats.averagePerformance}%</div>
              <div className="mt-2">
                <Progress value={dashboardStats.averagePerformance} className="h-2" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Leads Generated</div>
              <div className="text-2xl font-bold">{dashboardStats.totalLeadsGenerated}</div>
              <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                  <UserPlus className="h-4 w-4" />
                </div>
                <span>Today</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Engagements</div>
              <div className="text-2xl font-bold">{dashboardStats.totalEngagements}</div>
              <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span>Today</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protection</div>
              <div className="text-2xl font-bold">Active</div>
              <div className="mt-2 flex items-center text-xs text-amber-600 dark:text-amber-400">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                  <Shield className="h-4 w-4" />
                </div>
                <span>Brand Safety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search agents by name, goal, or platform..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="h-8 w-[130px]">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px]">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={goalFilter} onValueChange={setGoalFilter}>
                <SelectTrigger className="h-8 w-[150px]">
                  <Target className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={refreshAgents} disabled={isRefreshing} className="h-8">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              All Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Active ({agents.filter((a) => a.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Issues ({agents.filter((a) => a.status === "error").length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Pending ({agents.filter((a) => a.status === "pending").length})
            </TabsList>

          <TabsContent value="all" className="mt-4">
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900/60 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No agents found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-shadow ${getPlatformGradient(agent.platform)}`}
                  >
                    <CardContent className="p-0">
                      {/* Agent Header */}
                      <div className="p-4 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(agent.platform)}`}
                          >
                            {getPlatformIcon(agent.platform)}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(agent.status)}`}
                              >
                                {getStatusIcon(agent.status)}
                                <span className="ml-1">
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">{agent.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openConfigureModal(agent)}>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>View Analytics</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Export Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Agent</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Agent Body */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted/50">
                            {getGoalIcon(agent.goal)}
                            <span>{getGoalLabel(agent.goal)}</span>
                          </div>
                          {agent.performance !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-medium ${
                                  agent.performance > 80
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : agent.performance > 60
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {agent.performance}%
                              </span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    agent.performance > 80
                                      ? "bg-emerald-500"
                                      : agent.performance > 60
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${agent.performance}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-muted/30 p-2 rounded-md">
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs font-medium">{agent.keyMetric.label}</span>
                            </div>
                            <span className="text-sm font-bold">{agent.keyMetric.value}</span>
                          </div>
                          {agent.secondaryMetric && (
                            <div className="bg-muted/30 p-2 rounded-md">
                              <div className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-medium">{agent.secondaryMetric.label}</span>
                              </div>
                              <span className="text-sm font-bold">{agent.secondaryMetric.value}</span>
                            </div>
                          )}
                        </div>

                        {agent.activity && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BellRing className="h-3 w-3" />
                              <span>Today: {agent.activity.today}</span>
                            </div>
                            <div>Week: {agent.activity.week}</div>
                            <div>Month: {agent.activity.month}</div>
                          </div>
                        )}
                      </div>

                      {/* Agent Footer */}
                      <div className="p-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`agent-toggle-${agent.id}`}
                            checked={agent.status === "active"}
                            onCheckedChange={() => toggleAgentStatus(agent.id)}
                            disabled={agent.status === "error" || agent.status === "pending"}
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                          <Label htmlFor={`agent-toggle-${agent.id}`} className="text-xs">
                            {agent.status === "active" ? "Active" : "Paused"}
                          </Label>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          onClick={() => openConfigureModal(agent)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents
                .filter((agent) => agent.status === "active")
                .map((agent) => (
                  <Card
                    key={agent.id}
                    className={`overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-shadow ${getPlatformGradient(agent.platform)}`}
                  >
                    <CardContent className="p-0">
                      {/* Agent Header */}
                      <div className="p-4 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(agent.platform)}`}
                          >
                            {getPlatformIcon(agent.platform)}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(agent.status)}`}
                              >
                                {getStatusIcon(agent.status)}
                                <span className="ml-1">
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">{agent.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openConfigureModal(agent)}>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>View Analytics</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Export Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Agent</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Agent Body */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted/50">
                            {getGoalIcon(agent.goal)}
                            <span>{getGoalLabel(agent.goal)}</span>
                          </div>
                          {agent.performance !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-medium ${
                                  agent.performance > 80
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : agent.performance > 60
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {agent.performance}%
                              </span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    agent.performance > 80
                                      ? "bg-emerald-500"
                                      : agent.performance > 60
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${agent.performance}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-muted/30 p-2 rounded-md">
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs font-medium">{agent.keyMetric.label}</span>
                            </div>
                            <span className="text-sm font-bold">{agent.keyMetric.value}</span>
                          </div>
                          {agent.secondaryMetric && (
                            <div className="bg-muted/30 p-2 rounded-md">
                              <div className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-medium">{agent.secondaryMetric.label}</span>
                              </div>
                              <span className="text-sm font-bold">{agent.secondaryMetric.value}</span>
                            </div>
                          )}
                        </div>

                        {agent.activity && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BellRing className="h-3 w-3" />
                              <span>Today: {agent.activity.today}</span>
                            </div>
                            <div>Week: {agent.activity.week}</div>
                            <div>Month: {agent.activity.month}</div>
                          </div>
                        )}
                      </div>

                      {/* Agent Footer */}
                      <div className="p-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`agent-toggle-active-${agent.id}`}
                            checked={agent.status === "active"}
                            onCheckedChange={() => toggleAgentStatus(agent.id)}
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                          <Label htmlFor={`agent-toggle-active-${agent.id}`} className="text-xs">
                            Active
                          </Label>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          onClick={() => openConfigureModal(agent)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents
                .filter((agent) => agent.status === "error")
                .map((agent) => (
                  <Card
                    key={agent.id}
                    className={`overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-shadow ${getPlatformGradient(agent.platform)}`}
                  >
                    <CardContent className="p-0">
                      {/* Agent Header */}
                      <div className="p-4 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(agent.platform)}`}
                          >
                            {getPlatformIcon(agent.platform)}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(agent.status)}`}
                              >
                                {getStatusIcon(agent.status)}
                                <span className="ml-1">
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">{agent.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openConfigureModal(agent)}>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>View Analytics</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Export Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Agent</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Agent Body */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted/50">
                            {getGoalIcon(agent.goal)}
                            <span>{getGoalLabel(agent.goal)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>

                        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800/50">
                          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">API authentication error</span>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            The agent couldn't authenticate with the platform API. Please check your credentials.
                          </p>
                        </div>
                      </div>

                      {/* Agent Footer */}
                      <div className="p-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`agent-toggle-error-${agent.id}`}
                            checked={false}
                            disabled={true}
                            className="scale-75"
                          />
                          <Label htmlFor={`agent-toggle-error-${agent.id}`} className="text-xs text-muted-foreground">
                            Disabled
                          </Label>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Fix Issue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents
                .filter((agent) => agent.status === "pending")
                .map((agent) => (
                  <Card
                    key={agent.id}
                    className={`overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-shadow ${getPlatformGradient(agent.platform)}`}
                  >
                    <CardContent className="p-0">
                      {/* Agent Header */}
                      <div className="p-4 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(agent.platform)}`}
                          >
                            {getPlatformIcon(agent.platform)}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(agent.status)}`}
                              >
                                {getStatusIcon(agent.status)}
                                <span className="ml-1">
                                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">{agent.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openConfigureModal(agent)}>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Configure</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>View Analytics</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Export Logs</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Agent</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Agent Body */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted/50">
                            {getGoalIcon(agent.goal)}
                            <span>{getGoalLabel(agent.goal)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>

                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800/50">
                          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Setup in progress</span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            This agent is being set up and will be active soon.
                          </p>
                        </div>
                      </div>

                      {/* Agent Footer */}
                      <div className="p-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`agent-toggle-pending-${agent.id}`}
                            checked={false}
                            disabled={true}
                            className="scale-75"
                          />
                          <Label htmlFor={`agent-toggle-pending-${agent.id}`} className="text-xs text-muted-foreground">
                            Pending
                          </Label>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Complete Setup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )\
}
