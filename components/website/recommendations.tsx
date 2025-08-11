import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, AlertCircle, Clock } from "lucide-react"

interface RecommendationsProps {
  report: {
    recommendations: Array<{
      priority: string
      item: string
      rationale: string
    }>
  }
}

export function Recommendations({ report }: RecommendationsProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "medium":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "low":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
      case "medium":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
      case "low":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200"
    }
  }

  const sortedRecommendations = [...report.recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (
      (priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0) -
      (priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0)
    )
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {["high", "medium", "low"].map((priority) => {
          const count = report.recommendations.filter((r) => r.priority.toLowerCase() === priority).length
          return (
            <Card key={priority} className="p-4 rounded-none border border-gray-200 dark:border-gray-800 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPriorityIcon(priority)}
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{priority} Priority</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Recommendations</div>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => (
          <Card key={index} className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{getPriorityIcon(recommendation.priority)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs rounded-none ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority.toUpperCase()}
                  </Badge>
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{recommendation.item}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{recommendation.rationale}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
