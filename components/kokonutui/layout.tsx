"use client";

import type { ReactNode } from "react";
import Sidebar from "./project-sidebar/sidebar";
import TopNav from "./top-nav";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerActions?: ReactNode;
}

export default function Layout({ children, headerTitle, headerActions }: LayoutProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isAgentChatPage = pathname.includes("/agent-chat");

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
      <div className="flex min-w-0 flex-1 flex-col" id="agent-detail-page-container">
        <header className="h-10 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav title={headerTitle} actions={headerActions} />
        </header>
        <main
          className={`min-h-0 min-w-0 flex-1 ${
            isAgentChatPage ? "overflow-hidden" : "overflow-auto"
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
