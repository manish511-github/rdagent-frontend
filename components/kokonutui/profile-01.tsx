import type React from "react";
import {
  LogOut,
  MoveUpRight,
  Settings,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  selectCreditsLimitUsed,
  selectCreditsLimitTotal,
} from "@/store/slices/userSlice";
import { getApiUrl } from "../../lib/config";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

const defaultProfile = {
  name: "Alex Morgan",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  subscription: "Pro Plan",
};

export default function Profile01() {
  // Get user info from Redux
  const userInfo = useSelector((state: RootState) => state.user.info);
  const name = userInfo?.username || defaultProfile.name;
  // UserInfo does not have an avatar field, so always use default avatar
  const avatar = defaultProfile.avatar;

  // Get credits information
  const creditsUsed = useSelector(selectCreditsLimitUsed);
  const creditsTotal = useSelector(selectCreditsLimitTotal);
  const creditsLeft = creditsTotal - creditsUsed;

  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: userInfo?.plan?.name || "No plans",
      href: "/settings?section=billing",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Help & Support",
      href: "/contact",
      icon: <HelpCircle className="w-4 h-4" />,
      external: true,
    },
  ];

  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch(getApiUrl("auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // Ignore errors, just clear tokens
    }
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
    router.push("/login");
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0C]">
        <div className="relative px-3 pt-3 pb-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <Avatar className="w-15 h-15 ring-3 ring-white dark:ring-zinc-900">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {userInfo?.email}
              </p>
              {(userInfo?.plan?.name || creditsTotal > 0) && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2">
                  {userInfo?.plan?.name}
                  {userInfo?.plan?.name && creditsTotal >= 0 && " • "}
                  {creditsTotal >= 0 && `${creditsLeft} credits left`}
                </p>
              )}
            </div>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-5" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-1.5 
                                    hover:bg-zinc-50 dark:hover:bg-zinc-800/70 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center">
                  {item.value && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">
                      {item.value}
                    </span>
                  )}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              className="w-full flex items-center justify-between p-1.5 
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/70 
                                rounded-lg transition-colors duration-200"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Logout
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
