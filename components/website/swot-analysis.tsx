import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"

interface SwotAnalysisProps {
  report: {
    swot_ours: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
    }
    swot_competitor: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
    }
  }
}

export function SwotAnalysis({ report }: SwotAnalysisProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Our SWOT Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium text-green-600">Strengths</h4>
            </div>
            <div className="space-y-2">
              {report.swot_ours.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-green-50 dark:bg-green-900/20 border-l-2 border-green-600"
                >
                  {strength}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-medium text-red-600">Weaknesses</h4>
            </div>
            <div className="space-y-2">
              {report.swot_ours.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-600"
                >
                  {weakness}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-600">Opportunities</h4>
            </div>
            <div className="space-y-2">
              {report.swot_ours.opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600"
                >
                  {opportunity}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-medium text-orange-600">Threats</h4>
            </div>
            <div className="space-y-2">
              {report.swot_ours.threats.map((threat, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-600"
                >
                  {threat}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Competitor SWOT Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium text-green-600">Strengths</h4>
            </div>
            <div className="space-y-2">
              {report.swot_competitor.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-green-50 dark:bg-green-900/20 border-l-2 border-green-600"
                >
                  {strength}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-medium text-red-600">Weaknesses</h4>
            </div>
            <div className="space-y-2">
              {report.swot_competitor.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-600"
                >
                  {weakness}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-600">Opportunities</h4>
            </div>
            <div className="space-y-2">
              {report.swot_competitor.opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600"
                >
                  {opportunity}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-medium text-orange-600">Threats</h4>
            </div>
            <div className="space-y-2">
              {report.swot_competitor.threats.map((threat, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-600"
                >
                  {threat}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
