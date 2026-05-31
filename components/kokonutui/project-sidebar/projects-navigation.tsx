import { Brain, Users, PenTool, BarChart3 } from "lucide-react";
import { NavItem } from "./nav-item";
import type { FC } from "react";

interface ProjectsNavigationProps {
  isCollapsed: boolean;
  isMounted: boolean;
  pathname: string;
}

export const ProjectsNavigation: FC<ProjectsNavigationProps> = ({ isCollapsed, isMounted, pathname }) => {
  const isPostGenActive = pathname.startsWith("/post-generator");
  const isAgentsActive = pathname.startsWith("/agents");

  return (
    <>
      <div className="stagger-1">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
            Navigation
          </div>
        )}
        <div className="space-y-2">
          <NavItem
            href="/agents"
            icon={Brain}
            isActive={isAgentsActive}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Agents
          </NavItem>
          <NavItem
            href="/competitors"
            icon={Users}
            isActive={pathname === "/competitors"}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Competitors
          </NavItem>
          <NavItem
            href="/post-generator"
            icon={PenTool}
            isActive={isPostGenActive}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Post Generator
          </NavItem>
          <NavItem
            href="/company-analysis"
            icon={BarChart3}
            isActive={pathname === "/company-analysis"}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Company Analysis
          </NavItem>
        </div>
      </div>
    </>
  );
};