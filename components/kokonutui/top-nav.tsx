"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight } from "lucide-react";
import Profile01 from "./profile-01";
import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav({
  title,
  actions,
}: {
  title?: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const userInfo = useSelector((state: RootState) => state.user.info);
  
  const isSettingsPage = pathname.startsWith("/settings");
  const isAgentChatPage =
    pathname.startsWith("/agent-chat");
  const isAutomationsPage = pathname.startsWith("/automations");

  // Define breadcrumbs based on current page
  let breadcrumbs: BreadcrumbItem[] = [];

  if (isSettingsPage) {
    breadcrumbs = [{ label: "Settings" }];
  } else if (isAgentChatPage) {
    breadcrumbs.push({ label: title || "Agent Chat" });
  } else if (isAutomationsPage) {
    breadcrumbs.push({ label: "Automations" });
  } else {
    breadcrumbs.push({ label: "Dashboard" });
  }

  return (
    <nav className="px-2 sm:px-4 flex items-center justify-between bg-white dark:bg-black border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-xs flex items-center space-x-1 flex-1 min-w-0 whitespace-nowrap pr-2">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mx-1" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="block max-w-[min(52vw,36rem)] truncate text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {actions}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="w-5 h-5 sm:w-6 sm:h-6 ring-1 ring-gray-200 dark:ring-[#2B2B30] cursor-pointer">
              <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
