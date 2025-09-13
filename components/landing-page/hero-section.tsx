"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp, Users, Zap } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useState, useEffect } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <section className="overflow-hidden">
      <div className="border-y">
        <div className="container border-x py-20 md:py-28">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
            <FadeIn>
              <h1 className="text-balance text-center text-5xl font-semibold tracking-tighter md:text-6xl lg:text-7xl leading-tight">
                Stop Guessing What Works on Social Media
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground mx-auto mt-12 max-w-xl text-center text-lg md:text-xl">
                Zooptics agents detect trends, analyze competitors, generate leads, and drive social engagement—keeping your marketing aligned with every market change.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Link href="/signup" className="mt-8 inline-block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="sm"
                    className="rounded-full bg-black text-white border border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 gap-1 whitespace-nowrap"
                  >
                    <span className="relative z-10">Get started</span>
                    <motion.div
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                      className="relative z-10"
                    >
                      <ChevronRight className="size-3" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="mt-12 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Image
                    src="/images/landing-page-dark-3.png"
                    alt="ANIFaith Dashboard"
                    width={990}
                    height={600}
                    className="hidden dark:block rounded-lg shadow-2xl"
                    priority
                  />
                  <Image
                    src="/images/landing-page-light-3.png"
                    alt="ANIFaith Dashboard"
                    width={990}
                    height={600}
                    className="block dark:hidden rounded-lg shadow-2xl"
                    priority
                  />
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>


    </section>
  )
}
