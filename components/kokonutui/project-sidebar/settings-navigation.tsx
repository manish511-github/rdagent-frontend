 "use client"

import { Settings } from "lucide-react"
import { NavItem } from "./nav-item"
import type { FC } from "react"

interface SettingsNavigationProps {
  isCollapsed: boolean;
  isMounted: boolean;
  pathname: string;
}

export const SettingsNavigation: FC<SettingsNavigationProps> = ({
  isCollapsed,
  isMounted,
  pathname,
}) => {
  const isActive = pathname.startsWith("/settings")

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
            href="/settings"
            icon={Settings}
            isActive={isActive}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Settings
          </NavItem>
        </div>
      </div>
    </>
  );
};
