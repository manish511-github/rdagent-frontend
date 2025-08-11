import type React from "react"
import { forwardRef } from "react"

interface ContentSectionProps {
  id: string
  title: string
  content: React.ReactElement
  icon: React.ReactNode
}

export const ContentSection = forwardRef<HTMLElement, ContentSectionProps>(({ id, title, content, icon }, ref) => {
  return (
    <section key={id} id={id} ref={ref} className="scroll-mt-6">
      <div className="border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-4 rounded-none">
        <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-gray-900 dark:text-gray-100">
          {icon}
          {title}
        </h3>
        <div className="text-sm">{content}</div>
      </div>
    </section>
  )
})

ContentSection.displayName = "ContentSection"
