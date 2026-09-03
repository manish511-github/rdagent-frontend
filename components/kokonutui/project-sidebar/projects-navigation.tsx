import { CalendarClock, Search } from "lucide-react";
import { NavItem } from "./nav-item";
import type { FC } from "react";

interface ProjectsNavigationProps {
  isCollapsed: boolean;
  isMounted: boolean;
  pathname: string;
}

export const ProjectsNavigation: FC<ProjectsNavigationProps> = ({ isCollapsed, isMounted, pathname }) => {
  const isAgentChatActive = pathname.startsWith("/agent-chat");
  const isAutomationsActive = pathname.startsWith("/automations");

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
            href="/agent-chat"
            icon={Search}
            isActive={isAgentChatActive}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Agent Chat
          </NavItem>
          <NavItem
            href="/automations"
            icon={CalendarClock}
            isActive={isAutomationsActive}
            isCollapsed={isCollapsed}
            isMounted={isMounted}
          >
            Automations
          </NavItem>
        </div>
      </div>
    </>
  );
};
