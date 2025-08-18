import type React from "react"
import { Card } from "@/components/ui/card"

interface OverviewCardProps {
  title: string
  icon: React.ReactElement
  children: React.ReactNode
  className?: string
}

export function OverviewCard({ title, icon, children, className = "" }: OverviewCardProps) {
  return (
    <Card
      className={`rounded-none border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </Card>
  )
}
