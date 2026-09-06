"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";

const navItems = [
  { label: "How it works", id: "workflow" },
  { label: "Why Zooptics", id: "sources" },
  { label: "Use cases", id: "use-cases" },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="relative z-50 flex items-center justify-between py-5 sm:py-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Zooptics home">
        {mounted ? (
          <Image
            src={theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"}
            alt=""
            width={30}
            height={30}
            priority
          />
        ) : (
          <span className="size-[30px]" aria-hidden="true" />
        )}
        <span className="font-montserrat text-xl font-medium tracking-[-0.035em]">zooptics</span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#52525b] transition-colors hover:bg-white hover:text-[#09090b] dark:text-white/58 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {mounted ? (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-10 place-items-center rounded-md border border-black/[0.07] bg-white/70 text-[#3f3f46] backdrop-blur transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white/72 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        ) : null}

        <Link href="/login" className="hidden rounded-md px-4 py-2 text-sm font-semibold sm:block">
          Log in
        </Link>
        <Link href="/signup" className="hidden rounded-md bg-[#09090b] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-black sm:block">
          Get started
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-md border border-black/[0.07] bg-white/70 dark:border-white/10 dark:bg-white/[0.06] lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-full mt-2 rounded-[24px] border border-black/10 bg-[#fafafa] p-3 shadow-xl dark:border-white/10 dark:bg-[#141416] lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button key={item.label} type="button" onClick={() => scrollToSection(item.id)} className="rounded-2xl px-4 py-3 text-left font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
            <Link href="/login" className="rounded-md border border-black/10 px-4 py-3 text-center text-sm font-semibold dark:border-white/10">Log in</Link>
            <Link href="/signup" className="rounded-md bg-[#09090b] px-4 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-black">Get started</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
