import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PropsWithChildren } from "react";

interface NavItemProps extends PropsWithChildren<{}> {
  href: string;
  icon: React.ElementType;
  isActive?: boolean;
  isCollapsed?: boolean;
  isMounted?: boolean;
}

export function NavItem({ href, icon: Icon, children, isActive = false, isCollapsed, isMounted }: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={`flex items-center px-2 py-1.5 text-xs rounded-md transition-all duration-300 
        ${
          isActive
            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1F1F23]"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        } 
        ${isCollapsed ? "justify-center" : ""}`}
    >
      <Icon className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
      {!isCollapsed && <span className="ml-3 transition-opacity duration-300 opacity-100">{children}</span>}
    </Link>
  );

  if (isCollapsed && isMounted) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
