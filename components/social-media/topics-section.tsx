import { Card, CardContent } from "@/components/ui/card"
import { ContentTopics } from "./content-topics"

interface TopicsSectionProps {
  topics: string[]
  title?: string
}

export function TopicsSection({ topics, title }: TopicsSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <ContentTopics topics={topics} title={title} />
      </CardContent>
    </Card>
  )
}
