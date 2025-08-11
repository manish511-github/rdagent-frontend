import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Feature {
  feature_name: string
  description: string
  category: string
  technical_depth: string
  implementation_scale: string
}

interface ComparisonData {
  ours: {
    name: string
    features: Feature[]
  }
  competitor: {
    name: string
    features: Feature[]
  }
  report: {
    common_features: Array<{ name: string; notes: string }>
    unique_to_ours: Array<{ name: string; reason: string }>
    unique_to_competitor: Array<{ name: string; reason: string }>
    head_to_head: {
      areas_we_lead: string[]
      areas_competitor_leads: string[]
      parity: string[]
    }
  }
}

interface FeatureComparisonProps {
  data?: ComparisonData
}

const SAMPLE_COMPARISON: ComparisonData = {
  ours: {
    name: "Hexnode",
    features: [
      {
        feature_name: "Kiosk Browser Management",
        description: "Complete kiosk browser lockdown with multi-tab support",
        category: "Kiosk Management",
        technical_depth: "Advanced",
        implementation_scale: "Enterprise-grade",
      },
      {
        feature_name: "XR Device Management",
        description: "Comprehensive management for XR and wearable devices",
        category: "XR Management",
        technical_depth: "Advanced",
        implementation_scale: "Complete",
      },
    ],
  },
  competitor: {
    name: "Scalefusion",
    features: [
      {
        feature_name: "Zero Trust Access",
        description: "Advanced authentication and authorization framework",
        category: "Security",
        technical_depth: "Advanced",
        implementation_scale: "Enterprise-grade",
      },
    ],
  },
  report: {
    common_features: [
      { name: "Unified Endpoint Management", notes: "Both platforms offer comprehensive UEM capabilities" },
    ],
    unique_to_ours: [
      { name: "Kiosk Management", reason: "Advanced kiosk browser and lockdown capabilities" },
      { name: "XR Management", reason: "Specialized support for XR and wearable devices" },
    ],
    unique_to_competitor: [
      { name: "Zero Trust Access", reason: "Comprehensive authentication and authorization framework" },
    ],
    head_to_head: {
      areas_we_lead: ["Kiosk Management", "XR Management", "Patch Management"],
      areas_competitor_leads: ["Zero Trust Access", "Web Content Filtering"],
      parity: ["Unified Endpoint Management"],
    },
  },
}

export function FeatureComparison({ data }: FeatureComparisonProps) {
  const comparisonData = data ?? SAMPLE_COMPARISON

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
      {/* Competitive Overview */}
      <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Competitive Overview</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">We Lead</h4>
            </div>
            <div className="space-y-1">
              {comparisonData.report.head_to_head.areas_we_lead.slice(0, 3).map((area) => (
                <div key={area} className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                  {area}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">Parity</h4>
            </div>
            <div className="space-y-1">
              {comparisonData.report.head_to_head.parity.map((area) => (
                <div key={area} className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                  {area}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">Competitor Leads</h4>
            </div>
            <div className="space-y-1">
              {comparisonData.report.head_to_head.areas_competitor_leads.map((area) => (
                <div key={area} className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                  {area}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comparisonData.ours.name} Features
            </h4>
            <Badge variant="outline" className="rounded-none text-xs">
              {comparisonData.ours.features.length} features
            </Badge>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comparisonData.ours.features.slice(0, 8).map((feature) => (
              <div key={feature.feature_name} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {feature.feature_name}
                  </h5>
                  <Badge className={`text-xs rounded-none ${getTechnicalDepthColor(feature.technical_depth)}`}>
                    {feature.technical_depth}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{feature.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs rounded-none">
                    {feature.category}
                  </Badge>
                  <Badge className={`text-xs rounded-none ${getScaleColor(feature.implementation_scale)}`}>
                    {feature.implementation_scale}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comparisonData.competitor.name} Features
            </h4>
            <Badge variant="outline" className="rounded-none text-xs">
              {comparisonData.competitor.features.length} features
            </Badge>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comparisonData.competitor.features.slice(0, 8).map((feature) => (
              <div key={feature.feature_name} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-none">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {feature.feature_name}
                  </h5>
                  <Badge className={`text-xs rounded-none ${getTechnicalDepthColor(feature.technical_depth)}`}>
                    {feature.technical_depth}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{feature.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs rounded-none">
                    {feature.category}
                  </Badge>
                  <Badge className={`text-xs rounded-none ${getScaleColor(feature.implementation_scale)}`}>
                    {feature.implementation_scale}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Unique Advantages */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Our Unique Advantages</h4>
          </div>
          <div className="space-y-2">
            {comparisonData.report.unique_to_ours.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="p-2 bg-green-50/50 dark:bg-green-900/10 rounded-none border-l-2 border-green-500"
              >
                <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Competitor Advantages</h4>
          </div>
          <div className="space-y-2">
            {comparisonData.report.unique_to_competitor.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="p-2 bg-orange-50/50 dark:bg-orange-900/10 rounded-none border-l-2 border-orange-500"
              >
                <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
