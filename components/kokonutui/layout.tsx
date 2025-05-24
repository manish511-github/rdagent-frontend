"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import TopNav from "./top-nav"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

// Sample project data - in a real app, this would come from an API or context
const projectsData = [
  { id: "1", name: "Marketing Campaign" },
  { id: "2", name: "Website Redesign" },
  { id: "3", name: "Product Launch" },
  { id: "4", name: "Social Media Strategy" },
  { id: "5", name: "Brand Guidelines" },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Extract project ID from path if we're on a project page
  const projectIdMatch = pathname.match(/\/projects\/([^/]+)/)
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null

  // Find the current project from our sample data
  const currentProject = currentProjectId ? projectsData.find((p) => p.id === currentProjectId) : null

  // Check if we're on an individual agent page which needs fixed height
  const isAgentPage = pathname.includes("/agents/") && pathname.split("/").length > 4

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar currentProject={currentProject} />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-10 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav currentProject={currentProject} />
        </header>
        <main className={`flex-1 ${isAgentPage ? "overflow-hidden" : "overflow-auto"} p-6 bg-white dark:bg-[#09090B]`}>
          {children}
        </main>
      </div>
    </div>
  )
}
