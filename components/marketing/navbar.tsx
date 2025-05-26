"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Search, ChevronDown, Layers, BarChart2, Users, MessageSquare } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-background border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="text-lg sm:text-xl font-semibold tracking-tight">MarketingAI</span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center gap-1 xl:gap-2">
                <Link
                  href="#features"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-foreground scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  How It Works
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-foreground scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>

                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setIsResourcesOpen(true)}
                    onMouseLeave={() => setIsResourcesOpen(false)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    Resources
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  <div
                    onMouseEnter={() => setIsResourcesOpen(true)}
                    onMouseLeave={() => setIsResourcesOpen(false)}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-lg shadow-lg bg-background border border-border overflow-hidden transition-all duration-200 origin-top ${
                      isResourcesOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="py-2">
                      <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span>Documentation</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        <span>Case Studies</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Community</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>Blog</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link
                  href="#testimonials"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  Testimonials
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-foreground scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                <Link
                  href="#pricing"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  Pricing
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-foreground scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="hidden md:flex items-center justify-center rounded-full w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </button>

              <ThemeToggle />

              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium"
                >
                  Get Started
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border z-50 lg:hidden transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-semibold tracking-tight">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              <Link
                href="#features"
                className="block py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>

              {/* Mobile Resources Dropdown */}
              <div>
                <button
                  className="flex items-center justify-between w-full py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                >
                  Resources
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isResourcesOpen && (
                  <div className="mt-1 ml-4 space-y-1">
                    <Link
                      href="#"
                      className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      Documentation
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      Case Studies
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Community
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Blog
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="#testimonials"
                className="block py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="block py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Mobile menu footer */}
          <div className="p-4 border-t border-border space-y-3">
            <Link
              href="#"
              className="block w-full py-3 px-4 text-center text-base font-medium hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
            <Button
              className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  )
}
