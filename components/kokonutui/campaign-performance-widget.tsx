import type React from "react"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Eye, MousePointerClick, Users, ArrowRight } from "lucide-react"

interface CampaignMetric {
  id: string
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ElementType
}

interface CampaignPerformanceWidgetProps {
  className?: string
}

const METRICS: CampaignMetric[] = [
  {
    id: "1",
    title: "Impressions",
    value: "245,678",
    change: "+12.5%",
    trend: "up",
    icon: Eye,
  },
  {
    id: "2",
    title: "Click-through Rate",
    value: "3.8%",
    change: "+0.7%",
    trend: "up",
    icon: MousePointerClick,
  },
  {
    id: "3",
    title: "Conversions",
    value: "1,245",
    change: "+8.3%",
    trend: "up",
    icon: Users,
  },
  {
    id: "4",
    title: "Cost per Acquisition",
    value: "$24.50",
    change: "-5.2%",
    trend: "down",
    icon: TrendingUp,
  },
]

export default function CampaignPerformanceWidget({ className }: CampaignPerformanceWidgetProps) {
  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "bg-white dark:bg-[#0A0A0C]",
        "border border-zinc-100 dark:border-zinc-800/80",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Campaign Performance</p>
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Summer Product Launch</h1>
          <span className="text-[11px] px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Active
          </span>
        </div>
      </div>

      <div className="p-2.5">
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((metric) => (
            <div
              key={metric.id}
              className={cn(
                "group flex flex-col",
                "p-2.5 rounded-lg",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                "transition-all duration-200",
                "border border-zinc-100 dark:border-zinc-800/80",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <metric.icon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{metric.title}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    metric.trend === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : metric.trend === "down" && metric.title.includes("Cost")
                        ? "text-emerald-600 dark:text-emerald-400"
                        : metric.trend === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  {metric.change}
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  ) : metric.trend === "down" ? (
                    <ArrowDownLeft className="w-3 h-3 ml-0.5" />
                  ) : null}
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">AI Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            <li className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5">•</span>
              Increase budget allocation for Instagram ads by 15% to capitalize on high engagement rates
            </li>
            <li className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5">•</span>
              Test new ad creative with product benefits highlighted more prominently
            </li>
          </ul>
        </div>
      </div>

      <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "py-2 px-3 rounded-lg",
            "text-xs font-medium",
            "bg-zinc-900 dark:bg-zinc-50",
            "text-zinc-50 dark:text-zinc-900",
            "hover:bg-zinc-800 dark:hover:bg-zinc-200",
            "shadow-sm hover:shadow",
            "transition-all duration-200",
          )}
        >
          <span>View Campaign Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
