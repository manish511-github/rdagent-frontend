"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import TopNav from "./top-nav"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Cookies from 'js-cookie'
import { refreshAccessToken } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode
}

interface Project {
  uuid: string
  name: string
}

export default function Layout({ children }: LayoutProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Extract project ID from path if we're on a project page
  const projectIdMatch = pathname.match(/\/projects\/([^/]+)/)
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null

  // Fetch project data when projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      if (!currentProjectId) {
        setCurrentProject(null)
        setLoading(false)
        return
      }

      try {
        let token = Cookies.get("access_token")
        let response = await fetch(`http://localhost:8000/projects/${currentProjectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // If unauthorized, try to refresh the token and retry once
        if (response.status === 401) {
          token = await refreshAccessToken();
          if (token) {
            response = await fetch(`http://localhost:8000/projects/${currentProjectId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          }
        }

        if (!response.ok) {
          throw new Error('Failed to fetch project details')
        }

        const data = await response.json()
        setCurrentProject({
          uuid: data.uuid,
          name: data.title
        })
      } catch (err) {
        console.error('Error fetching project:', err)
        setCurrentProject(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [currentProjectId])

  // Check if we're on an individual agent page which needs fixed height
  const isAgentPage = pathname.includes("/agents/") && pathname.split("/").length > 4

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`flex h-screen ${mounted && resolvedTheme === "dark" ? "dark" : ""}`}>
      <Sidebar currentProject={currentProject} />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-10 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav currentProject={currentProject} />
        </header>
        <main className={`flex-1 ${isAgentPage ? "overflow-hidden" : "overflow-auto"} p-6 bg-white dark:bg-[#09090B]`}>
          {mounted ? children : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">Loading...</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
