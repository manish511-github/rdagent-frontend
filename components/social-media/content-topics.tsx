"use client"

import { Badge } from "@/components/ui/badge"

interface ContentTopicsProps {
  topics: string[]
  title?: string
}

export function ContentTopics({ topics, title = "Content Topics" }: ContentTopicsProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {topics.map((topic) => (
          <Badge key={topic} variant="secondary" className="text-xs">
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  )
}
