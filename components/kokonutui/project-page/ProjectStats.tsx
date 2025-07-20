import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Activity, FileText, MessageSquare, UserCheck, Users } from "lucide-react";
import { formatCurrency } from "./projectUtils";

interface ProjectStatsProps {
  projectStats: {
    total: number;
    active: number;
    // completed: number;
    // atRisk: number;
    // totalBudget: number;
    // totalSpent: number;
    // Add more fields if needed
  };
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ projectStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Projects</p>
            <p className="text-2xl font-semibold text-foreground">{projectStats.total}</p>
          </div>
          <Briefcase className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Active Projects</p>
            <p className="text-2xl font-semibold text-foreground">{projectStats.active}</p>
          </div>
          <Activity className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Posts</p>
            <p className="text-2xl font-semibold text-foreground">1,248</p>
          </div>
          <FileText className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Content</p>
            <p className="text-2xl font-semibold text-foreground">45</p>
          </div>
          <MessageSquare className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">New Leads</p>
            <p className="text-2xl font-semibold text-foreground">342</p>
          </div>
          <UserCheck className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-muted shadow-sm backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Agents</p>
            <p className="text-2xl font-semibold text-foreground">23</p>
          </div>
          <Users className="h-7 w-7 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  </div>
); 