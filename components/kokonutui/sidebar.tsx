"use client"

import type React from "react"

import {
  BarChart2,
  Calendar,
  Target,
  MessageSquare,
  TrendingUp,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Users2,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  Clock,
  Star,
  Briefcase,
  FileText,
  Folder,
  PenTool,
  ImageIcon,
  Bookmark,
  Archive,
  Users,
  Bot,
} from "lucide-react"

import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"

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

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

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

  function NavItem({
    href,
    icon: Icon,
    children,
    isActive = false,
  }: {
    href: string
    icon: any
    children: React.ReactNode
    isActive?: boolean
  }) {
    const content = (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-2 py-1.5 text-xs rounded-md transition-all duration-300 
          ${
            isActive
              ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1F1F23]"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
          } 
          ${isCollapsed ? "justify-center" : ""}`}
      >
        <Icon className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
        {!isCollapsed && <span className="ml-3 transition-opacity duration-300 opacity-100">{children}</span>}
      </Link>
    )

    if (isCollapsed && isMounted) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return content
  }

  // Render projects listing navigation items
  const renderProjectsNavigation = () => (
    <>
      <div className="stagger-1">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Projects
          </div>
        )}
        <div className="space-y-1">
          <NavItem href="/projects" icon={Home} isActive={pathname === "/projects"}>
            All Projects
          </NavItem>
          <NavItem href="/projects?filter=recent" icon={Clock}>
            Recent
          </NavItem>
          <NavItem href="/projects?filter=starred" icon={Star}>
            Starred
          </NavItem>
          <NavItem href="/projects?filter=archived" icon={Archive}>
            Archived
          </NavItem>
        </div>
      </div>

      <div className="stagger-2">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Categories
          </div>
        )}
        <div className="space-y-1">
          <NavItem href="/projects?category=marketing" icon={Target}>
            Marketing
          </NavItem>
          <NavItem href="/projects?category=design" icon={PenTool}>
            Design
          </NavItem>
          <NavItem href="/projects?category=development" icon={Briefcase}>
            Development
          </NavItem>
          <NavItem href="/projects?category=content" icon={FileText}>
            Content
          </NavItem>
        </div>
      </div>

      <div className="stagger-3">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Tools
          </div>
        )}
        <div className="space-y-1">
          <NavItem href="/projects/templates" icon={Folder}>
            Templates
          </NavItem>
          <NavItem href="/projects/assets" icon={ImageIcon}>
            Asset Library
          </NavItem>
          <NavItem href="/projects/tags" icon={Bookmark}>
            Tags & Labels
          </NavItem>
        </div>
      </div>
    </>
  )

  // Render specific project navigation items
  const renderProjectNavigation = () => (
    <>
      <div className="stagger-1">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Dashboard
          </div>
        )}
        <div className="space-y-1">
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}` : "#"}
            icon={Home}
            isActive={pathname === `/projects/${currentProject?.uuid}`}
          >
            Overview
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/analytics` : "#"}
            icon={BarChart2}
            isActive={pathname === `/projects/${currentProject?.uuid}/analytics`}
          >
            Analytics
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/calendar` : "#"}
            icon={Calendar}
            isActive={pathname === `/projects/${currentProject?.uuid}/calendar`}
          >
            Content Calendar
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/audience` : "#"}
            icon={Users2}
            isActive={pathname === `/projects/${currentProject?.uuid}/audience`}
          >
            Audience
          </NavItem>
        </div>
      </div>

      <div className="stagger-2">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            AI Tools
          </div>
        )}
        <div className="space-y-1">
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/content` : "#"}
            icon={MessageSquare}
            isActive={pathname === `/projects/${currentProject?.uuid}/content`}
          >
            Content Creator
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/leads` : "#"}
            icon={Target}
            isActive={pathname === `/projects/${currentProject?.uuid}/leads`}
          >
            Lead Generator
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/ads` : "#"}
            icon={TrendingUp}
            isActive={pathname === `/projects/${currentProject?.uuid}/ads`}
          >
            Ad Optimizer
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/agents` : "#"}
            icon={Bot}
            isActive={pathname === `/projects/${currentProject?.uuid}/agents`}
          >
            Agents
          </NavItem>
        </div>
      </div>

      <div className="stagger-3">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Channels
          </div>
        )}
        <div className="space-y-1">
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/twitter` : "#"}
            icon={Twitter}
            isActive={pathname === `/projects/${currentProject?.uuid}/twitter`}
          >
            Twitter/X
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/linkedin` : "#"}
            icon={Linkedin}
            isActive={pathname === `/projects/${currentProject?.uuid}/linkedin`}
          >
            LinkedIn
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/instagram` : "#"}
            icon={Instagram}
            isActive={pathname === `/projects/${currentProject?.uuid}/instagram`}
          >
            Instagram
          </NavItem>
          <NavItem
            href={currentProject ? `/projects/${currentProject.uuid}/email` : "#"}
            icon={Mail}
            isActive={pathname === `/projects/${currentProject?.uuid}/email`}
          >
            Email
          </NavItem>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
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

          <Link
            href="https://kokonutui.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
          >
            <div
              className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full px-0" : "gap-2"}`}
            >
              <Image
                src="https://kokonutui.com/logo.svg"
                alt="Acme"
                width={32}
                height={32}
                className="flex-shrink-0 hidden dark:block"
              />
              <Image
                src="https://kokonutui.com/logo-black.svg"
                alt="Acme"
                width={32}
                height={32}
                className="flex-shrink-0 block dark:hidden"
              />
              {!isCollapsed && (
                <span className="text-sm font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                  KokonutUI
                </span>
              )}
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-3 px-3">
            <div className="space-y-6">
              {/* Project Name Section */}
              {currentProject && (
                <div className="mb-2">
                  {!isCollapsed && (
                    <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Current Project
                    </div>
                  )}
                  <div className={`${isCollapsed ? "flex justify-center" : ""}`}>
                    {isCollapsed ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="p-1.5">
                              <FolderKanban className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {currentProject.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Link
                        href={`/projects/${currentProject.uuid}`}
                        className="px-2 py-1.5 flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
                      >
                        <FolderKanban className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        <span className="truncate">{currentProject.name}</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Render different navigation based on the current route */}
              {isSpecificProject ? renderProjectNavigation() : renderProjectsNavigation()}
            </div>
          </div>

          <div
            className={`px-3 py-3 border-t border-gray-200 dark:border-[#1F1F23] ${isCollapsed ? "flex flex-col items-center" : ""}`}
          >
            <div className="space-y-1">
              <NavItem href="#" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle}>
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
