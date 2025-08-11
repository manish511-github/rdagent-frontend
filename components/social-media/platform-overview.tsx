"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface PlatformOverviewProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  color: string
  metrics: Array<{
    icon: LucideIcon
    value: string | number
    label: string
  }>
}

export function PlatformOverview({ icon: Icon, title, subtitle, color, metrics }: PlatformOverviewProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-none">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{subtitle}</span>}
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-none">
            <div className="flex items-center gap-1 mb-1">
              <metric.icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              <div className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</div>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
