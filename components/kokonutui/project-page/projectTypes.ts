// Project and website analysis types
import { LucideIcon } from "lucide-react";

// New API response structure for projects
export interface ApiProject {
  id: number;
  uuid: string;
  title: string;
  description: string;
  target_audience: string;
  website_url: string;
  category: string;
  priority: string;
  due_date: string | null;
  budget: number | null;
  team: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tags: string | null;
  competitors: string[];
  keywords: string[];
  excluded_keywords: string[];
  owner_id: number;
  created_at: string;
  agent_count: number;
  last_activity: string | null;
}

// Legacy project interface for UI compatibility
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
  icon?: LucideIcon; // Made optional since we'll calculate it dynamically
  // New fields from API
  targetAudience?: string;
  websiteUrl?: string;
  competitors?: string[];
  keywords?: string[];
  excludedKeywords?: string[];
  agentCount?: number;
  lastActivity?: string | null;
}

// Project summary from /projects/summary endpoint
export interface ProjectSummary {
  total_projects: number;
  active_projects: number;
  total_agents: number;
  total_posts: number;
}

export interface WebsiteAnalysisResult {
  url: string;
  title: string;
  description: string;
  target_audience: string;
  keywords: string[];
  main_category: string;
}
