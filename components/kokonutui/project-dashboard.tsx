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
  Check,
  ExternalLink,
  Globe,
  Tag,
  Users,
  Target,
  AlertCircle,
  Info,
} from "lucide-react"
import SocialMediaCards from "@/components/kokonutui/social-media-cards" // Import the new component
// Import the new MarketingAnalyticsCards component at the top of the file
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
import Layout from "@/components/kokonutui/layout"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Update the MOCK_PROJECTS and DEFAULT_PROJECT data structures to include competitor information
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

// Default project for new projects
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
  },
  recentActivities: [{ user: "You", action: "created this project", time: "Just now" }],
  upcomingDeadlines: [],
}

export default function ProjectDashboard({ projectId }: { projectId: string }) {
  const [project, setProject] = useState(MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] || DEFAULT_PROJECT)
  const [isFavorite, setIsFavorite] = useState(project.favorite)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)
  const [editedDescription, setEditedDescription] = useState(project.description)
  const [editedTargetAudience, setEditedTargetAudience] = useState(project.targetAudience)
  const [editedWebsiteLink, setEditedWebsiteLink] = useState(project.websiteLink)
  const [editedKeywords, setEditedKeywords] = useState(project.keywords.join(", "))
  const [editedExcludedKeywords, setEditedExcludedKeywords] = useState(project.excludedKeywords.join(", "))
  const [keywordInput, setKeywordInput] = useState("")
  const [excludedKeywordInput, setExcludedKeywordInput] = useState("")

  // Add competitor state variables
  const [editedCompetitors, setEditedCompetitors] = useState(project.competitors?.join(", ") || "")
  const [competitorInput, setCompetitorInput] = useState("")

  useEffect(() => {
    // Update project data when projectId changes
    const projectData = MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] || DEFAULT_PROJECT
    setProject(projectData)
    setIsFavorite(projectData.favorite)

    // Reset edit states
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
    // In a real app, this would update the database
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Add competitor functions
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

  // Update handleSaveChanges to include competitors
  const handleSaveChanges = () => {
    // In a real app, this would save to the database
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
    // Reset to original values
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
    <Layout>
      <div className="flex flex-col min-h-screen">
        {/* Project header */}
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {/* Project header - simplified without breadcrumbs */}
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

              {/* Project Information Card - refined with improved typography and visual appeal */}
              {/* Project Information Card - redesigned with competitor field and optimized layout */}
              <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-blue-50/50 via-card to-purple-50/30 dark:from-blue-950/20 dark:via-card dark:to-purple-950/10 shadow-sm">
                <div className="p-5">
                  {/* Card Header with Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold tracking-tight">{project.name}</h2>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 font-medium ${
                            project.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                              : "bg-primary/10 border-primary/20"
                          }`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated {formatDate(project.lastUpdated)}</span>
                      </div>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8">
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} className="h-8">
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveChanges} className="h-8">
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="bg-background/70 backdrop-blur-sm rounded-lg p-4 border border-border/40 shadow-inner">
                      {/* Project Description */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                      </div>

                      <Separator className="my-4 bg-border/60" />

                      {/* Project Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {/* Left Column */}
                        <div className="space-y-5">
                          {/* Website */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Globe className="h-4 w-4 text-primary" />
                              <h3 className="text-sm font-medium text-foreground">Website</h3>
                            </div>
                            {project.websiteLink ? (
                              <a
                                href={project.websiteLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                              >
                                {project.websiteLink}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No website link provided</p>
                            )}
                          </div>

                          {/* Target Audience */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Target className="h-4 w-4 text-primary" />
                              <h3 className="text-sm font-medium text-foreground">Target Audience</h3>
                            </div>
                            <p className="text-sm leading-relaxed">{project.targetAudience}</p>
                          </div>

                          {/* Competitors - New Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="h-4 w-4 text-primary" />
                              <h3 className="text-sm font-medium text-foreground">Competitors</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {project.competitors && project.competitors.length > 0 ? (
                                project.competitors.map((competitor, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                                  >
                                    {competitor}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No competitors added</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-5">
                          {/* Keywords */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Tag className="h-4 w-4 text-primary" />
                              <h3 className="text-sm font-medium text-foreground">Keywords</h3>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Terms to target in marketing and SEO</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {project.keywords.length > 0 ? (
                                project.keywords.map((keyword, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  >
                                    {keyword}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No keywords added</p>
                              )}
                            </div>
                          </div>

                          {/* Excluded Keywords */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <AlertCircle className="h-4 w-4 text-rose-500" />
                              <h3 className="text-sm font-medium text-foreground">Excluded Keywords</h3>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Terms to avoid in marketing and SEO</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {project.excludedKeywords.length > 0 ? (
                                project.excludedKeywords.map((keyword, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 border-rose-200 text-rose-600 dark:border-rose-800/50 dark:text-rose-400"
                                  >
                                    {keyword}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No excluded keywords</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Share2 size={14} />
                          Share Product
                        </Button>
                        <Button size="sm" className="gap-1.5">
                          <Edit size={14} />
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Edit mode
                    <div className="space-y-4 bg-background/70 backdrop-blur-sm rounded-lg p-4 border border-border/40 shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                          >
                            Brand Name
                            <span className="text-[10px] text-muted-foreground font-normal">Used for promotion</span>
                          </label>
                          <Input
                            id="project-name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Enter your brand name"
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="website-link"
                            className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                          >
                            Website Link
                            <span className="text-[10px] text-muted-foreground font-normal">Ensure correct URL</span>
                          </label>
                          <Input
                            id="website-link"
                            value={editedWebsiteLink}
                            onChange={(e) => setEditedWebsiteLink(e.target.value)}
                            placeholder="https://example.com"
                            type="url"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="project-description"
                          className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                        >
                          Description
                          <span className="text-[10px] text-muted-foreground font-normal">
                            What your project is about 🧠
                          </span>
                        </label>
                        <Textarea
                          id="project-description"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Describe what your project is about"
                          rows={2}
                          className="text-sm min-h-[60px]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="target-audience"
                          className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                        >
                          Target Audience
                          <span className="text-[10px] text-muted-foreground font-normal">Who you're targeting</span>
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

                      {/* Competitors field - new */}
                      <div>
                        <label
                          htmlFor="competitors"
                          className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                        >
                          Competitors
                          <span className="text-[10px] text-muted-foreground font-normal">Main market competitors</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-1 border rounded-md bg-background/50">
                          {editedCompetitors
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k)
                            .map((competitor, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                              >
                                {competitor}
                                <button
                                  onClick={() => removeCompetitor(competitor)}
                                  className="ml-1 rounded-full hover:bg-muted"
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
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addCompetitor()
                              }
                            }}
                          />
                          <Button type="button" onClick={addCompetitor} variant="outline" size="sm" className="h-8">
                            Add
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="keywords"
                            className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                          >
                            Keywords
                            <span className="text-[10px] text-muted-foreground font-normal">Terms to target</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-1 border rounded-md bg-background/50">
                            {editedKeywords
                              .split(",")
                              .map((k) => k.trim())
                              .filter((k) => k)
                              .map((keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs flex items-center gap-1 px-2 py-0.5"
                                >
                                  {keyword}
                                  <button
                                    onClick={() => removeKeyword(keyword)}
                                    className="ml-1 rounded-full hover:bg-muted"
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
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addKeyword()
                                }
                              }}
                            />
                            <Button type="button" onClick={addKeyword} variant="outline" size="sm" className="h-8">
                              Add
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="excluded-keywords"
                            className="text-xs font-medium text-primary block mb-1 flex items-center gap-1.5"
                          >
                            Excluded Keywords
                            <span className="text-[10px] text-muted-foreground font-normal">Terms to avoid</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px] p-1 border rounded-md bg-background/50">
                            {editedExcludedKeywords
                              .split(",")
                              .map((k) => k.trim())
                              .filter((k) => k)
                              .map((keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 flex items-center gap-1 px-2 py-0.5"
                                >
                                  {keyword}
                                  <button
                                    onClick={() => removeExcludedKeyword(keyword)}
                                    className="ml-1 rounded-full hover:bg-muted"
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
                              className="h-8 text-sm"
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
                              className="h-8"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Marketing Analytics Cards - Added below product information */}
              <div className="mt-4">
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
    </Layout>
  )
}
