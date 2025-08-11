import { Card } from "@/components/ui/card"
import { Flag } from "lucide-react"

interface TimelineViewProps {
  milestones: string[]
}

export function TimelineView({ milestones }: TimelineViewProps) {
  return (
    <Card className="rounded-none border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Key Milestones</h3>
      </div>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
              {index < milestones.length - 1 && <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-2" />}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{milestone}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
