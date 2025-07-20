import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Star, MoreHorizontal, ExternalLink, Copy, Archive, Trash2, CheckCircle2, CalendarDays, Activity, MessageSquare, Clock, Briefcase, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "./projectTypes";
import { getStatusColor, formatRelativeDate, getDaysUntilDue } from "./projectUtils";

interface ProjectCardProps {
  project: Project;
  index: number;
  isSelected: boolean;
  isSelectionMode: boolean;
  loadingProjectId: string | null;
  selectedProjects: string[];
  animateIn: boolean;
  toggleProjectSelection: (id: string) => void;
  handleProjectClick: (id: string) => void;
  view: "grid" | "list";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isSelected,
  isSelectionMode,
  loadingProjectId,
  animateIn,
  toggleProjectSelection,
  handleProjectClick,
  view,
}) => {
  const dueStatus = getDaysUntilDue(project.dueDate);
  const completedTasks = project.metrics?.completed ?? 0;
  const totalTasks = project.metrics?.tasks ?? 0;
  const comments = project.metrics?.comments ?? 0;
  const health = project.health ?? 'on-track';
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const Icon = project.icon ?? Briefcase;
  const isLoading = loadingProjectId === project.uuid;

  return (
    view === "list" ? (
      <div
        className={cn(
          "grid grid-cols-12 items-center gap-2 px-4 py-3 border-b bg-background/60 hover:bg-muted/40 transition cursor-pointer",
          isSelected && "bg-blue-50 dark:bg-blue-900/30",
        )}
        style={{ transitionDelay: `${index * 30}ms` }}
        onClick={() => handleProjectClick(project.uuid)}
      >
        {/* Name (icon, title, url) */}
        <div className="col-span-3 flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-400/30 flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{project.title}</div>
          </div>
        </div>
        {/* Status */}
        <div className="col-span-1">
          <Badge variant="secondary" className={cn("text-xs px-2 py-0 h-6 font-medium border-0", getStatusColor(project.status))}>
            {project.status}
          </Badge>
        </div>
        {/* About */}
        <div className="col-span-3 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{project.description}</div>
        </div>
        {/* Members */}
        <div className="col-span-2 flex items-center gap-1">
          <div className="flex -space-x-2">
            {project.team.slice(0, 5).map((member) => (
              <Avatar key={member.name} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-[10px] font-semibold bg-muted">{member.initials}</AvatarFallback>
              </Avatar>
            ))}
            {project.team.length > 5 && (
              <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold">+{project.team.length - 5}</div>
            )}
          </div>
        </div>
        {/* Progress */}
        <div className="col-span-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                project.progress >= 100 ? "bg-green-500" : project.progress >= 80 ? "bg-blue-500" : project.progress >= 50 ? "bg-yellow-400" : project.progress > 0 ? "bg-orange-400" : "bg-red-400"
              )}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{project.progress || 0}%</span>
        </div>
        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
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
    ) : (
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
              e.preventDefault();
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
                  <p className="text-[0.70rem] leading-relaxed text-foreground/80 dark:text-slate-100/90 line-clamp-4 mb-3 font-normal tracking-wide font-inter">
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
  );
};
