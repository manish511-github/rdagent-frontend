"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Settings,
  Share2,
  Star,
  Edit,
  X,
  ExternalLink,
  Globe,
  Tag,
  Users,
  Target,
  BarChart3,
  ChevronRight,
  FileText,
  Calendar,
} from "lucide-react"
import SocialMediaCards from "@/components/kokonutui/social-media-cards"
import MarketingAnalyticsCards from "@/components/kokonutui/marketing-analytics-cards"
import ContentAnalyticsCards from "@/components/kokonutui/content-analytics-cards"
import PotentialCustomerAnalytics from "@/components/kokonutui/potential-customer-analytics"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const MOCK_PROJECTS = {
  "1": {
    id: "1",
    name: "Marketing Campaign Q2",
    description: "Q2 2025 marketing campaign assets and planning",
    targetAudience: "Millennials and Gen Z consumers interested in sustainable products",
    websiteLink: "https://example.com/campaign-q2",
    competitors: ["CompetitorX", "MarketLeader Inc.", "InnovativeBrand"],
    keywords: ["marketing", "campaign", "q2", "promotion", "digital"],
    excludedKeywords: ["competitor", "negative"],
    lastUpdated: "2025-05-18T14:30:00Z",
    status: "active",
    favorite: true,
    thumbnail: "/marketing-campaign-brainstorm.png",
    progress: 68,
    team: ["John D.", "Sarah L.", "Mike T."],
    tasks: {
      total: 24,
      completed: 16,
      inProgress: 5,
      notStarted: 3,
    },
    recentActivities: [
      { user: "Sarah L.", action: "updated the campaign brief", time: "2 hours ago" },
      { user: "Mike T.", action: "uploaded 5 new social media assets", time: "Yesterday" },
      { user: "John D.", action: "completed the email template design", time: "2 days ago" },
      { user: "Sarah L.", action: "scheduled a team meeting", time: "3 days ago" },
    ],
    upcomingDeadlines: [
      { task: "Finalize social media calendar", dueDate: "2025-05-25" },
      { task: "Complete landing page design", dueDate: "2025-05-28" },
      { task: "Prepare campaign analytics report", dueDate: "2025-06-05" },
    ],
  },
  "2": {
    id: "2",
    name: "Website Redesign",
    description: "Company website redesign project with new branding",
    targetAudience: "Small to medium business owners and corporate decision makers",
    websiteLink: "https://example.com/redesign-preview",
    competitors: ["DesignAgency", "WebCrafters", "UXMasters"],
    keywords: ["website", "redesign", "branding", "ui", "ux"],
    excludedKeywords: ["old design", "legacy"],
    lastUpdated: "2025-05-15T09:45:00Z",
    status: "active",
    favorite: false,
    thumbnail: "/website-design-concept.png",
    progress: 42,
    team: ["Alex K.", "Emma R."],
    tasks: {
      total: 18,
      completed: 7,
      inProgress: 8,
      notStarted: 3,
    },
    recentActivities: [
      { user: "Alex K.", action: "updated the homepage wireframe", time: "5 hours ago" },
      { user: "Emma R.", action: "added new brand colors to the style guide", time: "Yesterday" },
      { user: "Alex K.", action: "completed the mobile navigation design", time: "3 days ago" },
    ],
    upcomingDeadlines: [
      { task: "Finalize homepage design", dueDate: "2025-05-30" },
      { task: "Complete responsive layouts", dueDate: "2025-06-10" },
      { task: "Prepare content migration plan", dueDate: "2025-06-15" },
    ],
  },
  "3": {
    id: "3",
    name: "Product Launch",
    description: "New product launch campaign and materials",
    targetAudience: "Tech enthusiasts and early adopters aged 25-45",
    websiteLink: "https://example.com/new-product",
    competitors: ["TechGiant", "InnovateNow", "FutureTech"],
    keywords: ["product launch", "new product", "marketing", "sales"],
    excludedKeywords: ["beta", "prototype", "discontinued"],
    lastUpdated: "2025-05-10T16:20:00Z",
    status: "active",
    favorite: true,
    thumbnail: "/product-launch-excitement.png",
    progress: 85,
    team: ["Chris B.", "Diana M.", "Frank O.", "Grace P."],
    tasks: {
      total: 32,
      completed: 27,
      inProgress: 4,
      notStarted: 1,
    },
    recentActivities: [
      { user: "Diana M.", action: "finalized the press release", time: "1 hour ago" },
      { user: "Frank O.", action: "updated the launch timeline", time: "Yesterday" },
      { user: "Grace P.", action: "completed the product demo video", time: "2 days ago" },
      { user: "Chris B.", action: "confirmed the launch event venue", time: "4 days ago" },
    ],
    upcomingDeadlines: [
      { task: "Send press invitations", dueDate: "2025-05-22" },
      { task: "Finalize event schedule", dueDate: "2025-05-25" },
      { task: "Complete media kit", dueDate: "2025-05-28" },
    ],
  },
}

const DEFAULT_PROJECT = {
  id: "new",
  name: "New Project",
  description: "Your new project description",
  targetAudience: "Define your target audience here",
  websiteLink: "",
  competitors: [],
  keywords: [],
  excludedKeywords: [],
  lastUpdated: new Date().toISOString(),
  status: "active",
  favorite: false,
  thumbnail: "/new-project-concept.png",
  progress: 0,
  team: ["You"],
  tasks: {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  },
  recentActivities: [{ user: "You", action: "created this project", time: "Just now" }],
  upcomingDeadlines: [],
}

export default function ProjectDashboard({ projectId }: { projectId: string }) {
  const [project, setProject] = useState(MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] || DEFAULT_PROJECT)
  const [isFavorite, setIsFavorite] = useState(project.favorite)

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)
  const [editedDescription, setEditedDescription] = useState(project.description)
  const [editedTargetAudience, setEditedTargetAudience] = useState(project.targetAudience)
  const [editedWebsiteLink, setEditedWebsiteLink] = useState(project.websiteLink)
  const [editedKeywords, setEditedKeywords] = useState(project.keywords.join(", "))
  const [editedExcludedKeywords, setEditedExcludedKeywords] = useState(project.excludedKeywords.join(", "))
  const [keywordInput, setKeywordInput] = useState("")
  const [excludedKeywordInput, setExcludedKeywordInput] = useState("")

  const [editedCompetitors, setEditedCompetitors] = useState(project.competitors?.join(", ") || "")
  const [competitorInput, setCompetitorInput] = useState("")

  useEffect(() => {
    const projectData = MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] || DEFAULT_PROJECT
    setProject(projectData)
    setIsFavorite(projectData.favorite)

    setEditedName(projectData.name)
    setEditedDescription(projectData.description)
    setEditedTargetAudience(projectData.targetAudience)
    setEditedWebsiteLink(projectData.websiteLink)
    setEditedKeywords(projectData.keywords.join(", "))
    setEditedExcludedKeywords(projectData.excludedKeywords.join(", "))
    setEditedCompetitors(projectData.competitors?.join(", ") || "")
  }, [projectId])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const addCompetitor = () => {
    if (competitorInput.trim()) {
      const competitors = editedCompetitors ? editedCompetitors.split(",").map((k) => k.trim()) : []
      if (!competitors.includes(competitorInput.trim())) {
        competitors.push(competitorInput.trim())
        setEditedCompetitors(competitors.join(", "))
      }
      setCompetitorInput("")
    }
  }

  const removeCompetitor = (competitor: string) => {
    const competitors = editedCompetitors
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== competitor)
    setEditedCompetitors(competitors.join(", "))
  }

  const handleSaveChanges = () => {
    const updatedProject = {
      ...project,
      name: editedName,
      description: editedDescription,
      targetAudience: editedTargetAudience,
      websiteLink: editedWebsiteLink,
      competitors: editedCompetitors
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      keywords: editedKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      excludedKeywords: editedExcludedKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      lastUpdated: new Date().toISOString(),
    }
    setProject(updatedProject)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedName(project.name)
    setEditedDescription(project.description)
    setEditedTargetAudience(project.targetAudience)
    setEditedWebsiteLink(project.websiteLink)
    setEditedKeywords(project.keywords.join(", "))
    setEditedExcludedKeywords(project.excludedKeywords.join(", "))
    setEditedCompetitors(project.competitors?.join(", ") || "")
    setIsEditing(false)
  }

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const keywords = editedKeywords ? editedKeywords.split(",").map((k) => k.trim()) : []
      if (!keywords.includes(keywordInput.trim())) {
        keywords.push(keywordInput.trim())
        setEditedKeywords(keywords.join(", "))
      }
      setKeywordInput("")
    }
  }

  const removeKeyword = (keyword: string) => {
    const keywords = editedKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== keyword)
    setEditedKeywords(keywords.join(", "))
  }

  const addExcludedKeyword = () => {
    if (excludedKeywordInput.trim()) {
      const excludedKeywords = editedExcludedKeywords ? editedExcludedKeywords.split(",").map((k) => k.trim()) : []
      if (!excludedKeywords.includes(excludedKeywordInput.trim())) {
        excludedKeywords.push(excludedKeywordInput.trim())
        setEditedExcludedKeywords(excludedKeywords.join(", "))
      }
      setExcludedKeywordInput("")
    }
  }

  const removeExcludedKeyword = (keyword: string) => {
    const excludedKeywords = editedExcludedKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== keyword)
    setEditedExcludedKeywords(excludedKeywords.join(", "))
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Link href="/projects" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <ArrowLeft size={16} />
                </Link>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <button
                    onClick={toggleFavorite}
                    className={`p-1 rounded-full ${isFavorite ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 size={16} />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Settings size={16} />
                  Settings
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicate Project</DropdownMenuItem>
                    <DropdownMenuItem>Export Project</DropdownMenuItem>
                    <DropdownMenuItem>Archive Project</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Enhanced Theme-Adaptive Marketing Campaign Card */}
            <Card className="overflow-hidden border border-border/60 shadow-md bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-sm">
              {!isEditing ? (
                <div className="relative">
                  {/* Header section with refined design */}
                  <div className="relative p-4 border-b border-border/30 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h2 className="text-base font-medium text-foreground">{project.name}</h2>
                        <Badge className="px-1.5 py-0 text-[10px] bg-emerald-100/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Updated {formatDate(project.lastUpdated)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Content cards with enhanced design */}
                  <div className="p-4 bg-muted/10 backdrop-blur-sm">
                    {/* Description Card - Full Width with Progress */}
                    <div className="mb-3 p-4 bg-card rounded-md border border-border/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted/20 group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 group-hover:bg-muted transition-colors duration-200">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground/90">Description</h3>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{project.description}</p>

                      {/* Progress bar */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground/90">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500/80 dark:bg-emerald-600/70 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Upcoming deadlines */}
                      {project.upcomingDeadlines && project.upcomingDeadlines.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-foreground/90">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Upcoming Deadlines</span>
                          </div>
                          <ul className="space-y-1.5">
                            {project.upcomingDeadlines.slice(0, 2).map((deadline, index) => (
                              <li key={index} className="flex justify-between text-xs">
                                <span className="text-foreground/80">{deadline.task}</span>
                                <span className="text-muted-foreground">{formatDate(deadline.dueDate)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Card Grid with enhanced styling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Website Card */}
                      <div className="p-4 bg-card rounded-md border border-border/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted/20 group">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 group-hover:bg-muted transition-colors duration-200">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-medium text-foreground/90">Website</h3>
                        </div>
                        <a
                          href={project.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-foreground/80 hover:text-foreground transition-colors duration-200 border-b border-dashed border-border/40 hover:border-border/80 pb-0.5"
                        >
                          {project.websiteLink}
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5 flex-shrink-0 opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </a>
                      </div>

                      {/* Target Audience Card */}
                      <div className="p-4 bg-card rounded-md border border-border/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted/20 group">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 group-hover:bg-muted transition-colors duration-200">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-medium text-foreground/90">Target Audience</h3>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{project.targetAudience}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 text-xs font-medium border border-border/30 shadow-sm group-hover:bg-muted transition-colors duration-200">
                            M
                          </span>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 text-xs font-medium border border-border/30 shadow-sm group-hover:bg-muted transition-colors duration-200">
                            G
                          </span>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 text-xs font-medium border border-border/30 shadow-sm group-hover:bg-muted transition-colors duration-200">
                            SP
                          </span>
                        </div>
                      </div>

                      {/* Competitors Card */}
                      <div className="p-4 bg-card rounded-md border border-border/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted/20 group">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 group-hover:bg-muted transition-colors duration-200">
                            <Users className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-medium text-foreground/90">Competitors</h3>
                        </div>
                        <ul className="space-y-2">
                          {project.competitors.map((competitor, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm text-foreground/80 group-hover:text-foreground/90 transition-colors duration-200"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted/70 text-foreground/80 text-xs font-medium border border-border/30 group-hover:bg-muted transition-colors duration-200">
                                {competitor.charAt(0)}
                              </span>
                              <span className="truncate">{competitor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Keywords Card */}
                      <div className="p-4 bg-card rounded-md border border-border/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-muted/20 group">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/70 text-foreground/80 group-hover:bg-muted transition-colors duration-200">
                            <Tag className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-medium text-foreground/90">Keywords</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.keywords.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-0.5 bg-muted/70 text-foreground/80 border-border/40 font-normal text-xs group-hover:bg-muted transition-colors duration-200"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with action buttons */}
                  <div className="p-4 border-t border-border/30 bg-muted/30 backdrop-blur-sm flex justify-between items-center">
                    <Link
                      href="#marketing-analytics"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Marketing Analytics</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-sm border-border/60 text-foreground/90 hover:bg-muted hover:text-foreground transition-all duration-200"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={14} className="mr-1.5" />
                      Edit Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-card p-5 border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="project-name"
                        className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                      >
                        Brand Name
                        <span className="text-xs text-muted-foreground font-normal">Used for promotion</span>
                      </label>
                      <Input
                        id="project-name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Enter your brand name"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website-link"
                        className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                      >
                        Website Link
                        <span className="text-xs text-muted-foreground font-normal">Ensure correct URL</span>
                      </label>
                      <Input
                        id="website-link"
                        value={editedWebsiteLink}
                        onChange={(e) => setEditedWebsiteLink(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="project-description"
                      className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                    >
                      Description
                      <span className="text-xs text-muted-foreground font-normal">What your project is about</span>
                    </label>
                    <Textarea
                      id="project-description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Describe what your project is about"
                      rows={3}
                      className="text-sm min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="target-audience"
                      className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                    >
                      Target Audience
                      <span className="text-xs text-muted-foreground font-normal">Who you're targeting</span>
                    </label>
                    <Textarea
                      id="target-audience"
                      value={editedTargetAudience}
                      onChange={(e) => setEditedTargetAudience(e.target.value)}
                      placeholder="Describe your target audience"
                      rows={2}
                      className="text-sm min-h-[60px]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="competitors"
                      className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                    >
                      Competitors
                      <span className="text-xs text-muted-foreground font-normal">Main market competitors</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-2.5 border border-border rounded-md bg-muted/20">
                      {editedCompetitors
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k)
                        .map((competitor, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm flex items-center gap-1 px-2 py-0.5 bg-muted/40 text-foreground/80 border-border/60"
                          >
                            {competitor}
                            <button
                              onClick={() => removeCompetitor(competitor)}
                              className="ml-1 rounded-full hover:bg-muted transition-colors duration-150"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="competitors"
                        value={competitorInput}
                        onChange={(e) => setCompetitorInput(e.target.value)}
                        placeholder="Add a competitor"
                        className="h-9 text-sm"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="keywords"
                        className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                      >
                        Keywords
                        <span className="text-xs text-muted-foreground font-normal">Terms to target</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-2.5 border border-border rounded-md bg-muted/20">
                        {editedKeywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k)
                          .map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-sm flex items-center gap-1 px-2 py-0.5 bg-muted/40 text-foreground/80 border-border/60"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 rounded-full hover:bg-muted transition-colors duration-150"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="keywords"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Add a keyword"
                          className="h-9 text-sm"
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

                    <div>
                      <label
                        htmlFor="excluded-keywords"
                        className="text-sm font-medium text-foreground/90 block mb-1.5 flex items-center gap-1.5"
                      >
                        Excluded Keywords
                        <span className="text-xs text-muted-foreground font-normal">Terms to avoid</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-2.5 border border-border rounded-md bg-muted/20">
                        {editedExcludedKeywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k)
                          .map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm border-border/60 text-muted-foreground flex items-center gap-1 px-2 py-0.5 bg-muted/30"
                            >
                              {keyword}
                              <button
                                onClick={() => removeExcludedKeyword(keyword)}
                                className="ml-1 rounded-full hover:bg-muted transition-colors duration-150"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="excluded-keywords"
                          value={excludedKeywordInput}
                          onChange={(e) => setExcludedKeywordInput(e.target.value)}
                          placeholder="Add an excluded keyword"
                          className="h-9 text-sm"
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

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Marketing Analytics Cards - Added below product information */}
            <div className="mt-4" id="marketing-analytics">
              <MarketingAnalyticsCards />
            </div>

            {/* Social Media Cards */}
            <div className="mt-6">
              <SocialMediaCards />
            </div>

            {/* Content Analytics */}
            <div className="mt-6">
              <ContentAnalyticsCards />
            </div>

            {/* Potential Customer Analytics */}
            <div className="mt-6">
              <PotentialCustomerAnalytics />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
