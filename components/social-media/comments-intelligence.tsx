"use client"

import { Card } from "@/components/ui/card"
import { MessageCircle, HelpCircle } from "lucide-react"

interface CommentsIntelligenceProps {
  data: {
    themes: { name: string; quote: string }[]
    faqs: { q: string; a: string }[]
    notes: string
  }
}

export function CommentsIntelligence({ data }: CommentsIntelligenceProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-none">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-cyan-50 dark:bg-cyan-900/20 rounded-none">
          <MessageCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Comments Intelligence</h4>
      </div>

      {data.themes.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">Common Themes</h5>
          <div className="space-y-2">
            {data.themes.slice(0, 2).map((theme, index) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-none">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{theme.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">"{theme.quote}"</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.faqs.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <HelpCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">Frequently Asked Questions</h5>
          </div>
          <div className="space-y-2">
            {data.faqs.slice(0, 2).map((faq, index) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-none">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">Q: {faq.q}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">A: {faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
