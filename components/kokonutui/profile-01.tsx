import type React from "react"
import { LogOut, MoveUpRight, Settings, CreditCard, HelpCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

interface Profile01Props {
  name: string
  role: string
  avatar: string
  subscription?: string
}

const defaultProfile = {
  name: "Alex Morgan",
  role: "Marketing Director",
  avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  subscription: "Pro Plan",
} satisfies Required<Profile01Props>

export default function Profile01({
  name = defaultProfile.name,
  role = defaultProfile.role,
  avatar = defaultProfile.avatar,
  subscription = defaultProfile.subscription,
}: Partial<Profile01Props> = defaultProfile) {
  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: subscription,
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "AI Credits",
      value: "2,450",
      href: "#",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Help & Support",
      href: "#",
      icon: <HelpCircle className="w-4 h-4" />,
      external: true,
    },
  ]

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0C]">
        <div className="relative px-6 pt-10 pb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <Image
                src={avatar || "/placeholder.svg"}
                alt={name}
                width={60}
                height={60}
                className="rounded-full ring-3 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{role}</p>
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
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              className="w-full flex items-center justify-between p-1.5 
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/70 
                                rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
