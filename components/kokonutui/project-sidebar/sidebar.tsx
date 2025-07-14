"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Settings, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Logo } from "./logo"
import { MobileToggle } from "./mobile-toggle"
import { CurrentProject } from "./current-project"
import { ProjectsNavigation } from "./projects-navigation"
import { ProjectNavigation } from "./project-navigation"
import { NavItem } from "./nav-item"

// Project type definition
interface Project {
  uuid: string
  name: string
}

interface SidebarProps {
  currentProject: Project | null
}

// Add custom keyframe animation
const fadeInAnimation = {
  from: { opacity: 0, transform: "translateX(-10px)" },
  to: { opacity: 1, transform: "translateX(0)" },
}

const fadeOutAnimation = {
  from: { opacity: 1, transform: "translateX(0)" },
  to: { opacity: 0, transform: "translateX(-10px)" },
}

export default function Sidebar({ currentProject }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  // Determine if we're on the projects listing page or a specific project page
  const isProjectsPage = pathname === "/projects"
  const isSpecificProject = pathname.startsWith("/projects/") && pathname !== "/projects"

  useEffect(() => {
    setIsMounted(true)
    // Check if there's a saved preference in localStorage
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === "true")
    }
  }, [])

  useEffect(() => {
    // This effect handles animation timing when the sidebar state changes
    if (isMounted) {
      const sidebarElement = document.querySelector("nav")
      if (sidebarElement) {
        sidebarElement.classList.add("animating")
        const timer = setTimeout(() => {
          sidebarElement.classList.remove("animating")
        }, 300) // Match this to your transition duration
        return () => clearTimeout(timer)
      }
    }
  }, [isCollapsed, isMounted])

  function toggleSidebar() {
    const newState = !isCollapsed

    // Trigger animation for the chevron icon
    const chevronIcon = document.querySelector(".chevron-icon")
    if (chevronIcon) {
      chevronIcon.classList.add("animate-pulse-once")
      setTimeout(() => {
        chevronIcon.classList.remove("animate-pulse-once")
      }, 300)
    }

    setIsCollapsed(newState)
    // Save preference to localStorage
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  return (
    <>
      <MobileToggle isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <nav
        className={`
        fixed inset-y-0 left-0 z-[70] bg-white dark:bg-[#09090B] transform 
        transition-[width,transform] duration-300 ease-out
        lg:translate-x-0 lg:static border-r border-gray-200 dark:border-[#1F1F23]
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-16" : "w-52"}
    `}
      >
        <div className="h-full flex flex-col relative">
          {/* Logo */}
          <Logo isCollapsed={isCollapsed} />

          {/* Sidebar collapse/expand button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-12 bg-white dark:bg-[#09090B] border border-gray-200 dark:border-[#1F1F23] rounded-full p-1 shadow-md hidden lg:flex hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-600 dark:text-gray-300 transition-transform duration-300 chevron-icon" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-600 dark:text-gray-300 transition-transform duration-300 chevron-icon" />
            )}
          </button>

          <div className="flex-1 overflow-y-auto py-3 px-3">
            <div className="space-y-6">
              {/* Current Project Section */}
              <CurrentProject currentProject={currentProject} isCollapsed={isCollapsed} />

              {/* Navigation Sections */}
              {isSpecificProject ? (
                <ProjectNavigation
                  currentProject={currentProject}
                  isCollapsed={isCollapsed}
                  isMounted={isMounted}
                  pathname={pathname}
                />
              ) : (
                <ProjectsNavigation
                  isCollapsed={isCollapsed}
                  isMounted={isMounted}
                  pathname={pathname}
                />
              )}
            </div>
          </div>

          {/* Settings/Help at the bottom */}
          <div
            className={`px-3 py-3 border-t border-gray-200 dark:border-[#1F1F23] ${isCollapsed ? "flex flex-col items-center" : ""}`}
          >
            <div className="space-y-1">
              <NavItem href="#" icon={Settings} isCollapsed={isCollapsed} isMounted={isMounted}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle} isCollapsed={isCollapsed} isMounted={isMounted}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
