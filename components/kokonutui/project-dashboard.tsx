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
  Loader2,
} from "lucide-react"
import SocialMediaCards from "@/components/kokonutui/social-media-cards"
import MarketingAnalyticsCards from "@/components/kokonutui/marketing-analytics-cards"
import ContentAnalyticsCards from "@/components/kokonutui/content-analytics-cards"
import PotentialCustomerAnalytics from "@/components/kokonutui/potential-customer-analytics"
import { useToast } from "@/components/ui/use-toast"

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
import Cookies from 'js-cookie'

interface Project {
  id: string
  title: string
  description: string
  target_audience: string
  website_url: string
  category: string
  priority: string
  due_date: string
  budget: number
  team: any[]
  tags: string[]
  competitors: string[]
  keywords: string[]
  excluded_keywords: string[]
  status: string
  progress: number
  health: string
  created_at: string
  updated_at: string
}

export default function ProjectDashboard({ projectId }: { projectId: string }) {
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedTargetAudience, setEditedTargetAudience] = useState("")
  const [editedWebsiteLink, setEditedWebsiteLink] = useState("")
  const [editedKeywords, setEditedKeywords] = useState("")
  const [editedExcludedKeywords, setEditedExcludedKeywords] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [excludedKeywordInput, setExcludedKeywordInput] = useState("")
  const [editedCompetitors, setEditedCompetitors] = useState("")
  const [competitorInput, setCompetitorInput] = useState("")

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch project details')
        }

        const data = await response.json()
        setProject(data)
        
        // Initialize edit form with fetched data
        setEditedName(data.title)
        setEditedDescription(data.description)
        setEditedTargetAudience(data.target_audience)
        setEditedWebsiteLink(data.website_url)
        setEditedKeywords(data.keywords.join(", "))
        setEditedExcludedKeywords(data.excluded_keywords.join(", "))
        setEditedCompetitors(data.competitors.join(", "))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

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

  const handleSaveChanges = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editedName,
          description: editedDescription,
          target_audience: editedTargetAudience,
          website_url: editedWebsiteLink,
          competitors: editedCompetitors.split(",").map((k) => k.trim()).filter((k) => k),
          keywords: editedKeywords.split(",").map((k) => k.trim()).filter((k) => k),
          excluded_keywords: editedExcludedKeywords.split(",").map((k) => k.trim()).filter((k) => k),
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      const updatedProject = await response.json()
      setProject(updatedProject)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Project details updated successfully",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: "Failed to update project details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditedName(project.title)
    setEditedDescription(project.description)
    setEditedTargetAudience(project.target_audience)
    setEditedWebsiteLink(project.website_url)
    setEditedKeywords(project.keywords.join(", "))
    setEditedExcludedKeywords(project.excluded_keywords.join(", "))
    setEditedCompetitors(project.competitors.join(", "))
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
                  <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
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

            {/* Project details card */}
            {!isEditing ? (
              <Card className="overflow-hidden border shadow-md rounded-lg bg-gradient-to-b from-card to-background/80 dark:from-card dark:to-background/90 backdrop-blur-sm">
                <div className="relative px-5 py-4 flex justify-between items-center border-b bg-gradient-to-r from-background/80 via-card/90 to-background/80 dark:from-background/60 dark:via-card/80 dark:to-background/60 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-xl font-semibold tracking-tight">{project.title}</h2>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/30">
                          <span className="relative flex h-1.5 w-1.5 mr-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          {project.status}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 inline-block" />
                        Last updated {new Date(project.updated_at).toLocaleDateString()}
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
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-gradient-to-br from-transparent via-background/40 to-transparent dark:from-transparent dark:via-card/30 dark:to-transparent backdrop-blur-sm">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          Project Overview
                        </h3>
                        <div className="pl-8">
                          <div className="p-4 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-foreground/90 mb-2">Description</h4>
                              <p className="text-sm leading-relaxed text-foreground/80">
                                {project.description}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border/10">
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Category</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {project.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          Website
                        </h3>
                        <div className="pl-8">
                          <a
                            href={project.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors group p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm w-full"
                          >
                            {project.website_url}
                            <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                          </a>
                        </div>
                      </div>

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
                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          Target Audience
                        </h3>
                        <div className="pl-8">
                          <p className="text-sm leading-tight text-foreground/90 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.target_audience}
                          </p>
                        </div>
                      </div>

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

                      <div className="group">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center group-hover:text-foreground/90 transition-colors">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 mr-2 group-hover:bg-muted transition-colors backdrop-blur-sm">
                            <Ban className="h-3.5 w-3.5" />
                          </div>
                          Excluded Keywords
                        </h3>
                        <div className="pl-8">
                          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-md bg-background/40 dark:bg-card/40 border border-border/10 shadow-sm backdrop-blur-sm">
                            {project.excluded_keywords.map((keyword, index) => (
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

            {/* Analytics sections */}
            <div className="mt-4" id="marketing-analytics">
              <MarketingAnalyticsCards />
            </div>

            <div className="mt-6">
              <SocialMediaCards />
            </div>

            <div className="mt-6">
              <ContentAnalyticsCards />
            </div>

            <div className="mt-6">
              <PotentialCustomerAnalytics />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
