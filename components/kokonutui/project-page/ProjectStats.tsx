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
    <Card className="bg-gradient-to-br from-card to-muted/20 dark:from-slate-900 dark:to-slate-950/80 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Projects</p>
            <p className="text-2xl font-bold">{projectStats.total}</p>
          </div>
          <Briefcase className="h-8 w-8 text-muted-foreground/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Active Projects</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{projectStats.active}</p>
          </div>
          <Activity className="h-8 w-8 text-blue-800/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-100/10 to-blue-200/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Posts</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,248</p>
          </div>
          <FileText className="h-8 w-8 text-blue-600/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-amber-100/10 to-amber-200/5 dark:from-amber-900/30 dark:to-amber-950/20 border border-amber-200/30 dark:border-amber-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Content</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">45</p>
          </div>
          <MessageSquare className="h-8 w-8 text-amber-600/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-green-100/10 to-green-200/5 dark:from-green-900/30 dark:to-green-950/20 border border-green-200/30 dark:border-green-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">New Leads</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">342</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-600/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-indigo-100/10 to-indigo-200/5 dark:from-indigo-900/30 dark:to-indigo-950/20 border border-indigo-200/30 dark:border-indigo-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Agents</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">23</p>
          </div>
          <Users className="h-8 w-8 text-indigo-600/20" />
        </div>
      </CardContent>
    </Card>
  </div>
); 