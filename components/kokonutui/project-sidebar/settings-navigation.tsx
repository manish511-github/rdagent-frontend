"use client"

import { User, CreditCard, Shield } from "lucide-react"
import { NavItem } from "./nav-item"

interface SettingsNavigationProps {
  isCollapsed: boolean
  isMounted: boolean
  pathname: string
}

export function SettingsNavigation({ isCollapsed, isMounted, pathname }: SettingsNavigationProps) {
  return (
    <div className="space-y-1">
      <div className={`${isCollapsed ? "hidden" : "block"} px-2 py-1`}>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Settings</h3>
      </div>

      <NavItem
        href="/settings"
        icon={User}
        isCollapsed={isCollapsed}
        isMounted={isMounted}
        isActive={pathname === "/settings"}
      >
        Personal
      </NavItem>

      <NavItem
        href="/settings/account"
        icon={Shield}
        isCollapsed={isCollapsed}
        isMounted={isMounted}
        isActive={pathname === "/settings/account"}
      >
        Account
      </NavItem>

      <NavItem
        href="/settings/billing"
        icon={CreditCard}
        isCollapsed={isCollapsed}
        isMounted={isMounted}
        isActive={pathname === "/settings/billing"}
      >
        Billing
      </NavItem>
    </div>
  )
}
