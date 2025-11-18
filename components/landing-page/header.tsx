"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to manage body overflow when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navItems = [
    { name: "Features", id: "smart-productivity" },
    { name: "About us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const featureSections = [
    { name: "Unleash Marketing Velocity", id: "smart-productivity" },
    { name: "Adaptive Workflows", id: "adaptive-workflows" },
    { name: "Optimized Scheduling", id: "optimized-scheduling" },
    { name: "Accelerate Planning", id: "accelerate-planning" },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -50, transition: { duration: 0.3 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
  };

  // Function to handle smooth scrolling with offset
  const scrollToSection = (id: string) => {
    const targetElement = document.getElementById(id);
    if (targetElement && headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        20;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <>
      {/* Spacer to prevent content jump */}
      {/* <div className="h-20" /> */}

      <motion.header
        ref={headerRef}
        className={`sticky top-0 z-50 w-full transition-all duration-500`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container px-0">
          <motion.div
            className={`relative backdrop-blur-xl bg-background/80 border border-border/50 rounded-2xl shadow-lg transition-all duration-500 ${
              isScrolled
                ? "shadow-xl bg-background/90 border-border/80"
                : "shadow-md"
            }`}
            animate={{
              scale: isScrolled ? 0.98 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <div className="py-3 px-0 leading-7">
              <div className="flex items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-shrink-0"
                >
                  <Link href="/" className="flex items-center gap-2">
                    {mounted && (
                      <Image
                        src={
                          theme === "dark"
                            ? "/logo-light.svg"
                            : "/logo-dark.svg"
                        }
                        alt="logo"
                        width={32}
                        height={32}
                      />
                    )}
                    <span className="text-xl font-medium font-montserrat bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      zooptics
                    </span>
                  </Link>
                </motion.div>

                {/* Desktop Navigation - Centered within container */}
                <nav className="hidden lg:flex items-center justify-center">
                  <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        {item.id ? (
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(item.id);
                            }}
                            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full group whitespace-nowrap"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-background rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              layoutId="navHover"
                            />
                            <span className="relative z-10">{item.name}</span>
                          </motion.button>
                        ) : item.href ? (
                          <Link href={item.href}>
                            <motion.div
                              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full group whitespace-nowrap"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-background rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                layoutId="navHover"
                              />
                              <span className="relative z-10">{item.name}</span>
                            </motion.div>
                          </Link>
                        ) : null}
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Theme toggle */}
                  {mounted && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="relative h-9 w-9 rounded-full bg-muted/50 hover:bg-muted border-0"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {theme === "dark" ? (
                            <motion.div
                              key="moon"
                              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                              animate={{ opacity: 1, rotate: 0, scale: 1 }}
                              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Moon className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="sun"
                              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                              animate={{ opacity: 1, rotate: 0, scale: 1 }}
                              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Sun className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Desktop auth buttons */}
                  <div className="hidden lg:flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link href="/login">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full bg-muted/50 hover:bg-muted border-0 gap-1 whitespace-nowrap"
                          >
                            Login
                            <motion.div
                              animate={{ x: [0, 2, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            >
                              <ChevronRight className="size-3" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link href="/signup">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <Button
                            size="sm"
                            className="rounded-full bg-black text-white border border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 gap-1 whitespace-nowrap"
                          >
                            <span className="relative z-10">Sign up</span>
                            <motion.div
                              animate={{ x: [0, 2, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: 0.5,
                              }}
                              className="relative z-10"
                            >
                              <ChevronRight className="size-3" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Mobile menu button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="lg:hidden"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted border-0"
                    >
                      <AnimatePresence mode="wait">
                        {isMenuOpen ? (
                          <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Menu className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span className="sr-only">Open main menu</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="lg:hidden fixed inset-0 top-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col pt-24"
          >
            <motion.div
              className="container py-6 space-y-6 flex-1 overflow-y-auto"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                },
              }}
            >
              {navItems.map((item, index) => (
                <motion.div key={item.name} variants={mobileMenuItemVariants}>
                  {item.id === "smart-productivity" ? (
                    <>
                      <div className="py-3 text-2xl font-semibold text-foreground border-b border-border/50">
                        Features
                      </div>
                      <div className="pl-4 space-y-3 mt-4">
                        {featureSections.map((feature) => (
                          <motion.button
                            key={feature.id}
                            onClick={(e) => {
                              e.preventDefault();
                              document.body.style.overflow = "";
                              scrollToSection(feature.id);
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left py-2 text-lg text-muted-foreground hover:text-foreground transition-colors"
                            whileHover={{ x: 10 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            {feature.name}
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className="block py-3 text-2xl font-semibold text-foreground hover:text-primary transition-colors border-b border-border/50"
                      onClick={() => {
                        document.body.style.overflow = "";
                        setIsMenuOpen(false);
                      }}
                    >
                      <motion.div
                        whileHover={{ x: 10 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        {item.name}
                      </motion.div>
                    </Link>
                  ) : null}
                </motion.div>
              ))}

              <div className="pt-6 space-y-4">
                <motion.div variants={mobileMenuItemVariants}>
                  <Link
                    href="/login"
                    onClick={() => {
                      document.body.style.overflow = "";
                      setIsMenuOpen(false);
                    }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-12 text-lg rounded-full bg-transparent"
                    >
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <Link
                    href="/signup"
                    onClick={() => {
                      document.body.style.overflow = "";
                      setIsMenuOpen(false);
                    }}
                  >
                    <Button
                      variant="default"
                      className="w-full h-12 text-lg rounded-full bg-black text-white border border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200"
                    >
                      Sign up
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
