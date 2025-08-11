"use client"

import { Card } from "@/components/ui/card"
import { Target, Lightbulb } from "lucide-react"

interface ImprovementOpportunitiesProps {
  opportunities: Array<{
    category: string
    title: string
    rationale: string
    sample_titles?: string[]
  }>
  actionPlans: Array<{
    objective: string
    hypothesis: string
    actions: string[]
  }>
}

export function ImprovementOpportunities({ opportunities, actionPlans }: ImprovementOpportunitiesProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-none">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Opportunities</h4>
        </div>
        <div className="space-y-2">
          {opportunities.slice(0, 2).map((opportunity, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-none">
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{opportunity.title}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{opportunity.rationale}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-none">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Action Plans</h4>
        </div>
        <div className="space-y-2">
          {actionPlans.slice(0, 2).map((plan, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-none">
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{plan.objective}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{plan.hypothesis}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
