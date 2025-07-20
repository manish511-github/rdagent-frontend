import Link from "next/link";
import Image from "next/image";
import type { FC } from "react";

export const Logo: FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
  <Link
    href="https://kokonutui.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="h-10 px-4 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
  >
    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full px-0" : "gap-2"}`}>
      <Image
        src="https://kokonutui.com/logo.svg"
        alt="Acme"
        width={32}
        height={32}
        className="flex-shrink-0 hidden dark:block"
      />
      <Image
        src="https://kokonutui.com/logo-black.svg"
        alt="Acme"
        width={32}
        height={32}
        className="flex-shrink-0 block dark:hidden"
      />
      {!isCollapsed && (
        <span className="text-sm font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
          KokonutUI
        </span>
      )}
    </div>
  </Link>
);
