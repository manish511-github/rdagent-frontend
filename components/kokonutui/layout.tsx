"use client";

import type { ReactNode } from "react";
import Sidebar from "./project-sidebar/sidebar";
import TopNav from "./top-nav";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Check if we're on an individual agent page which needs fixed height
  // New pattern: /agents/[agentId] (length 3, e.g. ["", "agents", "some-uuid"])
  const isAgentPage =
    pathname.startsWith("/agents/") && pathname.split("/").length >= 3;
  // Company analysis page should behave like fixed-height app view
  const isCompanyAnalysisPage = pathname.includes("/company-analysis");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`flex h-screen ${
        mounted && resolvedTheme === "dark" ? "dark" : ""
      }`}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col" id="agent-detail-page-container">
        <header className="h-10 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav />
        </header>
        <main
          className={`flex-1 ${
            isAgentPage || isCompanyAnalysisPage ? "overflow-hidden" : "overflow-auto"
          } bg-white dark:bg-black`}
        >
          {mounted ? (
            children
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">Loading...</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
