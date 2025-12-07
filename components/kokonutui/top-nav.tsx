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
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Project {
  uuid: string;
  name: string;
}

interface TopNavProps {
  currentProject: Project | null;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav({ currentProject }: TopNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userInfo = useSelector((state: RootState) => state.user.info);
  const isProjectsPage = pathname === "/projects";
  const isSettingsPage = pathname.startsWith("/settings");
  const isCompanyAnalysisPage = pathname.includes("/company-analysis");
  const isCompetitorsPage = pathname.includes("/competitors");
  const companySlug = searchParams.get("company") || "";
  const companyDisplay = companySlug
    ? decodeURIComponent(companySlug)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Selected Company";

  // Define breadcrumbs based on current page
  let breadcrumbs: BreadcrumbItem[] = [];

  if (isSettingsPage) {
    breadcrumbs = [{ label: "Settings" }];
  } else {
    // Always start with Projects
    breadcrumbs.push({ label: "Projects", href: "/projects" });

    if (currentProject) {
      // Project name
      breadcrumbs.push({
        label: currentProject.name,
        href: `/projects/${currentProject.uuid}`,
      });

      // Competitors and Company chain
      if (isCompetitorsPage || isCompanyAnalysisPage) {
        breadcrumbs.push({
          label: "Competitors",
          href: `/projects/${currentProject.uuid}/competitors`,
        });
        if (isCompanyAnalysisPage) {
          breadcrumbs.push({ label: companyDisplay });
        }
      }
    }
  }

  return (
    <nav className="px-2 sm:px-4 flex items-center justify-between bg-white dark:bg-black border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-xs flex items-center space-x-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap pr-2">
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
              <span className="text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="w-5 h-5 sm:w-6 sm:h-6 ring-1 ring-gray-200 dark:ring-[#2B2B30] cursor-pointer">
              <AvatarImage src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" alt="User avatar" />
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
