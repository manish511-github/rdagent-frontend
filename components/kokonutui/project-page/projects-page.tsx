"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  ArrowUp,
  ArrowDown,
  Calendar,
  TrendingUp,
  Flag,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchProjects,
  fetchProjectSummary,
} from "@/store/slices/projectsSlice";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./ProjectCard";
import { ProjectStats } from "./ProjectStats";
import {
  projectCategories,
  projectStatuses,
  priorityLevels,
  healthStatuses,
} from "./projectConstants";
import { CreateProjectDialogWrapper } from "./CreateProjectDialogWrapper";

export default function ProjectsPage() {
  const router = useRouter();
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: projects,
    status,
    error,
    summary,
    summaryStatus,
    summaryError,
  } = useSelector((state: RootState) => state.projects);

  // All state declarations
  const [view, setView] = useState<"grid" | "list" | "kanban">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toast hook
  const { toast } = useToast();

  // Fetch projects and summary on component mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProjects());
    }
    if (summaryStatus === "idle") {
      dispatch(fetchProjectSummary());
    }
  }, [status, summaryStatus, dispatch]);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setShowCreateDialog(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (Array.isArray(project.tags) ? project.tags : []).some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.category.toLowerCase() === categoryFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (project) =>
          project.status.toLowerCase().replace(" ", "-") === statusFilter
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.priority.toLowerCase() === priorityFilter
      );
    }

    // Health filter
    if (healthFilter !== "all") {
      filtered = filtered.filter((project) => project.health === healthFilter);
    }

    // Starred filter
    if (showStarredOnly) {
      filtered = filtered.filter((project) => project.starred);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        case "oldest":
          return (
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
          );
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "due-date":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "progress":
          return b.progress - a.progress;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (
            priorityOrder[
              a.priority.toLowerCase() as keyof typeof priorityOrder
            ] -
            priorityOrder[
              b.priority.toLowerCase() as keyof typeof priorityOrder
            ]
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    projects,
    searchQuery,
    categoryFilter,
    statusFilter,
    priorityFilter,
    healthFilter,
    showStarredOnly,
    sort,
  ]);

  // No longer needed - using summary from API

  // Loading state
  if (status === "loading") {
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
  if (status === "failed") {
    return (
      <div className="bg-gradient-to-br from-background via-background/80 to-background/60 dark:from-background dark:via-background/95 dark:to-slate-900/40">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">Failed to load projects</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => {
                  dispatch(fetchProjects());
                  dispatch(fetchProjectSummary());
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Select all projects
  const selectAllProjects = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map((p) => p.uuid));
    }
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    switch (action) {
      case "archive":
        console.log("Archiving projects:", selectedProjects);
        break;
      case "delete":
        console.log("Deleting projects:", selectedProjects);
        break;
      case "export":
        console.log("Exporting projects:", selectedProjects);
        break;
    }
    setSelectedProjects([]);
    setIsSelectionMode(false);
  };

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Invalid project ID",
        variant: "destructive",
      });
      return;
    }
    setLoadingProjectId(projectId);
    router.push(`/projects/${projectId}`);
  };

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
              <p className="text-muted-foreground mt-1">
                Manage and track all your projects in one place
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <ProjectStats
            summary={summary}
            isLoading={summaryStatus === "loading"}
          />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-4 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full">
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
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                <Filter className="mr-1.5 h-3 w-3" />
                Filters
                {(categoryFilter !== "all" ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  healthFilter !== "all") && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 px-1 py-0 text-[10px]"
                  >
                    {
                      [
                        categoryFilter,
                        statusFilter,
                        priorityFilter,
                        healthFilter,
                      ].filter((f) => f !== "all").length
                    }
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="p-2 space-y-3 text-xs">
                {/* Category Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
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
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => {
                        const Icon = priority.icon;
                        return (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
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
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setHealthFilter("all");
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
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                <SlidersHorizontal className="mr-1.5 h-3 w-3" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setSort("newest")}
                className="text-xs"
              >
                <Clock className="mr-2 h-3 w-3" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("oldest")}
                className="text-xs"
              >
                <Clock className="mr-2 h-3 w-3" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("name-asc")}
                className="text-xs"
              >
                <ArrowUp className="mr-2 h-3 w-3" />
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("name-desc")}
                className="text-xs"
              >
                <ArrowDown className="mr-2 h-3 w-3" />
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("due-date")}
                className="text-xs"
              >
                <Calendar className="mr-2 h-3 w-3" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("progress")}
                className="text-xs"
              >
                <TrendingUp className="mr-2 h-3 w-3" />
                Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSort("priority")}
                className="text-xs"
              >
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
            <Star
              className="mr-1.5 h-3 w-3"
              fill={showStarredOnly ? "currentColor" : "none"}
            />
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
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setHealthFilter("all");
                  setShowStarredOnly(false);
                }}
              >
                Clear all filters
              </Button>
            </div>
          </Card>
        ) : (
          <div
            className={cn(
              view === "grid" &&
                "grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
              view === "list" && "flex flex-col w-full",
              view === "kanban" && "grid-cols-1"
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
              <>
                {view === "list" && (
                  <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground border-b bg-background/80 sticky top-0 z-10">
                    <div className="col-span-3 flex items-center gap-1">
                      Name
                    </div>
                    {/* <div className="col-span-1">Status</div> */}
                    <div className="col-span-3">About</div>
                    <div className="col-span-2">Agents</div>
                    <div className="col-span-2">Last Activity</div>
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
        <CreateProjectDialogWrapper
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  );
}
