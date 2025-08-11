import { Card, CardContent } from "@/components/ui/card"
import { ActionInsights } from "./action-insights"

interface ActionsSectionProps {
  opportunities: any[]
  actionPlans: any[]
}

export function ActionsSection({ opportunities, actionPlans }: ActionsSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <ActionInsights opportunities={opportunities} actionPlans={actionPlans} />
      </CardContent>
    </Card>
  )
}
