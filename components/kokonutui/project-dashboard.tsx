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
  FileText,
  Ban,
  Save,
} from "lucide-react"
import SocialMediaCards from "@/components/kokonutui/social-media-cards"
import MarketingAnalyticsCards from "@/components/kokonutui/marketing-analytics-cards"
import ContentAnalyticsCards from "@/components/kokonutui/content-analytics-cards"
import PotentialCustomerAnalytics from "@/components/kokonutui/potential-customer-analytics"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
  "4": {
    id: "4",
    name: "Social Media Strategy",
    description: "Comprehensive social media strategy for Q3 2025",
    targetAudience: "Young professionals and social media enthusiasts aged 18-35",
    websiteLink: "https://example.com/social-strategy",
    competitors: ["SocialGuru", "DigitalPresence", "EngagementPro"],
    keywords: ["social media", "strategy", "engagement", "content", "analytics"],
    excludedKeywords: ["spam", "clickbait", "controversy"],
    lastUpdated: "2025-05-20T10:15:00Z",
    status: "active",
    favorite: false,
    thumbnail: "/interconnected-social-media.png",
    progress: 55,
    team: ["Taylor R.", "Jordan S.", "Morgan P."],
    tasks: {
      total: 28,
      completed: 15,
      inProgress: 8,
      notStarted: 5,
    },
    recentActivities: [
      { user: "Taylor R.", action: "completed platform analysis", time: "3 hours ago" },
      { user: "Jordan S.", action: "drafted content calendar", time: "Yesterday" },
      { user: "Morgan P.", action: "researched trending hashtags", time: "2 days ago" },
    ],
    upcomingDeadlines: [
      { task: "Finalize platform strategy", dueDate: "2025-05-27" },
      { task: "Complete audience analysis", dueDate: "2025-06-02" },
      { task: "Develop engagement metrics", dueDate: "2025-06-08" },
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
        <div className="max-w-[95%] mx-auto px-2 py-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Link href="/projects" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <ArrowLeft size={16} />
                </Link>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
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

            {/* Premium Enhanced Project Card with Background Shades */}
            {!isEditing ? (
              <Card className="overflow-hidden border shadow-md rounded-lg bg-gradient-to-b from-card to-background/80 dark:from-card dark:to-background/90 backdrop-blur-sm">
                {/* Elegant Header with Enhanced Typography and Background */}
                <div className="relative px-5 py-4 flex justify-between items-center border-b bg-gradient-to-r from-background/80 via-card/90 to-background/80 dark:from-background/60 dark:via-card/80 dark:to-background/60 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/30">
                          <span className="relative flex h-1.5 w-1.5 mr-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          Active
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 inline-block" />
                        Last updated {formatDate(project.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-9 gap-1.5 rounded-md hover:bg-muted/80 hover:border-muted-foreground/20 transition-all duration-200 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>

                <CardContent className="p-0">
                  {/* Main Content with Premium Design and Background Shades */}
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-gradient-to-br from-transparent via-background/40 to-transparent dark:from-transparent dark:via-card/30 dark:to-transparent backdrop-blur-sm">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Description with Premium Typography and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          Description
                        </h3>
                        <div className="pl-8">
                          <p className="text-sm leading-tight text-foreground/90 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      {/* Website with Premium Design and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          Website
                        </h3>
                        <div className="pl-8">
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors group p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm w-full"
                          >
                            {project.websiteLink}
                            <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                          </a>
                        </div>
                      </div>

                      {/* Competitors with Premium Design and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Users className="h-3.5 w-3.5" />
                          </div>
                          Competitors
                        </h3>
                        <div className="pl-8">
                          <div className="flex flex-wrap gap-2 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.competitors.map((competitor, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 px-3 py-1.5 rounded-md text-sm transition-all duration-200 border border-border/30 hover:border-border/50 backdrop-blur-sm"
                              >
                                <span
                                  className={cn(
                                    "inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-medium text-white shadow-sm",
                                    index % 3 === 0 && "bg-blue-500/90 dark:bg-blue-600/90",
                                    index % 3 === 1 && "bg-green-500/90 dark:bg-green-600/90",
                                    index % 3 === 2 && "bg-amber-500/90 dark:bg-amber-600/90",
                                  )}
                                >
                                  {competitor.charAt(0)}
                                </span>
                                <span>{competitor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Target Audience with Premium Typography and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          Target Audience
                        </h3>
                        <div className="pl-8">
                          <p className="text-sm leading-tight text-foreground/90 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.targetAudience}
                          </p>
                        </div>
                      </div>

                      {/* Keywords with Premium Design and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Tag className="h-3.5 w-3.5" />
                          </div>
                          Keywords
                        </h3>
                        <div className="pl-8">
                          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.keywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="rounded-md text-xs font-normal py-1 px-2.5 hover:bg-secondary/80 transition-all duration-200 backdrop-blur-sm"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Excluded Keywords with Premium Design and Background */}
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Ban className="h-3.5 w-3.5" />
                          </div>
                          Excluded Keywords
                        </h3>
                        <div className="pl-8">
                          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.excludedKeywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="rounded-md text-xs font-normal py-1 px-2.5 text-muted-foreground hover:bg-muted/60 transition-all duration-200 backdrop-blur-sm"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border shadow-md rounded-lg bg-gradient-to-b from-card to-background/80 dark:from-card dark:to-background/90 backdrop-blur-sm">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-background/80 via-card/90 to-background/80 dark:from-background/60 dark:via-card/80 dark:to-background/60 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    Edit Project Details
                  </h3>
                </div>
                <div className="p-6 space-y-5 bg-gradient-to-br from-transparent via-background/40 to-transparent dark:from-transparent dark:via-card/30 dark:to-transparent backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="project-name"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                      >
                        Project Name
                        <span className="text-xs text-muted-foreground font-normal">(Required)</span>
                      </label>
                      <Input
                        id="project-name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Enter project name"
                        className="h-10 text-sm bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website-link"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                      >
                        Website URL
                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <Input
                        id="website-link"
                        value={editedWebsiteLink}
                        onChange={(e) => setEditedWebsiteLink(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                        className="h-10 text-sm bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="project-description"
                      className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                    >
                      Description
                      <span className="text-xs text-muted-foreground font-normal">(Required)</span>
                    </label>
                    <Textarea
                      id="project-description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Describe what your project is about"
                      rows={3}
                      className="text-sm min-h-[80px] resize-none bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="target-audience"
                      className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                    >
                      Target Audience
                      <span className="text-xs text-muted-foreground font-normal">(Required)</span>
                    </label>
                    <Textarea
                      id="target-audience"
                      value={editedTargetAudience}
                      onChange={(e) => setEditedTargetAudience(e.target.value)}
                      placeholder="Describe your target audience"
                      rows={2}
                      className="text-sm min-h-[60px] resize-none bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="competitors"
                      className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                    >
                      Competitors
                      <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px] p-3 border rounded-md bg-background/60 dark:bg-card/60 backdrop-blur-sm">
                      {editedCompetitors
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k)
                        .map((competitor, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm flex items-center gap-1 px-2.5 py-1 bg-muted/30 text-foreground/80 border-border/40 hover:bg-muted/50 transition-colors backdrop-blur-sm"
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
                    <div className="flex gap-2">
                      <Input
                        id="competitors"
                        value={competitorInput}
                        onChange={(e) => setCompetitorInput(e.target.value)}
                        placeholder="Add a competitor"
                        className="h-10 text-sm bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addCompetitor()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addCompetitor}
                        variant="outline"
                        size="sm"
                        className="h-10 backdrop-blur-sm"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="keywords"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                      >
                        Keywords
                        <span className="text-xs text-muted-foreground font-normal">(Required)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px] p-3 border rounded-md bg-background/60 dark:bg-card/60 backdrop-blur-sm">
                        {editedKeywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k)
                          .map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-sm flex items-center gap-1 px-2.5 py-1 bg-secondary/30 text-foreground/80 hover:bg-secondary/50 transition-colors backdrop-blur-sm"
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
                      <div className="flex gap-2">
                        <Input
                          id="keywords"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Add a keyword"
                          className="h-10 text-sm bg-background/60 dark:bg-card/60 backdrop-blur-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addKeyword()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addKeyword}
                          variant="outline"
                          size="sm"
                          className="h-10 backdrop-blur-sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="excluded-keywords"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2"
                      >
                        Excluded Keywords
                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px] p-3 border rounded-md bg-background/60 dark:bg-card/60 backdrop-blur-sm">
                        {editedExcludedKeywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k)
                          .map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm text-muted-foreground flex items-center gap-1 px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors backdrop-blur-sm"
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
                      <div className="flex gap-2">
                        <Input
                          id="excluded-keywords"
                          value={excludedKeywordInput}
                          onChange={(e) => setExcludedKeywordInput(e.target.value)}
                          placeholder="Add an excluded keyword"
                          className="h-10 text-sm bg-background/60 dark:bg-card/60 backdrop-blur-sm"
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
                          className="h-10 backdrop-blur-sm"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-10 px-4 font-medium hover:bg-muted/50 transition-colors backdrop-blur-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      className="h-10 px-4 font-medium gap-1.5 bg-primary hover:bg-primary/90 transition-colors backdrop-blur-sm"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            )}

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
