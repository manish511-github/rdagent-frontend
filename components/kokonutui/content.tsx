import { Target, MessageSquare, TrendingUp } from "lucide-react"
import ContentCreationWidget from "./content-creation-widget"
import CampaignPerformanceWidget from "./campaign-performance-widget"
import LeadGenerationWidget from "./lead-generation-widget"

export default function () {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#09090B] rounded-xl p-4 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-left flex items-center gap-2 ">
            <MessageSquare className="w-3 h-3 text-zinc-900 dark:text-zinc-50" />
            AI Content Creation
          </h2>
          <div className="flex-1">
            <ContentCreationWidget className="h-full" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#09090B] rounded-xl p-4 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-left flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-zinc-900 dark:text-zinc-50" />
            Campaign Performance
          </h2>
          <div className="flex-1">
            <CampaignPerformanceWidget className="h-full" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#09090B] rounded-xl p-4 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-left flex items-center gap-2">
          <Target className="w-3 h-3 text-zinc-900 dark:text-zinc-50" />
          Lead Generation
        </h2>
        <LeadGenerationWidget />
      </div>
    </div>
  )
}
