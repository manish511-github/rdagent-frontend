"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { MessageSquare, TrendingUp, Users, FileText, UserCheck, AtSign, ArrowUp, ArrowDown } from "lucide-react"

interface AnalyticsMetric {
  title: string
  value: string | number
  change?: {
    value: string
    isPositive: boolean
  }
  icon: React.ElementType
  color: string
}

export default function MarketingAnalyticsCards() {
  // Analytics metrics data
  const metrics: AnalyticsMetric[] = [
    {
      title: "Total Posts",
      value: "1,248",
      change: {
        value: "+24%",
        isPositive: true,
      },
      icon: FileText,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Mentions",
      value: "78",
      change: {
        value: "+23",
        isPositive: true,
      },
      icon: AtSign,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Engagement",
      value: "5.2%",
      change: {
        value: "+0.8%",
        isPositive: true,
      },
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      title: "Content",
      value: "45",
      icon: MessageSquare,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      title: "New Leads",
      value: "342",
      change: {
        value: "+18%",
        isPositive: true,
      },
      icon: UserCheck,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      title: "Agents",
      value: "23",
      icon: Users,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Marketing Analytics</h3>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-card border border-border/40 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-1.5 rounded-md", metric.color)}>
                <metric.icon className="h-3 w-3" />
              </div>
              {metric.change && (
                <div
                  className={cn(
                    "flex items-center text-[10px]",
                    metric.change.isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {metric.change.isPositive ? (
                    <ArrowUp className="h-2.5 w-2.5 mr-0.5" />
                  ) : (
                    <ArrowDown className="h-2.5 w-2.5 mr-0.5" />
                  )}
                  <span>{metric.change.value}</span>
                </div>
              )}
            </div>

            <div className="mt-1">
              <p className="text-xs text-muted-foreground">{metric.title}</p>
              <h4 className="text-lg font-bold">{metric.value}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
