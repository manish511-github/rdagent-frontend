"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Palette,
  Code,
  Megaphone,
  PenTool,
  Package,
  FileText,
  Hash,
  Target,
  Briefcase,
  Flag,
  Activity,
  Layers,
  MessageSquare,
  DollarSign,
  PieChart,
  TrendingDown,
  Lightbulb,
  CalendarDays,
  Globe,
  Loader2,
  X,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import React from "react"
import Cookies from 'js-cookie';
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { refreshAccessToken } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { ProjectStats } from "./ProjectStats";
import { Project } from "./projectTypes";
import { getStatusColor, getPriorityColor, getHealthColor, formatCurrency, getDaysUntilDue, formatRelativeDate } from "./projectUtils";
import { projectCategories, projectStatuses, priorityLevels, healthStatuses } from "./projectConstants";
import { CreateProjectDialog } from "./CreateProjectDialog";


interface WebsiteAnalysisResult {
  url: string;
  title: string;
  description: string;
  target_audience: string;
  keywords: string[];
  main_category: string;
}

// Replace mock function with API call
const analyzeWebsite = async (url: string) => {
  try {
    const response = await fetch('http://localhost:8000/scraper/scrape-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      // Attempt to read error message from response body if available
      const errorBody = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
    }

    const data: WebsiteAnalysisResult = await response.json();

    // Map API response to the expected project structure
    return {
      title: data.title,
      description: data.description,
      targetAudience: data.target_audience,
      // The API does not provide competitors, excludedKeywords, or priority.
      // We will initialize them as empty or default values.
      competitors: [],
      keywords: data.keywords,
      excludedKeywords: [],
      category: data.main_category || 'marketing', // Default to 'marketing' if category is missing
      priority: 'medium', // Default to 'medium' if priority is missing
    };
  } catch (error: any) {
    console.error("Error analyzing website:", error);
    throw new Error(`Failed to analyze website: ${error.message || 'Unknown error'}`);
  }
};

export default function ProjectsPage() {
  const router = useRouter()
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null)
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { items: projects, status, error } = useSelector((state: RootState) => state.projects);
  
  // All state declarations
  const [view, setView] = useState<"grid" | "list" | "kanban">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    targetAudience: "",
    websiteUrl: "",
    category: "marketing",
    priority: "medium",
    dueDate: "",
    budget: "",
    team: [],
    tags: "",
    competitors: [] as string[],
    keywords: [] as string[],
    excludedKeywords: [] as string[],
  })

  // URL analysis state
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState("")
  const [activeTab, setActiveTab] = useState("url")

  // Competitor, keyword, and excluded keyword input states
  const [competitorInput, setCompetitorInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [excludedKeywordInput, setExcludedKeywordInput] = useState("")

  // Toast hook
  const { toast } = useToast()

  // Fetch projects on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        setShowCreateDialog(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (showCreateDialog) {
      setNewProject({
        title: "",
        description: "",
        targetAudience: "",
        websiteUrl: "",
        category: "marketing",
        priority: "medium",
        dueDate: "",
        budget: "",
        team: [],
        tags: "",
        competitors: [],
        keywords: [],
        excludedKeywords: [],
      })
      setWebsiteUrl("")
      setIsAnalyzing(false)
      setAnalysisError("")
      setActiveTab("url")
    }
  }, [showCreateDialog])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(project.tags) ? project.tags : []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((project) => project.category.toLowerCase() === categoryFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status.toLowerCase().replace(" ", "-") === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((project) => project.priority.toLowerCase() === priorityFilter)
    }

    // Health filter
    if (healthFilter !== "all") {
      filtered = filtered.filter((project) => project.health === healthFilter)
    }

    // Starred filter
    if (showStarredOnly) {
      filtered = filtered.filter((project) => project.starred)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "oldest":
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        case "name-asc":
          return a.title.localeCompare(b.title)
        case "name-desc":
          return b.title.localeCompare(a.title)
        case "due-date":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "progress":
          return b.progress - a.progress
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return (
            priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] -
            priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder]
          )
        default:
          return 0
      }
    })

    return filtered
  }, [projects, searchQuery, categoryFilter, statusFilter, priorityFilter, healthFilter, showStarredOnly, sort])

  // Project statistics
  const projectStats = useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.status !== "Completed").length
    const completed = projects.filter((p) => p.status === "Completed").length
    const atRisk = projects.filter((p) => p.health === "at-risk").length
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0)

    return { total, active, completed, atRisk, totalBudget, totalSpent }
  }, [projects])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">Failed to load projects</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => dispatch(fetchProjects())}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle website URL analysis
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      setAnalysisError("Please enter a website URL")
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisError("")

      // Call the mock API function
      const result = await analyzeWebsite(websiteUrl)

      // Update the form with the results
      setNewProject({
        ...newProject,
        title: result.title,
        description: result.description,
        targetAudience: result.targetAudience,
        websiteUrl: websiteUrl,
        category: result.category,
        priority: result.priority,
        competitors: result.competitors,
        keywords: result.keywords,
        excludedKeywords: result.excludedKeywords,
      })
    } catch (error) {
      setAnalysisError("Failed to analyze website. Please try again or enter details manually.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle adding a competitor
  const addCompetitor = () => {
    if (competitorInput.trim() && !newProject.competitors.includes(competitorInput.trim())) {
      setNewProject({
        ...newProject,
        competitors: [...newProject.competitors, competitorInput.trim()],
      })
      setCompetitorInput("")
    }
  }

  // Handle removing a competitor
  const removeCompetitor = (competitor: string) => {
    setNewProject({
      ...newProject,
      competitors: newProject.competitors.filter((c) => c !== competitor),
    })
  }

  // Handle adding a keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !newProject.keywords.includes(keywordInput.trim())) {
      setNewProject({
        ...newProject,
        keywords: [...newProject.keywords, keywordInput.trim()],
      })
      setKeywordInput("")
    }
  }

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    setNewProject({
      ...newProject,
      keywords: newProject.keywords.filter((k) => k !== keyword),
    })
  }

  // Handle adding an excluded keyword
  const addExcludedKeyword = () => {
    if (excludedKeywordInput.trim() && !newProject.excludedKeywords.includes(excludedKeywordInput.trim())) {
      setNewProject({
        ...newProject,
        excludedKeywords: [...newProject.excludedKeywords, excludedKeywordInput.trim()],
      })
      setExcludedKeywordInput("")
    }
  }

  // Handle removing an excluded keyword
  const removeExcludedKeyword = (keyword: string) => {
    setNewProject({
      ...newProject,
      excludedKeywords: newProject.excludedKeywords.filter((k) => k !== keyword),
    })
  }

  // Handle creating a new project
  const handleCreateProject = async () => {
    try {
      // Prepare project data matching the backend model
      const projectData = {
        title: newProject.title,
        description: newProject.description || null,
        target_audience: newProject.targetAudience || null,
        website_url: newProject.websiteUrl || null,
        category: newProject.category || null,
        priority: newProject.priority || null,
        due_date: newProject.dueDate || null,
        budget: newProject.budget || null,
        team: newProject.team || null,
        tags: newProject.tags || null,
        competitors: newProject.competitors || null,
        keywords: newProject.keywords || null,
        excluded_keywords: newProject.excludedKeywords || null,
      };

      console.log("Creating new project:", projectData);
      let token = Cookies.get("access_token");

      let response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData),
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch('http://localhost:8000/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData),
          });
        }
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
      }

      const createdProject = await response.json();
      console.log("Project created successfully:", createdProject);

      toast({
        title: "Project Created",
        description: `Project "${createdProject.title}" created successfully.`,
        variant: "default",
      });

    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to Create Project",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowCreateDialog(false);
    }
  }

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  // Select all projects
  const selectAllProjects = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(filteredProjects.map((p) => p.uuid))
    }
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    switch (action) {
      case "archive":
        console.log("Archiving projects:", selectedProjects)
        break
      case "delete":
        console.log("Deleting projects:", selectedProjects)
        break
      case "export":
        console.log("Exporting projects:", selectedProjects)
        break
    }
    setSelectedProjects([])
    setIsSelectionMode(false)
  }

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    
    if (!projectId) {
      toast({
        title: "Error",
        description: "Invalid project ID",
        variant: "destructive",
      })
      return
    }
    setLoadingProjectId(projectId)
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className=" bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-muted-foreground mt-1">Manage and track all your projects in one place</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <ProjectStats projectStats={projectStats} />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-4 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-3xl">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 h-8 text-xs bg-background/60 dark:bg-slate-900/60 backdrop-blur-sm"
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                <Filter className="mr-1.5 h-3 w-3" />
                Filters
                {(categoryFilter !== "all" ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  healthFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px]">
                    {[categoryFilter, statusFilter, priorityFilter, healthFilter].filter((f) => f !== "all").length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="p-2 space-y-3 text-xs">
                {/* Category Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map((status) => {
                        const Icon = status.icon;
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => {
                        const Icon = priority.icon;
                        return (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {priority.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Health Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Health</Label>
                  <Select value={healthFilter} onValueChange={setHealthFilter}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {healthStatuses.map((health) => {
                        const Icon = health.icon;
                        return (
                          <SelectItem key={health.value} value={health.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {health.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-1" />

                {/* Reset Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={() => {
                    setCategoryFilter("all")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                    setHealthFilter("all")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                <SlidersHorizontal className="mr-1.5 h-3 w-3" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSort("newest")} className="text-xs">
                <Clock className="mr-2 h-3 w-3" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("oldest")} className="text-xs">
                <Clock className="mr-2 h-3 w-3" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name-asc")} className="text-xs">
                <ArrowUp className="mr-2 h-3 w-3" />
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name-desc")} className="text-xs">
                <ArrowDown className="mr-2 h-3 w-3" />
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("due-date")} className="text-xs">
                <Calendar className="mr-2 h-3 w-3" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("progress")} className="text-xs">
                <TrendingUp className="mr-2 h-3 w-3" />
                Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("priority")} className="text-xs">
                <Flag className="mr-2 h-3 w-3" />
                Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Starred Toggle */}
          <Button
            variant={showStarredOnly ? "default" : "outline"}
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={() => setShowStarredOnly(!showStarredOnly)}
          >
            <Star className="mr-1.5 h-3 w-3" fill={showStarredOnly ? "currentColor" : "none"} />
            {showStarredOnly ? "Starred" : "All"}
          </Button>

          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-md p-0.5 h-8">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setView("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setView("kanban")}
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setHealthFilter("all")
                  setShowStarredOnly(false)
                }}
              >
                Clear all filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className={cn(
            view === "grid" && "grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
            view === "list" && "flex flex-col w-full",
            view === "kanban" && "grid-cols-1",
          )}>
            {view === "kanban" ? (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Kanban view coming soon...</p>
                </div>
              </Card>
            ) : (
              <>
                {view === "list" && (
                  <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground border-b bg-background/80 sticky top-0 z-10">
                    <div className="col-span-3 flex items-center gap-1">Name</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-3">About</div>
                    <div className="col-span-2">Members</div>
                    <div className="col-span-2">Progress</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                )}
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.uuid}
                    project={project}
                    index={index}
                    isSelected={selectedProjects.includes(project.uuid)}
                    isSelectionMode={isSelectionMode}
                    loadingProjectId={loadingProjectId}
                    selectedProjects={selectedProjects}
                    animateIn={animateIn}
                    toggleProjectSelection={toggleProjectSelection}
                    handleProjectClick={handleProjectClick}
                    view={view}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          newProject={newProject}
          setNewProject={setNewProject}
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          analysisError={analysisError}
          setAnalysisError={setAnalysisError}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          competitorInput={competitorInput}
          setCompetitorInput={setCompetitorInput}
          keywordInput={keywordInput}
          setKeywordInput={setKeywordInput}
          excludedKeywordInput={excludedKeywordInput}
          setExcludedKeywordInput={setExcludedKeywordInput}
          addCompetitor={addCompetitor}
          removeCompetitor={removeCompetitor}
          addKeyword={addKeyword}
          removeKeyword={removeKeyword}
          addExcludedKeyword={addExcludedKeyword}
          removeExcludedKeyword={removeExcludedKeyword}
          handleAnalyzeWebsite={handleAnalyzeWebsite}
          handleCreateProject={handleCreateProject}
          canCreate={!!newProject.title && !!newProject.description && !!newProject.targetAudience && newProject.keywords.length > 0}
        />
      </div>
    </div>
  )
}
