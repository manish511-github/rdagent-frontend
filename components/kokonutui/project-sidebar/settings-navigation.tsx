"use client"

import { User, Settings, CreditCard } from "lucide-react"
import { NavItem } from "./nav-item"
import type { FC } from "react"
import { useSearchParams } from "next/navigation" // Import useSearchParams

interface SettingsNavigationProps {
  isCollapsed: boolean
  isMounted: boolean
  pathname: string
}

export const SettingsNavigation: FC<SettingsNavigationProps> = ({ isCollapsed, isMounted, pathname }) => {
  const searchParams = useSearchParams() // Use the hook
  const currentSection = searchParams?.get("section") || "personal"

  return (
    <>
      <div className="stagger-1">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Settings
          </div>
        )}
        <div className="space-y-2">
          <NavItem
            href="/settings?section=personal"
            icon={User}
            isActive={currentSection === "personal"}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Personal
          </NavItem>
          <NavItem
            href="/settings?section=account"
            icon={Settings}
            isActive={currentSection === "account"}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Account
          </NavItem>
          <NavItem
            href="/settings?section=billing"
            icon={CreditCard}
            isActive={currentSection === "billing"}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Billing
          </NavItem>
        </div>
      </div>
    </>
  )
}
