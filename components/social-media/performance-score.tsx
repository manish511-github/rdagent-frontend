"use client"

import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

interface PerformanceScoreProps {
  scoring: {
    [key: string]: { score: number; reason: string } | number
  }
  totalScore: number
}

export function PerformanceScore({ scoring, totalScore }: PerformanceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <BarChart3 className="h-4 w-4" />
        Performance Score: {totalScore}/10
      </h4>
      {Object.entries(scoring).map(([key, value]) => {
        if (key === "total_channel_score" || typeof value === "number") return null
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="capitalize">{key.replace("_", " ")}</span>
              <span className={`font-bold ${getScoreColor(value.score)}`}>{value.score}/10</span>
            </div>
            <Progress value={value.score * 10} className="h-2" />
          </div>
        )
      })}
    </div>
  )
}
