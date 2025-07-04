"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "@/store/store"
import { 
  fetchAgentData, 
  selectDisplayPosts,
  selectAgentData, 
  selectAgentState, 
  selectAgentType,
  updateAgentStatus,
  type DisplayPost,
  type PostStatus
} from "@/store/features/agentSlice"
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
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Clock,
  ExternalLink,
  BarChart2,
  Settings,
  Menu,
  Hash,
  Flag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Layout from "@/components/kokonutui/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown';

// Add this utility function to hide scrollbars
const scrollbarHideClass = "scrollbar-hide"

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
`

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
}

// Update the status badge rendering
const getStatusBadgeClass = (status: PostStatus) => {
  switch (status) {
    case 'pending':
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case 'approved':
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case 'needs_review':
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case 'discarded':
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    case 'escalated':
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    case 'processed':
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case 'failed':
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  }
}

const getStatusLabel = (status: PostStatus) => {
  switch (status) {
    case 'pending':
      return "Pending Review"
    case 'approved':
      return "Approved"
    case 'needs_review':
      return "Needs Review"
    case 'discarded':
      return "Discarded"
    case 'escalated':
      return "Escalated to Sales"
    case 'processed':
      return "Processed"
    case 'failed':
      return "Failed"
    default:
      return "Unknown"
  }
}

export default function IndividualAgentPage({ agentId }: { agentId: string }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const displayPosts = useSelector(selectDisplayPosts)
  const agentType = useSelector(selectAgentType)
  const agentData = useSelector(selectAgentData)
  const agentState = useSelector(selectAgentState)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(agentData?.agent_name || "Hexnode Reddit Lead Finder")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showDetailPane, setShowDetailPane] = useState(true)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all-types")
  const [timeFilter, setTimeFilter] = useState("24h")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [showAgentStats, setShowAgentStats] = useState(false)
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false)
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  const [activeView, setActiveView] = useState("content")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(["MDM solutions", "Hexnode", "competitor mention"])
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [hasInitialData, setHasInitialData] = useState(false)

  // Update useEffect to handle loading state and prevent repeated calls
  useEffect(() => {
    const fetchData = async () => {
      if (hasInitialData) return // Don't fetch if we already have data
      
      setIsLoading(true)
      try {
        await dispatch(fetchAgentData(agentId))
        setHasInitialData(true)
      } catch (error) {
        console.error('Failed to fetch agent data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dispatch, agentId, hasInitialData]) // Add hasInitialData to dependencies

  // Add a separate useEffect to handle selectedContentId updates
  useEffect(() => {
    if (displayPosts.length > 0 && !selectedContentId) {
      setSelectedContentId(displayPosts[0].id)
    }
  }, [displayPosts, selectedContentId])

  // Add this function for search suggestions
  const getSearchSuggestions = (query: string) => {
    const suggestions = []

    // Author suggestions
    const authors = [...new Set(displayPosts.map((item) => item.author))]
    const matchingAuthors = authors.filter((author) => author.toLowerCase().includes(query.toLowerCase())).slice(0, 2)

    matchingAuthors.forEach((author) => {
      suggestions.push({
        type: "author",
        label: `Author: ${author}`,
        query: `author:${author}`,
        count: displayPosts.filter((item) => item.author === author).length,
      })
    })

    // Keyword suggestions
    const allKeywords = displayPosts.flatMap((item) => item.keywords)
    const uniqueKeywords = [...new Set(allKeywords)]
    const matchingKeywords = uniqueKeywords
      .filter((keyword) => keyword.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)

    matchingKeywords.forEach((keyword) => {
      suggestions.push({
        type: "keyword",
        label: keyword,
        query: keyword,
        count: displayPosts.filter((item) => item.keywords.includes(keyword)).length,
      })
    })

    // Status suggestions
    if ("pending".includes(query.toLowerCase())) {
      suggestions.push({
        type: "status",
        label: "Status: Pending",
        query: "status:pending",
        count: displayPosts.filter((item) => item.status === "pending").length,
      })
    }

    return suggestions.slice(0, 5)
  }

  // Add this style tag for the scrollbar hiding
  React.useEffect(() => {
    // Add the style to hide scrollbars
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  React.useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  // Save search to recent when user presses Enter
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && searchQuery && isSearchFocused) {
        setRecentSearches((prev) => {
          const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 5)
          return updated
        })
      }
    }

    window.addEventListener("keypress", handleKeyPress)
    return () => window.removeEventListener("keypress", handleKeyPress)
  }, [searchQuery, isSearchFocused])

  // Update the agent object to use data from Redux
  const agent = {
    id: agentId,
    name: agentData?.agent_name || editedName,
    platform: agentType,
    status: agentState,
    lastActive: "5 mins ago",
    keyMetric: { value: displayPosts.length.toString(), label: "Posts Found" },
    secondaryMetric: { value: agentData?.goals?.length?.toString() || "0", label: "Goals" },
    healthScore: 90,
    weeklyActivity: displayPosts.length,
    description: agentData?.description || "Identifies potential leads by monitoring relevant subreddits.",
  }

  const toggleAgentStatus = async () => {
    try {
      const newStatus = agentState === 'active' ? 'paused' : 'active'
      await dispatch(updateAgentStatus({ agentId, status: newStatus }))
    } catch (error) {
      console.error('Failed to update agent status:', error)
    }
  }

  const saveAgentName = () => {
    setIsEditing(false)
  }

  const handleDeleteAgent = () => {
    setIsDeleteDialogOpen(false)
    router.push("/projects/1/agents")
  }

  const toggleDetailPane = () => {
    setShowDetailPane(!showDetailPane)
  }

  const toggleFilterExpanded = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  const toggleAgentStats = () => {
    setShowAgentStats(!showAgentStats)
  }

  const togglePerformance = () => {
    setIsPerformanceExpanded(!isPerformanceExpanded)
  }

  const toggleConfig = () => {
    setIsConfigExpanded(!isConfigExpanded)
  }

  // Update the filteredContent function to handle advanced search queries
  const filteredContent = displayPosts.filter((item) => {
    // Apply status filter
    if (statusFilter !== "all" && item.status !== statusFilter) return false

    // Apply search filter with advanced syntax support
    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      // Handle special search syntax
      if (query.startsWith("status:")) {
        const status = query.replace("status:", "").trim()
        return item.status === status
      }

      if (query.startsWith("author:")) {
        const author = query.replace("author:", "").trim()
        return item.author.toLowerCase().includes(author)
      }

      if (query.startsWith("relevance:>")) {
        const threshold = Number.parseInt(query.replace("relevance:>", "").trim())
        return item.relevance > threshold
      }

      if (query === "time:today") {
        return item.time.includes("min") || item.time.includes("hour")
      }

      // Regular search
      return (
        item.content.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      )
    }

    return true
  })

  const selectedContent = filteredContent.find((item) => item.id === selectedContentId) || filteredContent[0]

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
    )
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Layout>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Ultra Compact Header with Agent Info & Controls */}
          <div className="bg-white dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 py-1.5 px-3 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Agent Name */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-base font-semibold h-7 max-w-xs"
                      autoFocus
                    />
                    <Button size="sm" className="h-6 text-xs" onClick={saveAgentName}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <h1 className="text-base font-semibold">{agent.name}</h1>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1.5 py-0",
                    agent.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50",
                  )}
                >
                  {agent.status === "active" ? "Active" : "Paused"}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{agent.keyMetric.value} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{agent.secondaryMetric.value} goals</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-3 w-3" />
                  <span>{agent.healthScore}% health</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Switch
                  id="status"
                  checked={agent.status === "active"}
                  onCheckedChange={toggleAgentStatus}
                  className="scale-75"
                />
                <Label htmlFor="status" className="text-xs cursor-pointer hidden md:block">
                  {agent.status === "active" ? "Active" : "Paused"}
                </Label>
              </div>

              {/* View Selector Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Menu className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className={cn("text-xs cursor-pointer", activeView === "content" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => {
                      setActiveView("content")
                      setIsPerformanceExpanded(false)
                      setIsConfigExpanded(false)
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Content Management
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      "text-xs cursor-pointer",
                      activeView === "performance" && "bg-gray-100 dark:bg-gray-800",
                    )}
                    onClick={() => {
                      setActiveView("performance")
                      setIsPerformanceExpanded(true)
                      setIsConfigExpanded(false)
                    }}
                  >
                    <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                    Performance Metrics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn("text-xs cursor-pointer", activeView === "config" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => {
                      setActiveView("config")
                      setIsPerformanceExpanded(false)
                      setIsConfigExpanded(true)
                    }}
                  >
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    Configuration
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden md:inline ml-1">Delete</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Agent</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this agent? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAgent}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Content Management Section */}
            <div
              className={cn(
                "flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300",
                activeView !== "content" && "hidden",
              )}
            >
              <div className="flex justify-between items-center mb-2 px-3 flex-shrink-0">
                <h2 className="text-sm font-semibold">Content Management</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFilterExpanded}
                    className="hidden md:flex h-7 text-xs"
                  >
                    <FilterIcon className="h-3.5 w-3.5 mr-1.5" />
                    {isFilterExpanded ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleDetailPane} className="h-7 text-xs">
                    {showDetailPane ? (
                      <>
                        <ChevronRightIcon className="h-3.5 w-3.5 mr-1.5" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronLeftIcon className="h-3.5 w-3.5 mr-1.5" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-1 min-h-0 transition-all duration-300 ease-in-out",
                  "border border-gray-200 dark:border-gray-800 rounded-lg mx-3 overflow-hidden",
                  "bg-white dark:bg-gray-900/60",
                )}
              >
                {/* Left Pane - Content Feed */}
                <div
                  className={cn(
                    "flex flex-col transition-all duration-300 ease-in-out min-h-0",
                    showDetailPane ? "w-full lg:w-2/5" : "w-full",
                  )}
                >
                  {/* Filter Header - Fixed */}
                  <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">Agent Content Feed</h3>
                        <div className="flex items-center gap-2">
                          {/* Advanced Search Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-7 w-7 p-0 transition-all duration-200",
                              searchQuery && "text-blue-600 dark:text-blue-400",
                            )}
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                          >
                            <Search className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 md:hidden"
                            onClick={toggleFilterExpanded}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Unified Search and Filter Experience */}
                      {(isFilterExpanded || isSearchExpanded) && (
                        <div className="space-y-2">
                          {/* Search Bar - Enhanced Design */}
                          {isSearchExpanded && (
                            <div className="relative">
                              <div
                                className={cn(
                                  "relative transition-all duration-300 ease-out",
                                  isSearchFocused && "ring-2 ring-blue-500/20 dark:ring-blue-400/20 rounded-md",
                                )}
                              >
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200" />
                                <Input
                                  ref={searchInputRef}
                                  placeholder="Search posts, authors, keywords..."
                                  className={cn(
                                    "pl-10 pr-24 h-9 text-sm transition-all duration-200",
                                    "border-gray-200 dark:border-gray-700",
                                    "focus:border-blue-500 dark:focus:border-blue-400",
                                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                                  )}
                                  value={searchQuery}
                                  onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setShowSuggestions(true)
                                  }}
                                  onFocus={() => {
                                    setIsSearchFocused(true)
                                    setShowSuggestions(true)
                                  }}
                                  onBlur={() => {
                                    setIsSearchFocused(false)
                                    // Delay to allow clicking on suggestions
                                    setTimeout(() => setShowSuggestions(false), 200)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                      setSearchQuery("")
                                      setShowSuggestions(false)
                                      searchInputRef.current?.blur()
                                    }
                                  }}
                                />

                                {/* Search Actions */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {searchQuery && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                      onClick={() => {
                                        setSearchQuery("")
                                        searchInputRef.current?.focus()
                                      }}
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 h-5 bg-gray-100 dark:bg-gray-800"
                                  >
                                    {filteredContent.length}
                                  </Badge>
                                </div>
                              </div>

                              {/* Search Suggestions Dropdown */}
                              {showSuggestions && searchQuery && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
                                  {/* Recent Searches */}
                                  {recentSearches.length > 0 && (
                                    <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">Recent</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 text-xs px-1 hover:bg-transparent"
                                          onClick={() => setRecentSearches([])}
                                        >
                                          Clear
                                        </Button>
                                      </div>
                                      {recentSearches.slice(0, 3).map((search, idx) => (
                                        <button
                                          key={idx}
                                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center gap-2"
                                          onClick={() => {
                                            setSearchQuery(search)
                                            setShowSuggestions(false)
                                          }}
                                        >
                                          <Clock className="h-3 w-3 text-muted-foreground" />
                                          <span className="truncate">{search}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* Smart Suggestions */}
                                  <div className="p-2">
                                    <span className="text-xs font-medium text-muted-foreground px-2">Suggestions</span>
                                    <div className="mt-1 space-y-0.5">
                                      {getSearchSuggestions(searchQuery).map((suggestion, idx) => (
                                        <button
                                          key={idx}
                                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                          onClick={() => {
                                            setSearchQuery(suggestion.query)
                                            setShowSuggestions(false)
                                          }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              {suggestion.type === "author" && (
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                              )}
                                              {suggestion.type === "keyword" && (
                                                <Hash className="h-3 w-3 text-muted-foreground" />
                                              )}
                                              {suggestion.type === "status" && (
                                                <Flag className="h-3 w-3 text-muted-foreground" />
                                              )}
                                              <span className="truncate">{suggestion.label}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{suggestion.count}</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Quick Filters */}
                                  <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <span className="text-xs font-medium text-muted-foreground px-2">
                                      Quick Filters
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1 px-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                          setSearchQuery("status:pending")
                                          setShowSuggestions(false)
                                        }}
                                      >
                                        Pending Only
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                          setSearchQuery("relevance:>90")
                                          setShowSuggestions(false)
                                        }}
                                      >
                                        High Relevance
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                          setSearchQuery("time:today")
                                          setShowSuggestions(false)
                                        }}
                                      >
                                        Today
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Compact Filter Pills */}
                          {isFilterExpanded && (
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                              {/* Active Filters Display */}
                              {(statusFilter !== "all" || typeFilter !== "all-types" || timeFilter !== "24h") && (
                                <div className="flex items-center gap-1 mr-2">
                                  {statusFilter !== "all" && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5 pr-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                    >
                                      {statusFilter}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                                        onClick={() => setStatusFilter("all")}
                                      >
                                        <XIcon className="h-2.5 w-2.5" />
                                      </Button>
                                    </Badge>
                                  )}
                                  {typeFilter !== "all-types" && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5 pr-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    >
                                      {typeFilter}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                                        onClick={() => setTypeFilter("all-types")}
                                      >
                                        <XIcon className="h-2.5 w-2.5" />
                                      </Button>
                                    </Badge>
                                  )}
                                  {timeFilter !== "24h" && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5 pr-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                    >
                                      {timeFilter}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                                        onClick={() => setTimeFilter("24h")}
                                      >
                                        <XIcon className="h-2.5 w-2.5" />
                                      </Button>
                                    </Badge>
                                  )}
                                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                                </div>
                              )}

                              {/* Filter Options */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                    <FilterIcon className="h-3 w-3 mr-1" />
                                    Filters
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                  <div className="p-2 space-y-3">
                                    {/* Status Filter */}
                                    <div>
                                      <Label className="text-xs font-medium mb-1">Status</Label>
                                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">All Status</SelectItem>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="needs_review">Needs Review</SelectItem>
                                          <SelectItem value="escalated">Escalated</SelectItem>
                                          <SelectItem value="discarded">Discarded</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Type Filter */}
                                    <div>
                                      <Label className="text-xs font-medium mb-1">Type</Label>
                                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all-types">All Types</SelectItem>
                                          <SelectItem value="uem-inquiry">UEM Inquiry</SelectItem>
                                          <SelectItem value="competitor">Competitor Mention</SelectItem>
                                          <SelectItem value="negative">Negative Sentiment</SelectItem>
                                          <SelectItem value="lead">Lead Identified</SelectItem>
                                          <SelectItem value="agent-response">Agent Response</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Time Filter */}
                                    <div>
                                      <Label className="text-xs font-medium mb-1">Time Period</Label>
                                      <Select value={timeFilter} onValueChange={setTimeFilter}>
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1h">Past Hour</SelectItem>
                                          <SelectItem value="24h">Past 24 Hours</SelectItem>
                                          <SelectItem value="7d">Past Week</SelectItem>
                                          <SelectItem value="30d">Past Month</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Clear All */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full h-7 text-xs"
                                      onClick={() => {
                                        setStatusFilter("all")
                                        setTypeFilter("all-types")
                                        setTimeFilter("24h")
                                      }}
                                    >
                                      Clear All Filters
                                    </Button>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* Preset Filters */}
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={statusFilter === "pending" ? "default" : "outline"}
                                  className="px-2 h-7 text-xs cursor-pointer hover:bg-muted whitespace-nowrap"
                                  onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />
                                  Pending
                                </Badge>
                                <Badge
                                  variant={statusFilter === "needs_review" ? "default" : "outline"}
                                  className="px-2 h-7 text-xs cursor-pointer hover:bg-muted whitespace-nowrap"
                                  onClick={() =>
                                    setStatusFilter(statusFilter === "needs_review" ? "all" : "needs_review")
                                  }
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                                  Review
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="px-2 h-7 text-xs cursor-pointer hover:bg-muted whitespace-nowrap"
                                  onClick={() => {
                                    setTimeFilter("1h")
                                  }}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Recent
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content List - Scrollable */}
                  <ScrollArea className="flex-1 overflow-y-auto min-h-0">
                    {filteredContent.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium mb-1">No content found</h3>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters or search query</p>
                      </div>
                    ) : (
                      filteredContent.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200",
                            item.id === selectedContentId &&
                              "bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400",
                          )}
                          onClick={() => {
                            if (showDetailPane) {
                              setSelectedContentId(item.id)
                            } else {
                              // Open in new tab if details are hidden
                              window.open(item.url, "_blank", "noopener,noreferrer")
                            }
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-0.5 rounded-full">
                              <div className="h-4 w-4 flex items-center justify-center font-bold text-xs">R</div>
                            </div>
                            {item.platform === 'reddit' && (
                              <span className="text-xs font-medium">r/{item.subreddit || item.tag}</span>
                            )}
                            <div
                              className={cn(
                                "ml-auto px-1.5 py-0.5 rounded-full text-xs",
                                getStatusBadgeClass(item.status)
                              )}
                            >
                              {getStatusLabel(item.status)}
                            </div>
                          </div>

                          {/* Post Title */}
                          <h4 className="text-sm font-medium mb-1 line-clamp-1">{item.title}</h4>

                          {/* Post Content */}
                          <p className="text-xs leading-tight line-clamp-2 mb-1 text-muted-foreground">
                            {item.content}
                          </p>

                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="font-medium">u/{item.author}</span>
                            <span className="mx-1">•</span>
                            <span>{item.time}</span>

                            {/* Comments and Upvotes */}
                            <div className="flex items-center gap-2 ml-auto mr-1">
                              <div className="flex items-center gap-0.5">
                                <MessageSquare className="h-3 w-3" />
                                <span>{item.comments}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>{item.upvotes}</span>
                              </div>
                            </div>

                            {/* External Link */}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </div>

                {/* Right Pane - Content Details */}
                {showDetailPane && (
                  <div className="hidden lg:flex flex-col w-3/5 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out min-h-0">
                    {selectedContent ? (
                      <>
                        {/* Detail Header - Fixed */}
                        <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-semibold">Content Details</h3>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs px-1.5 py-0",
                                    getStatusBadgeClass(selectedContent.status)
                                  )}
                                >
                                  {getStatusLabel(selectedContent.status)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50 text-xs px-1.5 py-0"
                                >
                                  #{selectedContent.tag}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleDetailPane}>
                                  <ChevronRightIcon className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-0.5 rounded-full">
                                <div className="h-3.5 w-3.5 flex items-center justify-center font-bold text-xs">R</div>
                              </div>
                              {selectedContent.platform === 'reddit' && (
                                <span className="font-medium">r/{selectedContent.subreddit || selectedContent.tag}</span>
                              )}
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs flex items-center gap-1"
                                asChild
                              >
                                <a href={selectedContent.url} target="_blank" rel="noopener noreferrer">
                                  View Original
                                  <ExternalLink className="h-3 w-3 ml-0.5" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detail Content - Scrollable */}
                        <ScrollArea className="flex-1 overflow-y-auto min-h-0">
                          <div className="p-3 space-y-4">
                            {/* Original Content */}
                            <div>
                              <h4 className="text-sm font-medium mb-1.5">Original Content</h4>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="font-semibold text-base">u/{selectedContent.author}</span>
                                  <span className="text-sm text-muted-foreground">{selectedContent.time}</span>
                                  </div>
                                <h3 className="text-lg font-semibold mb-3">{selectedContent.title}</h3>
                                <div className="prose dark:prose-invert max-w-none">
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({node, ...props}: any) => <p className="text-sm leading-relaxed mb-4" {...props} />,
                                      h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                      h2: ({node, ...props}: any) => <h2 className="text-xl font-bold mb-3" {...props} />,
                                      h3: ({node, ...props}: any) => <h3 className="text-lg font-bold mb-2" {...props} />,
                                      ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                      ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                      li: ({node, ...props}: any) => <li className="text-sm" {...props} />,
                                      code: ({node, ...props}: any) => <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                                      pre: ({node, ...props}: any) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 overflow-x-auto" {...props} />,
                                      blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4" {...props} />,
                                      a: ({node, ...props}: any) => {
                                        // Check if the link is an image URL
                                        const href = props.href || '';
                                        if (href.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
                                          return (
                                            <img 
                                              src={href}
                                              alt={props.children?.[0] || 'Image'}
                                              className="max-w-full h-auto rounded-lg my-4"
                                              loading="lazy"
                                            />
                                          );
                                        }
                                        // Regular link
                                        return (
                                          <a 
                                            {...props} 
                                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline" 
                                          />
                                        );
                                      },
                                      img: ({node, ...props}: any) => {
                                        const [isLoading, setIsLoading] = React.useState(true);
                                        const [hasError, setHasError] = React.useState(false);

                                        return (
                                          <img 
                                            {...props} 
                                            className={`max-w-full h-auto rounded-lg my-4 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                            loading="lazy"
                                            onLoad={() => setIsLoading(false)}
                                            onError={() => {
                                              setIsLoading(false);
                                              setHasError(true);
                                            }}
                                          />
                                        );
                                      }
                                    } as Components}
                                  >
                                    {selectedContent.content}
                                  </ReactMarkdown>
                                    </div>
                              </div>
                            </div>

                            {/* AI Analysis */}
                            <div>
                              <h4 className="text-sm font-medium mb-1.5 flex items-center">
                                <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                AI Analysis & Insights
                              </h4>
                              <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                <div className="flex items-start gap-2">
                                  <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">Intent:</div>
                                  <div className="flex-1 text-sm">{selectedContent.intent}</div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">
                                    Sentiment:
                                  </div>
                                  <div className="flex-1 text-sm flex items-center gap-1.5">
                                    {selectedContent.sentiment === "positive" ? (
                                      <>
                                        <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                                        <span>Positive</span>
                                      </>
                                    ) : selectedContent.sentiment === "negative" ? (
                                      <>
                                        <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                                        <span>Negative</span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="h-3.5 w-3.5 rounded-full border border-gray-400"></div>
                                        <span>Neutral</span>
                                      </>
                                    )}
                                    {selectedContent.sentiment === "negative" && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (Expressing frustration with current solution)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">Keywords:</div>
                                  <div className="flex-1 flex flex-wrap gap-1">
                                    {selectedContent.keywords.map((keyword, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="bg-gray-50 dark:bg-gray-800 text-xs px-1.5 py-0"
                                      >
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">
                                    Relevance:
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{selectedContent.relevance}/100</span>
                                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                          className={cn(
                                            "h-full rounded-full transition-all duration-500 ease-out",
                                            selectedContent.relevance > 90
                                              ? "bg-green-500"
                                              : selectedContent.relevance > 75
                                                ? "bg-blue-500"
                                                : "bg-amber-500",
                                          )}
                                          style={{ width: `${selectedContent.relevance}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {selectedContent.relevance > 90
                                        ? "High relevance due to direct mention of Hexnode and specific MDM needs."
                                        : selectedContent.relevance > 75
                                          ? "Good relevance with mentions of MDM solutions and specific requirements."
                                          : "Moderate relevance to our product and services."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Agent Proposed Action */}
                            {selectedContent.aiResponse && (
                              <div>
                                <h4 className="text-sm font-medium mb-1.5 flex items-center">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  Agent Proposed Response
                                </h4>
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50">
                                  <Textarea
                                    className="min-h-[150px] text-sm border-blue-200 dark:border-blue-800/50 mb-2"
                                    value={selectedContent.aiResponse}
                                    onChange={() => {}}
                                  />
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                      <span className="font-medium">AI Confidence:</span>{" "}
                                      {selectedContent.aiConfidence >= 90
                                        ? "High"
                                        : selectedContent.aiConfidence >= 75
                                          ? "Medium"
                                          : "Low"}{" "}
                                      ({selectedContent.aiConfidence}%)
                                    </div>
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit Draft
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* No Response Yet */}
                            {!selectedContent.aiResponse && selectedContent.status !== "discarded" && (
                              <div>
                                <h4 className="text-sm font-medium mb-1.5 flex items-center">
                                  <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  No Response Draft
                                </h4>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm text-muted-foreground mb-3">
                                    No response has been drafted for this content yet.
                                  </p>
                                  <Button size="sm">Generate Response</Button>
                                </div>
                              </div>
                            )}

                            {/* Discarded Reason */}
                            {selectedContent.status === "discarded" && (
                              <div>
                                <h4 className="text-sm font-medium mb-1.5 flex items-center">
                                  <XIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  Discarded
                                </h4>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm text-muted-foreground">
                                    This content was discarded because it was deemed not relevant enough for a response.
                                  </p>
                                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Discarded yesterday by AI Agent</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                        {/* Action Buttons - Fixed */}
                        {selectedContent.status !== "discarded" && (
                          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                            <div className="flex flex-wrap gap-2">
                              {selectedContent.status === "pending" && (
                                <Button className="gap-1.5 h-8 text-xs">
                                  <CheckIcon className="h-3.5 w-3.5" />
                                  Approve & Post
                                </Button>
                              )}
                              {(selectedContent.status === "pending" || selectedContent.status === "needs_review") && (
                                <Button variant="outline" className="gap-1.5 h-8 text-xs">
                                  <XIcon className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              )}
                              {selectedContent.status !== "escalated" && (
                                <Button variant="outline" className="gap-1.5 h-8 text-xs">
                                  <UserPlusIcon className="h-3.5 w-3.5" />
                                  Escalate
                                </Button>
                              )}
                              <Button variant="outline" className="gap-1.5 h-8 text-xs">
                                <FlagIcon className="h-3.5 w-3.5" />
                                Flag
                              </Button>
                              <Button variant="outline" className="gap-1.5 h-8 text-xs">
                                <ShareIcon className="h-3.5 w-3.5" />
                                Share
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-4">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mx-auto mb-2 w-fit">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-medium mb-1">No content selected</h3>
                          <p className="text-xs text-muted-foreground">Select an item from the list to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Detail View - Only shown when detail pane is active on mobile */}
              {showDetailPane && selectedContent && (
                <div className="lg:hidden mt-2 mx-3 mb-3 bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Content Details</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleDetailPane}>
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[50vh] overflow-y-auto">
                    <div className="p-3 space-y-4">
                      {/* Original Content */}
                      <div>
                        <h4 className="text-sm font-medium mb-1.5">Original Content</h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold text-base">u/{selectedContent.author}</span>
                            <span className="text-sm text-muted-foreground">{selectedContent.time}</span>
                          </div>
                          <h3 className="text-lg font-semibold mb-3">{selectedContent.title}</h3>
                          <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({node, ...props}: any) => <p className="text-sm leading-relaxed mb-4" {...props} />,
                                h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                h2: ({node, ...props}: any) => <h2 className="text-xl font-bold mb-3" {...props} />,
                                h3: ({node, ...props}: any) => <h3 className="text-lg font-bold mb-2" {...props} />,
                                ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                li: ({node, ...props}: any) => <li className="text-sm" {...props} />,
                                code: ({node, ...props}: any) => <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                                pre: ({node, ...props}: any) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 overflow-x-auto" {...props} />,
                                blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4" {...props} />,
                                a: ({node, ...props}: any) => {
                                  // Check if the link is an image URL
                                  const href = props.href || '';
                                  if (href.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
                                    return (
                                      <img 
                                        src={href}
                                        alt={props.children?.[0] || 'Image'}
                                        className="max-w-full h-auto rounded-lg my-4"
                                        loading="lazy"
                                      />
                                    );
                                  }
                                  // Regular link
                                  return (
                                    <a 
                                      {...props} 
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline" 
                                    />
                                  );
                                },
                                img: ({node, ...props}: any) => {
                                  const [isLoading, setIsLoading] = React.useState(true);
                                  const [hasError, setHasError] = React.useState(false);

                                  return (
                                    <img 
                                      {...props} 
                                      className={`max-w-full h-auto rounded-lg my-4 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                      loading="lazy"
                                      onLoad={() => setIsLoading(false)}
                                      onError={() => {
                                        setIsLoading(false);
                                        setHasError(true);
                                      }}
                                    />
                                  );
                                }
                              } as Components}
                            >
                              {selectedContent.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div>
                        <h4 className="text-sm font-medium mb-1.5">AI Analysis</h4>
                        <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                          <div className="flex items-start gap-2">
                            <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">Intent:</div>
                            <div className="flex-1 text-sm">{selectedContent.intent}</div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">Sentiment:</div>
                            <div className="flex-1 text-sm">
                              {selectedContent.sentiment.charAt(0).toUpperCase() + selectedContent.sentiment.slice(1)}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-20 text-xs font-medium text-muted-foreground pt-0.5">Keywords:</div>
                            <div className="flex-1 flex flex-wrap gap-1">
                              {selectedContent.keywords.map((keyword, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-gray-50 dark:bg-gray-800 text-xs px-1.5 py-0"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agent Proposed Action */}
                      {selectedContent.aiResponse && (
                        <div>
                          <h4 className="text-sm font-medium mb-1.5">Agent Proposed Response</h4>
                          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50">
                            <Textarea
                              className="min-h-[120px] text-sm border-blue-200 dark:border-blue-800/50 mb-2"
                              value={selectedContent.aiResponse}
                              onChange={() => {}}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Action Buttons */}
                  {selectedContent.status !== "discarded" && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedContent.status === "pending" && (
                          <Button className="gap-1.5 h-8 text-xs col-span-2">
                            <CheckIcon className="h-3.5 w-3.5" />
                            Approve & Post
                          </Button>
                        )}
                        <Button variant="outline" className="gap-1.5 h-8 text-xs">
                          <XIcon className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button variant="outline" className="gap-1.5 h-8 text-xs">
                          <UserPlusIcon className="h-3.5 w-3.5" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance Section */}
            <div
              className={cn(
                "flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300",
                activeView !== "performance" && "hidden",
              )}
            >
              <div className="p-3 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Performance Metrics</h2>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActiveView("content")}>
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
                          <p className="text-xl font-bold">{performanceData.responseRate}%</p>
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
                          <p className="text-xl font-bold">{performanceData.conversionRate}%</p>
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
                          <p className="text-xl font-bold">{performanceData.averageResponseTime}</p>
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
                        {Object.entries(performanceData.platformBreakdown).map(([platform, percentage]) => (
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
                                      : "bg-blue-700",
                                )}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium mb-3">Sentiment Analysis</h3>
                      <div className="space-y-2">
                        {Object.entries(performanceData.sentimentAnalysis).map(([sentiment, percentage]) => (
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
                                      : "bg-red-500",
                                )}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
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
            </div>

            {/* Configuration Section */}
            <div
              className={cn(
                "flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300",
                activeView !== "config" && "hidden",
              )}
            >
              <div className="p-3 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Agent Configuration</h2>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActiveView("content")}>
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
                      <Textarea id="agent-description" defaultValue={agent.description} className="min-h-[100px]" />
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
                          <SelectItem value="assisted">Assisted (Requires Approval)</SelectItem>
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
                      <Input id="max-responses" type="number" defaultValue="50" className="h-9" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confidence-threshold" className="text-sm">
                        Confidence Threshold (%)
                      </Label>
                      <Input id="confidence-threshold" type="number" defaultValue="75" className="h-9" />
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
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
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
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}
