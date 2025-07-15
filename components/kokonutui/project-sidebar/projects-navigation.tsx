import { Home, Clock, Star, Archive, Target, PenTool, Briefcase, FileText, ImageIcon, Bookmark } from "lucide-react";
import { NavItem } from "./nav-item";
import type { FC } from "react";

interface ProjectsNavigationProps {
  isCollapsed: boolean;
  isMounted: boolean;
  pathname: string;
}

export const ProjectsNavigation: FC<ProjectsNavigationProps> = ({ isCollapsed, isMounted, pathname }) => (
  <>
    <div className="stagger-1">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Projects
        </div>
      )}
      <div className="space-y-1">
        <NavItem href="/projects" icon={Home} isActive={pathname === "/projects"} isCollapsed={isCollapsed} isMounted={isMounted}>
          All Projects
        </NavItem>
        <NavItem href="/projects?filter=recent" icon={Clock} isCollapsed={isCollapsed} isMounted={isMounted}>
          Recent
        </NavItem>
        <NavItem href="/projects?filter=starred" icon={Star} isCollapsed={isCollapsed} isMounted={isMounted}>
          Starred
        </NavItem>
        <NavItem href="/projects?filter=archived" icon={Archive} isCollapsed={isCollapsed} isMounted={isMounted}>
          Archived
        </NavItem>
      </div>
    </div>

    <div className="stagger-2">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Categories
        </div>
      )}
      <div className="space-y-1">
        <NavItem href="/projects?category=marketing" icon={Target} isCollapsed={isCollapsed} isMounted={isMounted}>
          Marketing
        </NavItem>
        <NavItem href="/projects?category=design" icon={PenTool} isCollapsed={isCollapsed} isMounted={isMounted}>
          Design
        </NavItem>
        <NavItem href="/projects?category=development" icon={Briefcase} isCollapsed={isCollapsed} isMounted={isMounted}>
          Development
        </NavItem>
        <NavItem href="/projects?category=content" icon={FileText} isCollapsed={isCollapsed} isMounted={isMounted}>
          Content
        </NavItem>
      </div>
    </div>

    <div className="stagger-3">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Tools
        </div>
      )}
      <div className="space-y-1">
        <NavItem href="/projects/templates" icon={FileText} isCollapsed={isCollapsed} isMounted={isMounted}>
          Templates
        </NavItem>
        <NavItem href="/projects/assets" icon={ImageIcon} isCollapsed={isCollapsed} isMounted={isMounted}>
          Asset Library
        </NavItem>
        <NavItem href="/projects/tags" icon={Bookmark} isCollapsed={isCollapsed} isMounted={isMounted}>
          Tags & Labels
        </NavItem>
      </div>
    </div>
  </>
); 