import { Card, CardContent } from "@/components/ui/card"
import { PerformanceInsights } from "./performance-insights"

interface InsightsSectionProps {
  topPerformers: { title: string; reason: string }[]
  bottomPerformers: { title: string; reason: string }[]
  topTitle: string
  bottomTitle: string
}

export function InsightsSection({ topPerformers, bottomPerformers, topTitle, bottomTitle }: InsightsSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <PerformanceInsights
          topPerformers={topPerformers}
          bottomPerformers={bottomPerformers}
          topTitle={topTitle}
          bottomTitle={bottomTitle}
        />
      </CardContent>
    </Card>
  )
}
