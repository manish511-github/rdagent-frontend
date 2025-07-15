// Project and website analysis types
import { LucideIcon } from 'lucide-react';

export interface Project {
  uuid: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  startDate: string;
  lastUpdated: string;
  priority: string;
  category: string;
  budget: number;
  budgetSpent: number;
  team: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tags: string[];
  metrics: {
    tasks: number;
    completed: number;
    comments: number;
    attachments: number;
  };
  health: string;
  starred: boolean;
  icon: LucideIcon;
}

export interface WebsiteAnalysisResult {
  url: string;
  title: string;
  description: string;
  target_audience: string;
  keywords: string[];
  main_category: string;
} 