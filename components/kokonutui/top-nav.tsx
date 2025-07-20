"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Bell, ChevronRight } from "lucide-react"
import Profile01 from "./profile-01"
import Link from "next/link"
import ThemeToggle from "../theme-toggle"
import { usePathname } from "next/navigation"

interface Project {
  uuid: string
  name: string
}

interface TopNavProps {
  currentProject: Project | null
}

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function TopNav({ currentProject }: TopNavProps) {
  const pathname = usePathname()
  const isProjectsPage = pathname === "/projects"
  const isSettingsPage = pathname.startsWith("/settings")

  // Define breadcrumbs based on current page
  let breadcrumbs: BreadcrumbItem[] = []

  if (isSettingsPage) {
    breadcrumbs = [{ label: "Settings" }]
  } else if (currentProject) {
    breadcrumbs = [
      { label: "Projects", href: "/projects" },
      { label: currentProject.name, href: `/projects/${currentProject.uuid}` },
    ]
  } else {
    breadcrumbs = [{ label: "Projects", href: "/projects" }]
  }

  return (
    <nav className="px-2 sm:px-4 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-xs hidden sm:flex items-center space-x-1 truncate max-w-[250px]">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mx-1" />}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button
          type="button"
          className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-300" />
        </button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Image
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
              alt="User avatar"
              width={20}
              height={20}
              className="rounded-full ring-1 ring-gray-200 dark:ring-[#2B2B30] sm:w-6 sm:h-6 cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
