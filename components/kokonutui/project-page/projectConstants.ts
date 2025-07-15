import {
  Layers, Megaphone, Palette, Code, Package, FileText, Target,
  Activity, Lightbulb, Clock, AlertCircle, CheckCircle2, Flag,
  ArrowDown, ArrowUpDown, ArrowUp, TrendingUp, TrendingDown
} from "lucide-react";

export const projectCategories = [
  { value: "all", label: "All Categories", icon: Layers, color: "gray" },
  { value: "marketing", label: "Marketing", icon: Megaphone, color: "blue" },
  { value: "design", label: "Design", icon: Palette, color: "purple" },
  { value: "development", label: "Development", icon: Code, color: "indigo" },
  { value: "product", label: "Product", icon: Package, color: "green" },
  { value: "content", label: "Content", icon: FileText, color: "teal" },
  { value: "research", label: "Research", icon: Target, color: "cyan" },
];

export const projectStatuses = [
  { value: "all", label: "All Status", icon: Activity },
  { value: "planning", label: "Planning", icon: Lightbulb, color: "purple" },
  { value: "in-progress", label: "In Progress", icon: Clock, color: "blue" },
  { value: "review", label: "Review", icon: AlertCircle, color: "amber" },
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "green" },
];

export const priorityLevels = [
  { value: "all", label: "All Priorities", icon: Flag },
  { value: "low", label: "Low", icon: ArrowDown, color: "green" },
  { value: "medium", label: "Medium", icon: ArrowUpDown, color: "amber" },
  { value: "high", label: "High", icon: ArrowUp, color: "red" },
];

export const healthStatuses = [
  { value: "all", label: "All Health", icon: Activity },
  { value: "on-track", label: "On Track", icon: TrendingUp, color: "green" },
  { value: "at-risk", label: "At Risk", icon: AlertCircle, color: "amber" },
  { value: "off-track", label: "Off Track", icon: TrendingDown, color: "red" },
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "blue" },
]; 