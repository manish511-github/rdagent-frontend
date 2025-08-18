"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface ContentNavigationProps {
  sections: Array<{ id: string; title: string; content: React.ReactElement }>
  activeSection: string
  onSectionClick: (e: React.MouseEvent, id: string) => void
  sectionIcons: Record<string, React.ReactNode>
}

export function ContentNavigation({ sections, activeSection, onSectionClick, sectionIcons }: ContentNavigationProps) {
  return (
    <div className="border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent rounded-none">
      <div className="border-b border-gray-200 dark:border-[#1A1A1A] px-4 py-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Contents</h3>
      </div>
      <nav className="p-2">
        <div className="space-y-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => onSectionClick(e, s.id)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-[#101010] rounded-none",
                activeSection === s.id
                  ? "bg-gray-100 dark:bg-[#0F0F0F] font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {sectionIcons[s.id]}
              {s.title}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
