import { Card, CardContent } from "@/components/ui/card"
import { CommentsIntelligence } from "./comments-intelligence"

interface CommentsSectionProps {
  data: {
    themes: { name: string; quote: string }[]
    faqs: { q: string; a: string }[]
    notes: string
  }
}

export function CommentsSection({ data }: CommentsSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <CommentsIntelligence data={data} />
      </CardContent>
    </Card>
  )
}
