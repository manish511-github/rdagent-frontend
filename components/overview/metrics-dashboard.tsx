import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, BarChart2, Users } from "lucide-react"

interface MetricsDashboardProps {
  metrics: {
    revenue?: string
    arr?: string
    yoy_growth?: string
    customers?: string
  }
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const metricItems = [
    { label: "Revenue", value: metrics.revenue, icon: DollarSign, color: "text-green-600 dark:text-green-400" },
    { label: "ARR", value: metrics.arr, icon: TrendingUp, color: "text-blue-600 dark:text-blue-400" },
    { label: "YoY Growth", value: metrics.yoy_growth, icon: BarChart2, color: "text-purple-600 dark:text-purple-400" },
    { label: "Customers", value: metrics.customers, icon: Users, color: "text-orange-600 dark:text-orange-400" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metricItems.map(({ label, value, icon: Icon, color }) => (
        <Card
          key={label}
          className="rounded-none border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-4 text-center"
        >
          <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
          <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value || "—"}</div>
        </Card>
      ))}
    </div>
  )
}
