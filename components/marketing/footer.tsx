"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import ThemeToggle from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: ReactNode
  name?: string
  columns?: FooterColumnProps[]
  copyright?: string
  policies?: FooterLink[]
  showModeToggle?: boolean
  className?: string
}

export default function FooterSection({
  logo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  name = "MarketingAI",
  columns = [
    {
      title: "Product",
      links: [
        { text: "Changelog", href: "#" },
        { text: "Documentation", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Blog", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { text: "Discord", href: "#" },
        { text: "Twitter", href: "#" },
        { text: "Github", href: "#" },
      ],
    },
  ],
  copyright = "© 2025 MarketingAI. All rights reserved",
  policies = [
    { text: "Privacy Policy", href: "#" },
    { text: "Terms of Service", href: "#" },
  ],
  showModeToggle = true,
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-[1200px] mx-auto py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1">
            <div className="flex items-center gap-2">
              {logo}
              <h3 className="text-xl font-bold">{name}</h3>
            </div>
          </div>
          {columns.map((column, index) => (
            <div key={index} className="flex flex-col gap-2">
              <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
              {column.links.map((link, linkIndex) => (
                <a key={linkIndex} href={link.href} className="text-muted-foreground text-sm">
                  {link.text}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">{copyright}</div>
          <div className="flex items-center gap-4">
            {policies.map((policy, index) => (
              <Link key={index} href={policy.href} className="text-xs text-muted-foreground hover:text-foreground">
                {policy.text}
              </Link>
            ))}
            {showModeToggle && <ThemeToggle />}
          </div>
        </div>
      </div>
    </footer>
  )
}
