"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function TncHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

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
    { name: "Home", href: "/" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/tnc" },
    { name: "Refund", href: "/refund" },
    { name: "Contact", href: "/contact" },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -50, transition: { duration: 0.3 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.header
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
            <div className="py-3 px-0 leading-7">
              <div className="flex items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-shrink-0"
                >
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src={
                        theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"
                      }
                      alt="logo"
                      width={32}
                      height={32}
                    />
                    <span className="text-xl font-medium font-montserrat bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      zooptics
                    </span>
                  </Link>
                </motion.div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center justify-center">
                  <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
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
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Back Button */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link href="/">
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
                          className="hidden md:flex rounded-full bg-muted/50 hover:bg-muted border-0 gap-1 whitespace-nowrap"
                        >
                          <ChevronLeft className="size-3" />
                          Back to Home
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

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
              {navItems.map((item) => (
                <motion.div key={item.name} variants={mobileMenuItemVariants}>
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
                </motion.div>
              ))}

              <motion.div variants={mobileMenuItemVariants} className="pt-6">
                <Link
                  href="/"
                  onClick={() => {
                    document.body.style.overflow = "";
                    setIsMenuOpen(false);
                  }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-12 text-lg rounded-full bg-transparent gap-2"
                  >
                    <ChevronLeft className="size-4" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
