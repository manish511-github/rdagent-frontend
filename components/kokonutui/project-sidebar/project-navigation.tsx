import {
  Home,
  BarChart2,
  Calendar,
  Users2,
  MessageSquare,
  Target,
  TrendingUp,
  BrainCircuit,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
} from "lucide-react";
import { NavItem } from "./nav-item";
import type { FC } from "react";

interface ProjectNavigationProps {
  currentProject: { uuid: string; name: string } | null;
  isCollapsed: boolean;
  isMounted: boolean;
  pathname: string;
}

export const ProjectNavigation: FC<ProjectNavigationProps> = ({
  currentProject,
  isCollapsed,
  isMounted,
  pathname,
}) => (
  <>
    <div className="stagger-1">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Dashboard
        </div>
      )}
      <div className="space-y-1">
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}` : "#"}
          icon={Home}
          isActive={pathname === `/projects/${currentProject?.uuid}`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Overview
        </NavItem>
        {/* <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/analytics` : "#"}
          icon={BarChart2}
          isActive={pathname === `/projects/${currentProject?.uuid}/analytics`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Analytics
        </NavItem>
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/calendar` : "#"}
          icon={Calendar}
          isActive={pathname === `/projects/${currentProject?.uuid}/calendar`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Content Calendar
        </NavItem>
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/audience` : "#"}
          icon={Users2}
          isActive={pathname === `/projects/${currentProject?.uuid}/audience`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Audience
        </NavItem> */}
      </div>
    </div>

    <div className="stagger-2">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          AI Tools
        </div>
      )}
      <div className="space-y-1">
        {/* Optional future items: Content Creator, Leads, Ads */}
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/competitors` : "#"}
          icon={Users2}
          isActive={pathname === `/projects/${currentProject?.uuid}/competitors`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Competitors
        </NavItem>
        <NavItem
          href={
            currentProject ? `/projects/${currentProject.uuid}/agents` : "#"
          }
          icon={BrainCircuit}
          isActive={pathname === `/projects/${currentProject?.uuid}/agents`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Agents
        </NavItem>
      </div>
    </div>

    {/* <div className="stagger-3">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-fade-in">
          Channels
        </div>
      )}
      <div className="space-y-1">
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/twitter` : "#"}
          icon={Twitter}
          isActive={pathname === `/projects/${currentProject?.uuid}/twitter`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Twitter/X
        </NavItem>
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/linkedin` : "#"}
          icon={Linkedin}
          isActive={pathname === `/projects/${currentProject?.uuid}/linkedin`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          LinkedIn
        </NavItem>
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/instagram` : "#"}
          icon={Instagram}
          isActive={pathname === `/projects/${currentProject?.uuid}/instagram`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Instagram
        </NavItem>
        <NavItem
          href={currentProject ? `/projects/${currentProject.uuid}/email` : "#"}
          icon={Mail}
          isActive={pathname === `/projects/${currentProject?.uuid}/email`}
          isCollapsed={isCollapsed}
          isMounted={isMounted}
        >
          Email
        </NavItem>
      </div>
    </div> */}
  </>
);
