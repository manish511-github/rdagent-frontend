import { Card, CardContent } from "@/components/ui/card"
import { MetricCard } from "./metric-card"
import type { LucideIcon } from "lucide-react"

interface Metric {
  icon: LucideIcon
  value: string | number
  label: string
}

interface MetricsGridProps {
  metrics: Metric[]
  columns?: number
}

export function MetricsGrid({ metrics, columns = 4 }: MetricsGridProps) {
  const formatNumber = (num: number | string) => {
    const numValue = typeof num === "string" ? Number.parseFloat(num) : num
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`
    return numValue.toString()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className={`grid grid-cols-${columns} gap-3`}>
          {metrics.map((metric, index) => (
            <MetricCard key={index} icon={metric.icon} value={formatNumber(metric.value)} label={metric.label} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
