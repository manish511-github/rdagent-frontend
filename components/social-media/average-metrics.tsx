import { Card, CardContent } from "@/components/ui/card"

interface AverageMetric {
  value: number
  label: string
  color: string
}

interface AverageMetricsProps {
  title: string
  metrics: AverageMetric[]
  backgroundColor?: string
}

export function AverageMetrics({ title, metrics, backgroundColor = "bg-gray-50" }: AverageMetricsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`p-3 ${backgroundColor} rounded`}>
          <h4 className="text-sm font-semibold mb-2">{title}</h4>
          <div className={`grid grid-cols-${metrics.length} gap-2 text-center`}>
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className={`text-sm font-bold ${metric.color}`}>
                  {typeof metric.value === "number" ? metric.value.toFixed(1) : metric.value}
                </div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
