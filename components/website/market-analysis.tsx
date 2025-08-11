import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MarketAnalysis {
  price_ranges: {
    low: number
    median: number
    high: number
  }
}

interface MarketAnalysisProps {
  data: MarketAnalysis
}

export function MarketAnalysis({ data }: MarketAnalysisProps) {
  return (
    <Card className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Market Price Analysis</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Low</span>
            </div>
            <div className="text-lg font-bold text-green-600">${data.price_ranges.low}</div>
            <div className="text-xs text-gray-500">per device/month</div>
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Minus className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Median</span>
            </div>
            <div className="text-lg font-bold text-blue-600">${data.price_ranges.median}</div>
            <div className="text-xs text-gray-500">per device/month</div>
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">High</span>
            </div>
            <div className="text-lg font-bold text-red-600">${data.price_ranges.high}</div>
            <div className="text-xs text-gray-500">per device/month</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Price range analysis based on publicly available pricing data
          </div>
        </div>
      </div>
    </Card>
  )
}
