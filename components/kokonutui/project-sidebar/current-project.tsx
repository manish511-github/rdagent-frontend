import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FC } from "react";

interface CurrentProjectProps {
  currentProject: { uuid: string; name: string } | null;
  isCollapsed: boolean;
}

export const CurrentProject: FC<CurrentProjectProps> = ({ currentProject, isCollapsed }) => {
  if (!currentProject) return null;

  return (
    <div className="mb-2">
      {!isCollapsed && (
        <div className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Current Project
        </div>
      )}
      <div className={isCollapsed ? "flex justify-center" : ""}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="p-1.5">
                  <FolderKanban className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {currentProject.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link
            href={`/projects/${currentProject.uuid}`}
            className="px-2 py-1.5 flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
          >
            <FolderKanban className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="truncate">{currentProject.name}</span>
          </Link>
        )}
      </div>
    </div>
  );
};
