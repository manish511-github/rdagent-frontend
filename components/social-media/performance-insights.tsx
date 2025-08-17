"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PerformanceInsightsProps {
  topPerformers: { title: string; reason: string }[]
  bottomPerformers: { title: string; reason: string }[]
  topTitle?: string
  bottomTitle?: string
}

export function PerformanceInsights({
  topPerformers,
  bottomPerformers,
  topTitle = "Top Performers",
  bottomTitle = "Areas to Improve",
}: PerformanceInsightsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{topTitle}</h4>
        </div>
        <div className="space-y-2">
          {topPerformers.slice(0, 2).map((performer, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-[#0A0A0A]">
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                {performer.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {performer.reason}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{bottomTitle}</h4>
        </div>
        <div className="space-y-2">
          {bottomPerformers.slice(0, 2).map((performer, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-[#0A0A0A]">
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                {performer.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {performer.reason}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
