// Utility functions for project display and formatting
import { 
  Megaphone, 
  Code, 
  Package, 
  Palette, 
  PenTool, 
  Briefcase, 
  Activity 
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const getStatusColor = (status: string | undefined) => {
  if (!status) {
    return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30";
  }
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-blue-100/15 text-blue-800 dark:bg-blue-900/25 dark:text-blue-300 border-blue-800/30";
    case "in progress":
      return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30";
    case "planning":
      return "bg-blue-100/15 text-blue-900 dark:bg-blue-900/25 dark:text-blue-300 border-blue-900/30";
    case "review":
      return "bg-blue-100/15 text-blue-800 dark:bg-blue-900/25 dark:text-blue-300 border-blue-800/30";
    default:
      return "bg-blue-100/15 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 border-blue-700/30";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-blue-700";
    case "medium":
      return "text-blue-500";
    case "low":
      return "text-blue-400";
    default:
      return "text-blue-300";
  }
};

export const getHealthColor = (health: string) => {
  switch (health) {
    case "on-track":
      return "text-blue-500";
    case "at-risk":
      return "text-blue-600";
    case "off-track":
      return "text-blue-700";
    case "completed":
      return "text-blue-400";
    default:
      return "text-blue-300";
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getDaysUntilDue = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", color: "text-blue-900" };
  if (diffDays === 0) return { text: "Due today", color: "text-blue-800" };
  if (diffDays === 1) return { text: "Due tomorrow", color: "text-blue-800" };
  if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-blue-700" };
  return { text: `${diffDays} days left`, color: "text-muted-foreground" };
};

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const getCategoryIcon = (category: string): LucideIcon => {
  switch (category.toLowerCase()) {
    case "marketing":
      return Megaphone;
    case "saas":
      return Code;
    case "ecommerce":
      return Package;
    case "design":
      return Palette;
    case "content":
      return PenTool;
    case "business":
      return Briefcase;
    default:
      return Activity;
  }
};

 