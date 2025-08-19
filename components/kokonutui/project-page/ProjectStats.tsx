import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Activity,
  FileText,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";
import { ProjectSummary } from "./projectTypes";

interface ProjectStatsProps {
  summary: ProjectSummary | null;
  isLoading?: boolean;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({
  summary,
  isLoading = false,
}) => {
  const displayValue = (value: number | undefined) => {
    if (isLoading) return "...";
    return value?.toLocaleString() || "0";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-muted/40 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Projects
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {displayValue(summary?.total_projects)}
              </p>
            </div>
            <Briefcase className="h-7 w-7 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-muted/40 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Active Projects
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {displayValue(summary?.active_projects)}
              </p>
            </div>
            <Activity className="h-7 w-7 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-muted/40 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Agents
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {displayValue(summary?.total_agents)}
              </p>
            </div>
            <Users className="h-7 w-7 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-muted/40 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Posts
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {displayValue(summary?.total_posts)}
              </p>
            </div>
            <FileText className="h-7 w-7 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
