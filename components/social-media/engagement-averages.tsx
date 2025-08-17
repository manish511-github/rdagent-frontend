"use client"

import { Card } from "@/components/ui/card"

interface EngagementAveragesProps {
  title: string
  metrics: Array<{
    value: number
    label: string
    color: string
  }>
}

export function EngagementAverages({ title, metrics }: EngagementAveragesProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-[#0A0A0A] rounded-none">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
            <div className={`text-sm font-medium ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
