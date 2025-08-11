"use client";

import type { ReactNode } from "react";
import Sidebar from "./project-sidebar/sidebar";
import TopNav from "./top-nav";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import {
  fetchCurrentProject,
  clearCurrentProject,
  selectCurrentProject,
  selectCurrentProjectLoading,
} from "@/store/slices/currentProjectSlice";

interface LayoutProps {
  children: ReactNode;
}

interface Project {
  uuid: string;
  name: string;
}

export default function Layout({ children }: LayoutProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  // Get current project data from Redux store
  const currentProjectData = useSelector((state: RootState) =>
    selectCurrentProject(state)
  );
  const loading = useSelector((state: RootState) =>
    selectCurrentProjectLoading(state)
  );

  // Extract project ID from path if we're on a project page
  const projectIdMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null;

  // Create a simplified project object for backward compatibility with components
  const currentProject: Project | null = currentProjectData
    ? {
        uuid: currentProjectData.uuid,
        name: currentProjectData.title,
      }
    : null;

  // Fetch project data when projectId changes
  useEffect(() => {
    if (!currentProjectId) {
      dispatch(clearCurrentProject());
      return;
    }

    // Only fetch if we don't have the project data or if it's a different project
    if (!currentProjectData || currentProjectData.uuid !== currentProjectId) {
      dispatch(fetchCurrentProject(currentProjectId));
    }
  }, [currentProjectId, dispatch, currentProjectData]);

  // Check if we're on an individual agent page which needs fixed height
  const isAgentPage =
    pathname.includes("/agents/") && pathname.split("/").length > 4;
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
      <Sidebar currentProject={currentProject} />
      <div className="flex flex-1 flex-col" id="agent-detail-page-container">
        <header className="h-10 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav currentProject={currentProject} />
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
