"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PerformanceScoringProps {
  scoring: {
    number_of_videos?: { score: number; reason: string }
    activity?: { score: number; reason: string }
    engagement?: { score: number; reason: string }
    relevancy?: { score: number; reason: string }
    total_channel_score: number
  }
}

export function PerformanceScoring({ scoring }: PerformanceScoringProps) {
  const scoreItems = [
    { key: "number_of_videos", label: "Content Volume", data: scoring.number_of_videos },
    { key: "activity", label: "Activity Level", data: scoring.activity },
    { key: "engagement", label: "Engagement", data: scoring.engagement },
    { key: "relevancy", label: "Relevancy", data: scoring.relevancy },
  ].filter((item) => item.data)

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Performance Score</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{scoring.total_channel_score}/100</span>
      </div>
      <div className="space-y-3">
        {scoreItems.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{item.data!.score}/10</span>
            </div>
            <Progress value={item.data!.score * 10} className="h-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.data!.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
