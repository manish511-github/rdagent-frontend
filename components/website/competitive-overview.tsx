import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Trophy } from "lucide-react"

interface CompetitiveOverviewProps {
  data: {
    ours: {
      name: string
      features: Array<{
        feature_name: string
        description: string
        category: string
        technical_depth: string
        implementation_scale: string
      }>
    }
    competitor: {
      name: string
      features: Array<{
        feature_name: string
        description: string
        category: string
        technical_depth: string
        implementation_scale: string
      }>
    }
  }
  report: {
    unique_to_ours: Array<{ name: string; reason: string }>
    unique_to_competitor: Array<{ name: string; reason: string }>
    common_features: Array<{ name: string; notes: string }>
  }
}

export function CompetitiveOverview({ data, report }: CompetitiveOverviewProps) {
  const ourCategories = [...new Set(data.ours.features.map((f) => f.category))]
  const competitorCategories = [...new Set(data.competitor.features.map((f) => f.category))]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Our Platform</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">{data.ours.features.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Features</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{ourCategories.length} Categories</div>
          </div>
        </Card>

        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Competitor</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-red-600">{data.competitor.features.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Features</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{competitorCategories.length} Categories</div>
          </div>
        </Card>

        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Unique Advantages</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">{report.unique_to_ours.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Our Unique Features</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {report.unique_to_competitor.length} Competitor Unique
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Our Feature Categories</h3>
          <div className="flex flex-wrap gap-1">
            {ourCategories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs rounded-none">
                {category}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Competitor Categories</h3>
          <div className="flex flex-wrap gap-1">
            {competitorCategories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs rounded-none">
                {category}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
