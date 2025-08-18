"use client"

import { Badge } from "@/components/ui/badge"
import { Target, Lightbulb } from "lucide-react"

interface ActionInsightsProps {
  opportunities: {
    category: string
    title: string
    rationale: string
    sample_titles?: string[]
  }[]
  actionPlans: {
    objective: string
    hypothesis: string
    actions: string[]
  }[]
}

export function ActionInsights({ opportunities, actionPlans }: ActionInsightsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <h4 className="flex items-center gap-1 text-sm font-semibold mb-2">
          <Target className="h-3 w-3 text-orange-600" />
          Opportunities
        </h4>
        <div className="space-y-2">
          {opportunities.slice(0, 2).map((opportunity, index) => (
            <div key={index} className="p-2 bg-orange-50 rounded">
              <Badge variant="outline" className="text-xs mb-1">
                {opportunity.category}
              </Badge>
              <div className="text-xs font-medium">{opportunity.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{opportunity.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-1 text-sm font-semibold mb-2">
          <Lightbulb className="h-3 w-3 text-yellow-600" />
          Action Plan
        </h4>
        <div className="space-y-2">
          {actionPlans.slice(0, 2).map((plan, index) => (
            <div key={index} className="p-2 bg-yellow-50 rounded">
              <div className="text-xs font-medium mb-1">{plan.objective}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{plan.hypothesis}</div>
              <div className="text-xs mt-1">
                <span className="font-medium">Actions: </span>
                {plan.actions.slice(0, 1).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
