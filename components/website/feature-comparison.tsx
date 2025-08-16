import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSelector } from "react-redux"
import { selectFeatures } from "@/store/slices/competitorAnalysisSlice"

interface Feature {
  feature_name: string
  description: string
  category: string
  technical_depth: string
  implementation_scale: string
}

interface FeatureComparisonProps {}

export function FeatureComparison({}: FeatureComparisonProps) {
  const featuresFromStore = useSelector(selectFeatures)
  const features = (featuresFromStore?.features ?? []) as Feature[]

  const getTechnicalDepthColor = (depth: string) => {
    switch (depth.toLowerCase()) {
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "surface-level":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getScaleColor = (scale: string) => {
    switch (scale.toLowerCase()) {
      case "enterprise-grade":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "complete":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "partial":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Features</h4>
            <Badge variant="outline" className="rounded-none text-xs">{features.length} features</Badge>
          </div>
          {features.length > 0 ? (
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature.feature_name} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                      {feature.feature_name}
                    </h5>
                    {feature.technical_depth && (
                      <Badge className={`text-xs rounded-none ${getTechnicalDepthColor(feature.technical_depth)}`}>
                        {feature.technical_depth}
                      </Badge>
                    )}
                  </div>
                  {feature.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{feature.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {feature.category && (
                      <Badge variant="outline" className="text-xs rounded-none">{feature.category}</Badge>
                    )}
                    {feature.implementation_scale && (
                      <Badge className={`text-xs rounded-none ${getScaleColor(feature.implementation_scale)}`}>
                        {feature.implementation_scale}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600 dark:text-gray-400">No features available.</div>
          )}
        </Card>
      </div>
    </div>
  )
}
