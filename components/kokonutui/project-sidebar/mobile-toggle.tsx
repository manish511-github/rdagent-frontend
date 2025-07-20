import { Menu } from "lucide-react";
import type { FC, Dispatch, SetStateAction } from "react";

interface MobileToggleProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const MobileToggle: FC<MobileToggleProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <button
    type="button"
    className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  >
    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
  </button>
);
