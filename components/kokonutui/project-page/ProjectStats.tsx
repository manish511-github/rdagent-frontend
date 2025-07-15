import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Activity, CheckCircle2, AlertCircle, DollarSign, PieChart } from "lucide-react";
import { formatCurrency } from "./projectUtils";

interface ProjectStatsProps {
  projectStats: {
    total: number;
    active: number;
    completed: number;
    atRisk: number;
    totalBudget: number;
    totalSpent: number;
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
            <p className="text-xs font-medium text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{projectStats.active}</p>
          </div>
          <Activity className="h-8 w-8 text-blue-800/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-900/10 to-blue-950/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{projectStats.completed}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-blue-900/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-800/30 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">At Risk</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{projectStats.atRisk}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-blue-800/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-900/10 to-blue-950/5 dark:from-blue-900/30 dark:to-blue-950/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Budget</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
              {formatCurrency(projectStats.totalBudget)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-900/20" />
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-blue-800/10 to-blue-900/5 dark:from-blue-800/30 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-400/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Budget Used</p>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-400">
              {((projectStats.totalSpent / projectStats.totalBudget) * 100).toFixed(0)}%
            </p>
          </div>
          <PieChart className="h-8 w-8 text-blue-800/20" />
        </div>
      </CardContent>
    </Card>
  </div>
); 