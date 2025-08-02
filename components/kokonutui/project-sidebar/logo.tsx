import Link from "next/link";
import Image from "next/image";
import type { FC } from "react";
import { useTheme } from "next-themes";

export const Logo: FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const { theme } = useTheme();
  
  return (
    <Link
      href="/"
      className="h-10 px-4 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
    >
      <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full px-0" : "gap-2"}`}>
        <Image
          src={theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"}
          alt="zooptics"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
        {!isCollapsed && (
          <span className="text-sm font-semibold font-montserrat hover:cursor-pointer text-gray-900 dark:text-white">
            zooptics
          </span>
        )}
      </div>
    </Link>
  );
}; 