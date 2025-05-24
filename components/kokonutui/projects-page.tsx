"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"

// Sample project data
const projects = [
  {
    id: "1",
    title: "Marketing Campaign Q2",
    description: "Q2 2025 product launch campaign planning and execution",
    status: "In Progress",
    progress: 65,
    dueDate: "2025-06-15",
    lastUpdated: "2025-05-20",
    priority: "High",
    team: [
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK" },
    ],
    tags: ["marketing", "campaign", "product-launch"],
    metrics: {
      tasks: 24,
      completed: 16,
      comments: 38,
    },
  },
  {
    id: "2",
    title: "Website Redesign",
    description: "Complete overhaul of company website with new branding",
    status: "Planning",
    progress: 25,
    dueDate: "2025-07-20",
    lastUpdated: "2025-05-18",
    priority: "Medium",
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC" },
      { name: "Alex Johnson", avatar: "/abstract-letter-aj.png", initials: "AJ" },
      { name: "Liam Williams", avatar: "/abstract-lw.png", initials: "LW" },
    ],
    tags: ["design", "website", "branding"],
    metrics: {
      tasks: 32,
      completed: 8,
      comments: 27,
    },
  },
  {
    id: "3",
    title: "Product Launch",
    description: "New product line introduction to market",
    status: "Completed",
    progress: 100,
    dueDate: "2025-05-05",
    lastUpdated: "2025-05-05",
    priority: "High",
    team: [
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS" },
      { name: "Taylor Adams", avatar: "/ta-symbol.png", initials: "TA" },
    ],
    tags: ["product", "launch", "marketing"],
    metrics: {
      tasks: 45,
      completed: 45,
      comments: 72,
    },
  },
  {
    id: "4",
    title: "Social Media Strategy",
    description: "Develop comprehensive social media plan for Q3",
    status: "In Progress",
    progress: 40,
    dueDate: "2025-06-30",
    lastUpdated: "2025-05-22",
    priority: "Medium",
    team: [
      { name: "Jordan Lee", avatar: "/stylized-jl-logo.png", initials: "JL" },
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK" },
      { name: "Morgan Garcia", avatar: "/abstract-geometric-mg.png", initials: "MG" },
    ],
    tags: ["social-media", "strategy", "content"],
    metrics: {
      tasks: 18,
      completed: 7,
      comments: 23,
    },
  },
  {
    id: "5",
    title: "Brand Guidelines",
    description: "Create comprehensive brand style guide and assets",
    status: "Review",
    progress: 85,
    dueDate: "2025-06-10",
    lastUpdated: "2025-05-19",
    priority: "Low",
    team: [
      { name: "Sam Chen", avatar: "/stylized-initials-sc.png", initials: "SC" },
      { name: "Morgan Bailey", avatar: "/monogram-mb.png", initials: "MB" },
      { name: "Riley Smith", avatar: "/abstract-rs.png", initials: "RS" },
    ],
    tags: ["branding", "design", "guidelines"],
    metrics: {
      tasks: 15,
      completed: 13,
      comments: 19,
    },
  },
  {
    id: "6",
    title: "Content Calendar",
    description: "Plan and organize content for Q3 across all channels",
    status: "Planning",
    progress: 15,
    dueDate: "2025-07-05",
    lastUpdated: "2025-05-21",
    priority: "Medium",
    team: [
      { name: "Dana Kim", avatar: "/abstract-geometric-dk.png", initials: "DK" },
      { name: "Jordan Lee", avatar: "/stylized-jl-logo.png", initials: "JL" },
    ],
    tags: ["content", "planning", "editorial"],
    metrics: {
      tasks: 22,
      completed: 3,
      comments: 12,
    },
  },
]

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("All")
  const [sort, setSort] = useState("Newest")
  const [activeTab, setActiveTab] = useState("all")
  const [animateIn, setAnimateIn] = useState(false)

  // Filter projects based on search query and filter
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      if (filter === "All") return matchesSearch
      return matchesSearch && project.status === filter
    })
    .filter((project) => {
      if (activeTab === "all") return true
      if (activeTab === "active") return project.status !== "Completed"
      if (activeTab === "completed") return project.status === "Completed"
      if (activeTab === "high-priority") return project.priority === "High"
      return true
    })

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sort === "Newest") {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    } else if (sort === "Oldest") {
      return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
    } else if (sort === "Name (A-Z)") {
      return a.title.localeCompare(b.title)
    } else if (sort === "Name (Z-A)") {
      return b.title.localeCompare(a.title)
    } else if (sort === "Due Date") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    } else if (sort === "Progress") {
      return b.progress - a.progress
    }
    return 0
  })

  // Animation effect
  useEffect(() => {
    setAnimateIn(true)
  }, [])

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
      case "In Progress":
        return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20"
      case "Planning":
        return "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20"
      case "Review":
        return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
    }
  }

  // Get priority indicator
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "High":
        return <div className="h-2 w-2 rounded-full bg-red-500" title="High Priority"></div>
      case "Medium":
        return <div className="h-2 w-2 rounded-full bg-amber-500" title="Medium Priority"></div>
      case "Low":
        return <div className="h-2 w-2 rounded-full bg-green-500" title="Low Priority"></div>
      default:
        return null
    }
  }

  // Format date to relative time
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Calculate days until due
  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    if (diffDays <= 7) return `Due in ${diffDays} days`
    return `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  // Get due date status color
  const getDueDateColor = (dateString: string) => {
    const dueDate = new Date(dateString)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "text-red-500"
    if (diffDays <= 3) return "text-amber-500"
    return "text-muted-foreground"
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 40) return "bg-blue-500"
    return "bg-amber-500"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and organize your marketing projects</p>
          </div>
          <Button className="w-full md:w-auto shadow-sm transition-all hover:shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-9 bg-muted/60 p-1">
              <TabsTrigger value="all" className="rounded-md text-xs sm:text-sm">
                All Projects
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-md text-xs sm:text-sm">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-md text-xs sm:text-sm">
                Completed
              </TabsTrigger>
              <TabsTrigger value="high-priority" className="rounded-md text-xs sm:text-sm">
                High Priority
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="w-full pl-9 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 shadow-sm">
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      {filter}
                      <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setFilter("All")}>All Projects</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("In Progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("Completed")}>Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("Planning")}>Planning</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("Review")}>Review</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 shadow-sm">
                      <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                      {sort}
                      <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setSort("Newest")}>Newest</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("Oldest")}>Oldest</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("Name (A-Z)")}>Name (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("Name (Z-A)")}>Name (Z-A)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("Due Date")}>Due Date</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("Progress")}>Progress</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center rounded-md border border-border shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none rounded-l-md ${view === "grid" ? "bg-muted" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-none rounded-r-md ${view === "list" ? "bg-muted" : ""}`}
                    onClick={() => setView("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="mt-6">
            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProjects.map((project, index) => (
                  <Link
                    href={`/projects/${project.id}`}
                    key={project.id}
                    className={`block transform transition-all duration-300 ${
                      animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Card className="h-full overflow-hidden border border-border/60 bg-card transition-all hover:border-border hover:shadow-md">
                      <CardHeader className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getPriorityIndicator(project.priority)}
                            <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
                          </div>
                          <Badge
                            variant="outline"
                            className={`ml-2 text-xs font-medium ${getStatusColor(project.status)}`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2 line-clamp-2 text-sm">{project.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="px-5 pb-0">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Updated {formatRelativeDate(project.lastUpdated)}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${getDueDateColor(project.dueDate)}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{getDaysUntilDue(project.dueDate)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {project.team.map((member) => (
                                <Avatar key={member.name} className="h-7 w-7 border-2 border-background">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                  <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="font-medium">{project.metrics.completed}</span>
                                <span>/</span>
                                <span>{project.metrics.tasks}</span>
                                <span>tasks</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium">Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProjects.map((project, index) => (
                  <Link
                    href={`/projects/${project.id}`}
                    key={project.id}
                    className={`block transform transition-all duration-300 ${
                      animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Card className="overflow-hidden border border-border/60 bg-card transition-all hover:border-border hover:shadow-md">
                      <div className="flex flex-col p-5 md:flex-row md:items-center md:gap-6">
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getPriorityIndicator(project.priority)}
                              <h3 className="text-lg font-semibold">{project.title}</h3>
                            </div>
                            <Badge
                              variant="outline"
                              className={`ml-2 text-xs font-medium ${getStatusColor(project.status)}`}
                            >
                              {project.status}
                            </Badge>
                          </div>

                          <p className="mt-1.5 text-sm text-muted-foreground">{project.description}</p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:mt-0 md:w-64">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Updated {formatRelativeDate(project.lastUpdated)}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${getDueDateColor(project.dueDate)}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{getDaysUntilDue(project.dueDate)}</span>
                            </div>
                          </div>

                          <div className="w-full">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-medium">Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full ${getProgressColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {project.team.map((member) => (
                                <Avatar key={member.name} className="h-7 w-7 border-2 border-background">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                  <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="font-medium">{project.metrics.completed}</span>
                                <span>/</span>
                                <span>{project.metrics.tasks}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {sortedProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn't find any projects matching your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setFilter("All")
                  }}
                  className="mt-4"
                  variant="outline"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {/* Active projects content - same structure as "all" */}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {/* Completed projects content - same structure as "all" */}
          </TabsContent>

          <TabsContent value="high-priority" className="mt-6">
            {/* High priority projects content - same structure as "all" */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
