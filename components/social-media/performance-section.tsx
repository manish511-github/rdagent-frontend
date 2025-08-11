import { Card, CardContent } from "@/components/ui/card"
import { PerformanceScore } from "./performance-score"

interface PerformanceSectionProps {
  scoring: any
  totalScore: number
}

export function PerformanceSection({ scoring, totalScore }: PerformanceSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <PerformanceScore scoring={scoring} totalScore={totalScore} />
      </CardContent>
    </Card>
  )
}
