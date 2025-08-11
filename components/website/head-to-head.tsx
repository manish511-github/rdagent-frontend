import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, Minus } from "lucide-react"

interface HeadToHeadProps {
  report: {
    head_to_head: {
      areas_we_lead: string[]
      areas_competitor_leads: string[]
      parity: string[]
    }
  }
}

export function HeadToHead({ report }: HeadToHeadProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-green-600">Areas We Lead</h3>
          </div>
          <div className="space-y-2">
            {report.head_to_head.areas_we_lead.map((area, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs rounded-none bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 block w-full text-left"
              >
                {area}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-medium text-red-600">Competitor Leads</h3>
          </div>
          <div className="space-y-2">
            {report.head_to_head.areas_competitor_leads.map((area, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs rounded-none bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 block w-full text-left"
              >
                {area}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Minus className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-600">Parity Areas</h3>
          </div>
          <div className="space-y-2">
            {report.head_to_head.parity.map((area, index) => (
              <Badge key={index} variant="outline" className="text-xs rounded-none block w-full text-left">
                {area}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-none border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Competitive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{report.head_to_head.areas_we_lead.length}</div>
            <div className="text-xs text-green-700 dark:text-green-300">Areas We Lead</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{report.head_to_head.areas_competitor_leads.length}</div>
            <div className="text-xs text-red-700 dark:text-red-300">Competitor Leads</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-gray-600">{report.head_to_head.parity.length}</div>
            <div className="text-xs text-gray-700 dark:text-gray-300">Parity Areas</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
