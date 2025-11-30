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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Briefcase,
  Activity,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchProjects,
  fetchProjectSummary,
} from "@/store/slices/projectsSlice";
import {
  selectProjectLimitUsed,
  selectProjectLimitTotal,
} from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./ProjectCard";
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

  // Project limits from user slice
  const projectLimitUsed = useSelector((state: RootState) =>
    selectProjectLimitUsed(state)
  );
  const projectLimitTotal = useSelector((state: RootState) =>
    selectProjectLimitTotal(state)
  );
  const isSubscriptionInactive = useSelector((state: RootState) =>
    state.user.info?.subscription?.status === 'inactive'
  );

  const isProjectLimitReached =
    (projectLimitUsed >= projectLimitTotal && projectLimitTotal > 0) || isSubscriptionInactive;

  // All state declarations
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sort, setSort] = useState("newest");
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
    sort,
  ]);

  // No longer needed - using summary from API

  // Loading state
  if (status === "loading") {
    return (
      <section className="py-4 md:py-0">
        <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <section className="py-4 md:py-0">
        <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
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
      </section>
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
    <section className="py-4 md:py-0">
      <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
        {/* Projects Banner with Stats */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full rounded-md overflow-hidden mt-6">
          <div className="w-full px-4 md:px-6 py-6 md:py-4">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1 space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Projects Workspace
                </h2>
                <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl font-normal">
                  Organize, track, and ship your work faster. Create a new
                  project or jump back into your ongoing work.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="gap-1.5 h-7 text-xs bg-white text-slate-900 hover:bg-white/90"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-3 w-3" /> Create project
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          Total Projects
                        </p>
                        <p className="text-xl font-semibold text-white">
                          {summary?.total_projects || 0}
                        </p>
                      </div>
                      <Briefcase className="h-5 w-5 text-slate-300/60" />
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          Active Projects
                        </p>
                        <p className="text-xl font-semibold text-white">
                          {summary?.active_projects || 0}
                        </p>
                      </div>
                      <Activity className="h-5 w-5 text-slate-300/60" />
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          Total Agents
                        </p>
                        <p className="text-xl font-semibold text-white">
                          {summary?.total_agents || 0}
                        </p>
                      </div>
                      <Users className="h-5 w-5 text-slate-300/60" />
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          Total Posts
                        </p>
                        <p className="text-xl font-semibold text-white">
                          {summary?.total_posts || 0}
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-slate-300/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section header to mirror competitors page */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium">All projects</h2>
            <span className="text-xs text-muted-foreground opacity-80">
              ({filteredProjects.length} total)
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 mb-4 w-full">
          <div className="flex items-center border rounded-md p-0.5 h-7">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0 rounded-sm"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0 rounded-sm"
              onClick={() => setView("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] h-7 text-xs pl-7 pr-2"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    className="h-7 text-xs gap-1 px-2.5"
                    onClick={() => {
                      if (!isProjectLimitReached) {
                        setShowCreateDialog(true);
                      }
                    }}
                    disabled={isProjectLimitReached}
                  >
                    <Plus className="h-3 w-3" />
                    <span>New project</span>
                  </Button>
                </div>
              </PopoverTrigger>
              {isProjectLimitReached && (
                <PopoverContent className="w-80 p-4" side="bottom" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      {isSubscriptionInactive ? "Subscription Inactive" : "Project Limit Reached"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isSubscriptionInactive
                        ? "Your subscription is inactive. Please activate your plan to create new projects."
                        : `You've reached your project limit (${projectLimitUsed}/${projectLimitTotal}). Upgrade your plan to create more projects.`}
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => router.push(isSubscriptionInactive ? "/pricing" : "/upgrade")}
                    >
                      {isSubscriptionInactive ? "Activate Subscription" : "Upgrade Plan"}
                    </Button>
                  </div>
                </PopoverContent>
              )}
            </Popover>
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
                Create your first project to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create new project
              </Button>
            </div>
          </Card>
        ) : (
          <div
            className={cn(
              view === "grid" &&
                "grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
              view === "list" && "flex flex-col w-full"
            )}
          >
            {view === "list" && (
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground border-b bg-background/80 sticky top-0 z-10">
                <div className="col-span-3 flex items-center gap-1">Name</div>
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
          </div>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialogWrapper
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </section>
  );
}
