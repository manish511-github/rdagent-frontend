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

interface Project {
  uuid: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  startDate: string;
  lastUpdated: string;
  priority: string;
  category: string;
  budget: number;
  budgetSpent: number;
  team: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tags: string[];
  metrics: {
    tasks: number;
    completed: number;
    comments: number;
    attachments: number;
  };
  health: string;
  starred: boolean;
  icon: LucideIcon;
}

// Enhanced project data with more fields
const projects = [
  {
    uuid: "1",
    title: "Marketing Campaign Q2",
    description: "Q2 2025 product launch campaign planning and execution across multiple channels",
    status: "In Progress",
    progress: 65,
    dueDate: "2025-06-15",
    startDate: "2025-04-01",
    lastUpdated: "2025-05-20",
    priority: "High",
    category: "Marketing",
    budget: 150000,
    budgetSpent: 97500,
    team: [
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ", role: "Project Lead" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG", role: "Designer" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK", role: "Content Writer" },
    ],
    tags: ["marketing", "campaign", "product-launch", "q2-2025"],
    metrics: {
      tasks: 24,
      completed: 16,
      comments: 38,
      attachments: 12,
    },
    health: "on-track",
    starred: true,
    icon: <Megaphone className="h-4 w-4" />,
    color: "blue",
  },
  {
    uuid: "2",
    title: "Website Redesign",
    description: "Complete overhaul of company website with new branding and improved user experience",
    status: "Planning",
    progress: 25,
    dueDate: "2025-07-20",
    startDate: "2025-05-01",
    lastUpdated: "2025-05-18",
    priority: "Medium",
    category: "Design",
    budget: 80000,
    budgetSpent: 20000,
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC", role: "Lead Designer" },
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ", role: "Developer" },
      { name: "Liam Williams", avatar: "/abstract-lw.png", initials: "LW", role: "UX Researcher" },
    ],
    tags: ["design", "website", "branding", "ux"],
    metrics: {
      tasks: 32,
      completed: 8,
      comments: 27,
      attachments: 45,
    },
    health: "at-risk",
    starred: false,
    icon: <Palette className="h-4 w-4" />,
    color: "purple",
  },
  {
    uuid: "3",
    title: "Product Launch - Alpha Series",
    description: "New product line introduction to market with comprehensive go-to-market strategy",
    status: "Completed",
    progress: 100,
    dueDate: "2025-05-05",
    startDate: "2025-02-01",
    lastUpdated: "2025-05-05",
    priority: "High",
    category: "Product",
    budget: 200000,
    budgetSpent: 185000,
    team: [
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG", role: "Product Manager" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS", role: "Marketing Lead" },
      { name: "Taylor Adams", avatar: "/ta-symbol.png", initials: "TA", role: "Sales Director" },
    ],
    tags: ["product", "launch", "marketing", "alpha-series"],
    metrics: {
      tasks: 45,
      completed: 45,
      comments: 72,
      attachments: 28,
    },
    health: "completed",
    starred: true,
    icon: <Package className="h-4 w-4" />,
    color: "green",
  },
  {
    uuid: "4",
    title: "Social Media Strategy 2025",
    description: "Develop comprehensive social media plan for Q3 with focus on engagement and growth",
    status: "In Progress",
    progress: 40,
    dueDate: "2025-06-30",
    startDate: "2025-05-10",
    lastUpdated: "2025-05-22",
    priority: "Medium",
    category: "Marketing",
    budget: 50000,
    budgetSpent: 20000,
    team: [
      { name: "Jordan Lee", avatar: "/stylized-jl-logo.png", initials: "JL", role: "Social Media Manager" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK", role: "Content Creator" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG", role: "Analyst" },
    ],
    tags: ["social-media", "strategy", "content", "engagement"],
    metrics: {
      tasks: 18,
      completed: 7,
      comments: 23,
      attachments: 15,
    },
    health: "on-track",
    starred: false,
    icon: <Hash className="h-4 w-4" />,
    color: "pink",
  },
  {
    uuid: "5",
    title: "Brand Guidelines 2.0",
    description: "Create comprehensive brand style guide and assets for global consistency",
    status: "Review",
    progress: 85,
    dueDate: "2025-06-10",
    startDate: "2025-03-15",
    lastUpdated: "2025-05-19",
    priority: "Low",
    category: "Design",
    budget: 30000,
    budgetSpent: 25500,
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC", role: "Brand Designer" },
      { name: "Morgan Bailey", avatar: "/monogram-mb.png", initials: "MB", role: "Creative Director" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS", role: "Copywriter" },
    ],
    tags: ["branding", "design", "guidelines", "style-guide"],
    metrics: {
      tasks: 15,
      completed: 13,
      comments: 19,
      attachments: 52,
    },
    health: "on-track",
    starred: false,
    icon: <PenTool className="h-4 w-4" />,
    color: "orange",
  },
  {
    uuid: "6",
    title: "Content Calendar Q3",
    description: "Plan and organize content for Q3 across all channels with SEO optimization",
    status: "Planning",
    progress: 15,
    dueDate: "2025-07-05",
    startDate: "2025-05-20",
    lastUpdated: "2025-05-21",
    priority: "Medium",
    category: "Content",
    budget: 40000,
    budgetSpent: 6000,
    team: [
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK", role: "Content Manager" },
      { name: "Jordan Lee", avatar: "/stylized-jl-logo.png", initials: "JL", role: "SEO Specialist" },
    ],
    tags: ["content", "planning", "editorial", "seo"],
    metrics: {
      tasks: 22,
      completed: 3,
      comments: 12,
      attachments: 8,
    },
    health: "at-risk",
    starred: false,
    icon: <FileText className="h-4 w-4" />,
    color: "teal",
  },
  {
    uuid: "7",
    title: "Mobile App Development",
    description: "Native iOS and Android app development for customer engagement platform",
    status: "In Progress",
    progress: 55,
    dueDate: "2025-08-15",
    startDate: "2025-03-01",
    lastUpdated: "2025-05-23",
    priority: "High",
    category: "Development",
    budget: 250000,
    budgetSpent: 137500,
    team: [
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ", role: "Tech Lead" },
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC", role: "iOS Developer" },
      { name: "Liam Williams", avatar: "/abstract-lw.png", initials: "LW", role: "Android Developer" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG", role: "UI Designer" },
    ],
    tags: ["mobile", "app", "development", "ios", "android"],
    metrics: {
      tasks: 68,
      completed: 37,
      comments: 124,
      attachments: 35,
    },
    health: "on-track",
    starred: true,
    icon: <Code className="h-4 w-4" />,
    color: "indigo",
  },
  {
    uuid: "8",
    title: "Customer Research Initiative",
    description: "Comprehensive user research study to inform product roadmap and strategy",
    status: "Planning",
    progress: 20,
    dueDate: "2025-07-30",
    startDate: "2025-05-15",
    lastUpdated: "2025-05-22",
    priority: "Medium",
    category: "Research",
    budget: 60000,
    budgetSpent: 12000,
    team: [
      { name: "Liam Williams", avatar: "/abstract-lw.png", initials: "LW", role: "Research Lead" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK", role: "Data Analyst" },
      { name: "Taylor Adams", avatar: "/ta-symbol.png", initials: "TA", role: "Product Manager" },
    ],
    tags: ["research", "user-experience", "data", "insights"],
    metrics: {
      tasks: 28,
      completed: 6,
      comments: 18,
      attachments: 22,
    },
    health: "on-track",
    starred: false,
    icon: <Target className="h-4 w-4" />,
    color: "cyan",
  },
]

// Project categories with enhanced metadata
const projectCategories = [
  { value: "all", label: "All Categories", icon: <Layers className="h-4 w-4" />, color: "gray" },
  { value: "marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" />, color: "blue" },
  { value: "design", label: "Design", icon: <Palette className="h-4 w-4" />, color: "purple" },
  { value: "development", label: "Development", icon: <Code className="h-4 w-4" />, color: "indigo" },
  { value: "product", label: "Product", icon: <Package className="h-4 w-4" />, color: "green" },
  { value: "content", label: "Content", icon: <FileText className="h-4 w-4" />, color: "teal" },
  { value: "research", label: "Research", icon: <Target className="h-4 w-4" />, color: "cyan" },
]

// Project status options
const projectStatuses = [
  { value: "all", label: "All Status", icon: <Activity className="h-4 w-4" /> },
  { value: "planning", label: "Planning", icon: <Lightbulb className="h-4 w-4" />, color: "purple" },
  { value: "in-progress", label: "In Progress", icon: <Clock className="h-4 w-4" />, color: "blue" },
  { value: "review", label: "Review", icon: <AlertCircle className="h-4 w-4" />, color: "amber" },
  { value: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, color: "green" },
]

// Priority levels
const priorityLevels = [
  { value: "all", label: "All Priorities", icon: <Flag className="h-4 w-4" /> },
  { value: "low", label: "Low", icon: <ArrowDown className="h-4 w-4" />, color: "green" },
  { value: "medium", label: "Medium", icon: <ArrowUpDown className="h-4 w-4" />, color: "amber" },
  { value: "high", label: "High", icon: <ArrowUp className="h-4 w-4" />, color: "red" },
]

// Health status
const healthStatuses = [
  { value: "all", label: "All Health", icon: <Activity className="h-4 w-4" /> },
  { value: "on-track", label: "On Track", icon: <TrendingUp className="h-4 w-4" />, color: "green" },
  { value: "at-risk", label: "At Risk", icon: <AlertCircle className="h-4 w-4" />, color: "amber" },
  { value: "off-track", label: "Off Track", icon: <TrendingDown className="h-4 w-4" />, color: "red" },
  { value: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, color: "blue" },
]

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
          project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
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
      const token = Cookies.get("token");

      const response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData),
      });

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

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    if (!status) {
      return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30"
    }
    
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-blue-100/15 text-blue-800 dark:bg-blue-900/25 dark:text-blue-300 border-blue-800/30"
      case "in progress":
        return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30"
      case "planning":
        return "bg-blue-100/15 text-blue-900 dark:bg-blue-900/25 dark:text-blue-300 border-blue-900/30"
      case "review":
        return "bg-blue-100/15 text-blue-800 dark:bg-blue-900/25 dark:text-blue-300 border-blue-800/30"
      default:
        return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-blue-700"
      case "medium":
        return "text-blue-500"
      case "low":
        return "text-blue-400"
      default:
        return "text-blue-300"
    }
  }

  // Get health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case "on-track":
        return "text-blue-500"
      case "at-risk":
        return "text-blue-600"
      case "off-track":
        return "text-blue-700"
      case "completed":
        return "text-blue-400"
      default:
        return "text-blue-300"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: "Overdue", color: "text-blue-900" }
    if (diffDays === 0) return { text: "Due today", color: "text-blue-800" }
    if (diffDays === 1) return { text: "Due tomorrow", color: "text-blue-800" }
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-blue-700" }
    return { text: `${diffDays} days left`, color: "text-muted-foreground" }
  }

  // Format relative date
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "today"
    if (diffDays === 1) return "yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    debugger
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

  // Render project card
  const renderProjectCard = (project: (typeof projects)[0], index: number) => {
    const dueStatus = getDaysUntilDue(project.dueDate)
    const isSelected = selectedProjects.includes(project.uuid)
    const completedTasks = project.metrics?.completed ?? 0
    const totalTasks = project.metrics?.tasks ?? 0
    const comments = project.metrics?.comments ?? 0
    const health = project.health ?? 'on-track'
    const tags = Array.isArray(project.tags) ? project.tags : []
    const Icon = project.icon ?? Briefcase
    const isLoading = loadingProjectId === project.uuid

    return (
      <div
        key={project.uuid}
        className={cn(
          "group relative transform transition-all duration-500",
          animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        <Card 
          className={cn(
            "h-full overflow-hidden border border-blue-200/30 dark:border-blue-400/20 bg-card/50 dark:bg-slate-900/60 backdrop-blur-sm shadow-md dark:shadow-slate-900/10 hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/40 dark:hover:border-blue-400/30",
            isLoading && "cursor-wait"
          )}
          onClick={() => handleProjectClick(project.uuid)}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 dark:from-slate-800/20 dark:via-slate-900/5 dark:to-slate-950/30 pointer-events-none" />

          {/* Status indicator line */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-0.5",
              project.status === "Completed" && "bg-blue-400 dark:bg-blue-400",
              project.status === "In Progress" && "bg-blue-300 dark:bg-blue-300",
              project.status === "Planning" && "bg-blue-500 dark:bg-blue-500",
              project.status === "Review" && "bg-blue-400 dark:bg-blue-400",
            )}
          />

          {/* Selection checkbox */}
          {isSelectionMode && (
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleProjectSelection(project.uuid)}
                className="bg-background/95 backdrop-blur-sm border-2 h-4 w-4"
              />
            </div>
          )}

          {/* Star button */}
          <button
            className={cn(
              "absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200",
              project.starred
                ? "bg-amber-100/90 text-amber-600 dark:bg-amber-500/30 dark:text-amber-300"
                : "bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-500/20 dark:text-slate-400 dark:hover:text-amber-300",
            )}
            onClick={(e) => {
              e.preventDefault()
              // Toggle star logic here
            }}
          >
            <Star className="h-3 w-3" fill={project.starred ? "currentColor" : "none"} />
          </button>

          <Link href={`/projects/${project.uuid}`} className="block">
            <div className="p-5">
              <div className="flex items-start gap-3.5">
                {/* Icon */}
                <div
                  className={cn(
                    "p-2 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    "bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-400/30",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and badges */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-base font-semibold tracking-tight line-clamp-1 group-hover:text-primary dark:group-hover:text-primary/90 transition-colors font-sans">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-medium border-0 px-1.5 py-0 h-5",
                          getStatusColor(project.status),
                        )}
                      >
                        {project.status}
                      </Badge>
                      {project.priority === "High" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-900 dark:bg-blue-700" title="High Priority" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-foreground/80 dark:text-slate-100/90 line-clamp-4 mb-3 font-normal tracking-wide font-inter">
                    {project.description}
                  </p>

                  {/* Meta information */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Due date */}
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className={cn("h-3.5 w-3.5", dueStatus.color)} />
                        <span className={cn("text-xs font-medium", dueStatus.color)}>
                          {new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {completedTasks}/{totalTasks}
                        </span>
                      </div>
                    </div>

                    {/* Health indicator */}
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200",
                        health === "on-track" &&
                          "bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-300/50 dark:border-blue-400/30",
                        health === "at-risk" &&
                          "bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-300/50 dark:border-blue-400/30",
                        health === "off-track" &&
                          "bg-blue-100/80 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 border-blue-300/50 dark:border-blue-400/30",
                        health === "completed" &&
                          "bg-blue-100/80 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300 border-blue-300/50 dark:border-blue-400/30",
                      )}
                    >
                      <Activity className="h-3 w-3" />
                      <span className="capitalize">{health.replace("-", " ")}</span>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="flex items-center justify-between">
                    {/* Team */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {project.team.slice(0, 3).map((member) => (
                          <TooltipProvider key={member.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-6 w-6 border-2 border-background hover:z-10 transition-transform hover:scale-110">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                  <AvatarFallback className="text-[9px] font-semibold bg-muted">
                                    {member.initials}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-muted-foreground">{member.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        {project.team.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-semibold">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics and actions */}
                    <div className="flex items-center gap-3">
                      {/* Comments */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="font-medium">{comments}</span>
                      </div>

                      {/* Updated */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">{formatRelativeDate(project.lastUpdated)}</span>
                      </div>

                      {/* More actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-background/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Open in new tab
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Copy className="mr-2 h-3 w-3" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Archive className="mr-2 h-3 w-3" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive text-xs">
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] px-2 py-0 h-5 font-normal border-blue-200/40 dark:border-blue-400/20 text-muted-foreground dark:text-slate-300 hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors hover:border-blue-300/50 dark:hover:border-blue-400/30"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
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
              {isSelectionMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={selectAllProjects}>
                    {selectedProjects.length === filteredProjects.length ? "Deselect All" : "Select All"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions ({selectedProjects.length})
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSelectionMode(false)
                      setSelectedProjects([])
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-mode"
                      checked={isSelectionMode}
                      onCheckedChange={() => setIsSelectionMode(true)}
                      className="mr-2 h-4 w-4"
                    />
                    <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>
                      Select
                    </Button>
                  </div>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-card to-muted/20 dark:from-slate-900 dark:to-slate-950/80 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projectStats.total}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{projectStats.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-800/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/10 to-blue-950/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{projectStats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-900/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-800/30 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">At Risk</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{projectStats.atRisk}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-800/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/10 to-blue-950/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Budget</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
                      {formatCurrency(projectStats.totalBudget)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-900/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-800/30 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Budget Used</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-400">
                      {((projectStats.totalSpent / projectStats.totalBudget) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-800/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
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
                      {projectCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
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
                      {projectStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            {status.icon}
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
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
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            {priority.icon}
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
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
                      {healthStatuses.map((health) => (
                        <SelectItem key={health.value} value={health.value}>
                          <div className="flex items-center gap-2">
                            {health.icon}
                            {health.label}
                          </div>
                        </SelectItem>
                      ))}
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

        {/* Projects Grid */}
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
          <div
            className={cn(
              "grid gap-4",
              view === "grid" && "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
              view === "list" && "grid-cols-1",
              view === "kanban" && "grid-cols-1",
            )}
          >
            {view === "kanban" ? (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Kanban view coming soon...</p>
                </div>
              </Card>
            ) : (
              filteredProjects.map((project, index) => renderProjectCard(project, index))
            )}
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new project. You can always edit these later.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  From Website URL
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <div className="flex gap-1.5">
                    <Input
                      id="website-url"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      disabled={isAnalyzing}
                      className="flex-1"
                    />
                    <Button onClick={handleAnalyzeWebsite} disabled={isAnalyzing || !websiteUrl} className="gap-2">
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze"
                      )}
                    </Button>
                  </div>
                  {analysisError && <p className="text-sm text-destructive mt-1">{analysisError}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter a website URL to automatically extract project information. You can edit the details before
                    saving.
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Analyzing website content...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                  </div>
                ) : (
                  newProject.title && (
                    <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="project-title">Project Name (Required)</Label>
                          <Input
                            id="project-title"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            placeholder="Enter project name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website-link">Website URL (Optional)</Label>
                          <Input
                            id="website-link"
                            value={newProject.websiteUrl}
                            onChange={(e) => setNewProject({ ...newProject, websiteUrl: e.target.value })}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-description">Description (Required)</Label>
                        <Textarea
                          id="project-description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Describe your project"
                          rows={10}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target-audience">Target Audience (Required)</Label>
                        <Textarea
                          id="target-audience"
                          value={newProject.targetAudience}
                          onChange={(e) => setNewProject({ ...newProject, targetAudience: e.target.value })}
                          placeholder="Define your target audience"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="competitors">Competitors (Optional)</Label>
                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                          {newProject.competitors.map((competitor, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm flex items-center gap-1 px-2.5 py-1 bg-muted/30 text-foreground/80 border-border/40 hover:bg-muted/50 transition-colors"
                            >
                              {competitor}
                              <button
                                onClick={() => removeCompetitor(competitor)}
                                className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <Input
                            id="competitors"
                            value={competitorInput}
                            onChange={(e) => setCompetitorInput(e.target.value)}
                            placeholder="Add a competitor"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addCompetitor()
                              }
                            }}
                          />
                          <Button type="button" onClick={addCompetitor} variant="outline" size="sm" className="h-9">
                            Add
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="keywords">Keywords (Required)</Label>
                          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                            {newProject.keywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-sm font-normal flex items-center gap-1 px-2.5 py-1 bg-secondary/20 text-foreground/60 hover:bg-secondary/40 transition-colors"
                                >
                                {keyword}
                                <button
                                  onClick={() => removeKeyword(keyword)}
                                  className="ml-1.5 rounded-full hover:bg-secondary/70 transition-colors p-0.5"
                                  >
                                <X className="h-3 w-3 text-foreground/60" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <Input
                              id="keywords"
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              placeholder="Add a keyword"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addKeyword()
                                }
                              }}
                            />
                            <Button type="button" onClick={addKeyword} variant="outline" size="sm" className="h-9">
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="excluded-keywords">Excluded Keywords (Optional)</Label>
                          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                            {newProject.excludedKeywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-sm text-muted-foreground flex items-center gap-1 px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                {keyword}
                                <button
                                  onClick={() => removeExcludedKeyword(keyword)}
                                  className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <Input
                              id="excluded-keywords"
                              value={excludedKeywordInput}
                              onChange={(e) => setExcludedKeywordInput(e.target.value)}
                              placeholder="Add an excluded keyword"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addExcludedKeyword()
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={addExcludedKeyword}
                              variant="outline"
                              size="sm"
                              className="h-9"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-3 mt-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="manual-project-title">Project Name (Required)</Label>
                    <Input
                      id="manual-project-title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-website-link">Website URL (Optional)</Label>
                    <Input
                      id="manual-website-link"
                      value={newProject.websiteUrl}
                      onChange={(e) => setNewProject({ ...newProject, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-project-description">Description (Required)</Label>
                  <Textarea
                    id="manual-project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-target-audience">Target Audience (Required)</Label>
                  <Textarea
                    id="manual-target-audience"
                    value={newProject.targetAudience}
                    onChange={(e) => setNewProject({ ...newProject, targetAudience: e.target.value })}
                    placeholder="Define your target audience"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-competitors">Competitors (Optional)</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                    {newProject.competitors.map((competitor, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm flex items-center gap-1 px-2.5 py-1 bg-muted/30 text-foreground/80 border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        {competitor}
                        <button
                          onClick={() => removeCompetitor(competitor)}
                          className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      id="manual-competitors"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      placeholder="Add a competitor"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCompetitor()
                        }
                      }}
                    />
                    <Button type="button" onClick={addCompetitor} variant="outline" size="sm" className="h-9">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="manual-keywords">Keywords (Required)</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                      {newProject.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm flex items-center gap-1 px-2.5 py-1 bg-secondary/30 text-foreground/80 hover:bg-secondary/50 transition-colors"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1.5 rounded-full hover:bg-secondary/80 transition-colors p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        id="manual-keywords"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add a keyword"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyword} variant="outline" size="sm" className="h-9">
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual-excluded-keywords">Excluded Keywords (Optional)</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                      {newProject.excludedKeywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm text-muted-foreground flex items-center gap-1 px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          {keyword}
                          <button
                            onClick={() => removeExcludedKeyword(keyword)}
                            className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        id="manual-excluded-keywords"
                        value={excludedKeywordInput}
                        onChange={(e) => setExcludedKeywordInput(e.target.value)}
                        placeholder="Add an excluded keyword"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addExcludedKeyword()
                          }
                        }}
                      />
                      <Button type="button" onClick={addExcludedKeyword} variant="outline" size="sm" className="h-9">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={
                  !newProject.title ||
                  !newProject.description ||
                  !newProject.targetAudience ||
                  newProject.keywords.length === 0
                }
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
