import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, DollarSign } from "lucide-react"

interface PricingPlan {
  name: string
  tier: number
  description: string
  pricing: {
    monthly: { amount: number | null; unit: string; currency: string }
    annual: { amount: number | null; unit: string; currency: string; effective_discount?: string }
    custom_pricing: boolean
  }
  feature_matrix: {
    core: string[]
  }
  trial: {
    duration_days: number
  }
}

interface PricingPlansProps {
  plans: PricingPlan[]
}

export function PricingPlans({ plans }: PricingPlansProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {plans.map((plan) => (
        <Card key={plan.name} className="rounded-none border border-gray-200 dark:border-gray-800 p-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                <Badge variant="outline" className="text-xs">
                  Tier {plan.tier}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{plan.description}</p>
            </div>

            <div className="space-y-2">
              {plan.pricing.custom_pricing ? (
                <div className="text-center py-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Custom Pricing</span>
                  <p className="text-xs text-gray-500">Contact for quote</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${plan.pricing.monthly.amount}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">{plan.pricing.monthly.unit}</span>
                  </div>
                  {plan.pricing.annual.effective_discount && (
                    <div className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {plan.pricing.annual.effective_discount} off annually
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Key Features</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {plan.feature_matrix.core.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Free Trial</span>
                <span className="text-gray-700 dark:text-gray-300">{plan.trial.duration_days} days</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
