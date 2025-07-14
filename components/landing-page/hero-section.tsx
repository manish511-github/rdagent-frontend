"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useTheme } from "next-themes"
import { getDashedBorderSvg } from "@/lib/utils"

export function HeroSection() {
  const { theme } = useTheme()
  const dashedBorderSvg = getDashedBorderSvg(theme)

  return (
    <section className="pb-16 text-center lg:pb-0 overflow-hidden">
      <div className="flex">
        <motion.div
          className="relative w-[159px] border-r p-1 max-lg:hidden 2xl:flex-1"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className="h-full w-full border-2 border-dashed opacity-20 border-black dark:border-white" // Added opacity-20
            style={{
              backgroundImage: dashedBorderSvg,
            }}
          />
        </motion.div>

        <div className="container mx-auto pt-16 pb-12 text-center md:pt-20 leading-7 lg:pt-24">
          <FadeIn delay={0.3}>
            <h1 className="mx-auto max-w-3xl text-center text-[2.5rem] leading-[1.2] tracking-[-1.6px] text-balance md:text-[4rem] md:!leading-[1.15] md:tracking-[-4.32px] lg:text-7xl font-semibold">
              Turn <span className="font-playfair">Market Movements</span> into{" "}
              <span className="font-montserrat">Marketing Momentum</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <p className="text-muted-foreground mx-auto mt-5 max-w-[500px] leading-[1.5] tracking-[-0.32px] md:mt-6 text-xl font-light">
              ANIFaith agent detect trends, generate leads, and drive social engagement, keeping your marketing aligned
              with every market change
            </p>
          </FadeIn>

          <FadeIn delay={0.9} direction="up">
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button className="mt-6 gap-1 md:mt-8 lg:mt-10 bg-black text-white border border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200">
                  <span className="relative z-10">Get started</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="relative z-10"
                  >
                    <ChevronRight className="size-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </FadeIn>
        </div>

        <motion.div
          className="relative w-[159px] p-1 max-lg:hidden border-r-0 border-l 2xl:flex-1"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className="h-full w-full border-2 border-dashed opacity-20 border-black dark:border-white" // Added opacity-20
            style={{
              backgroundImage: dashedBorderSvg,
            }}
          />
        </motion.div>
      </div>

      <motion.div
        className="flex h-8 gap-1 max-lg:hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex-1 border" />
        <motion.div
          className="h-full border-dashed w-52 border-2 opacity-20 border-black dark:border-white" // Added opacity-20
          style={{
            backgroundImage: dashedBorderSvg,
          }}
        />
        <div className="w-24 border" />
        <motion.div
          className="h-full border-2 border-dashed w-52 opacity-20 border-black dark:border-white" // Added opacity-20
          style={{
            backgroundImage: dashedBorderSvg,
          }}
        />
        <div className="w-24 border" />
        <motion.div
          className="h-full border-2 border-dashed w-52 opacity-20 border-black dark:border-white" // Added opacity-20
          style={{
            backgroundImage: dashedBorderSvg,
          }}
        />
        <div className="flex-1 border" />
      </motion.div>

      <div className="flex">
        <div className="relative w-[159px] border-r p-1 max-lg:hidden 2xl:flex-1" />
        <div className="container !pt-0 lg:!p-1.5">
          <FadeIn delay={1.2} direction="up">
            <Image
              src="/placeholder.svg?height=600&width=1000"
              alt="Hero"
              width={1000}
              height={600}
              className="mx-auto rounded-xl border object-contain p-1 shadow-lg 2xl:max-w-[1092px] dark:invert"
            />
          </FadeIn>
        </div>
        <div className="relative w-[159px] p-1 max-lg:hidden border-r-0 border-l 2xl:flex-1" />
      </div>

      <motion.div
        className="flex max-lg:hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <div className="h-8 flex-1 border" />
        <div className="h-[96px] w-[min(753px,55vw)] -translate-y-1.5">
          <motion.div
            className="h-full w-full border-2 border-dashed opacity-20 border-black dark:border-white" // Added opacity-20
            style={{
              backgroundImage: dashedBorderSvg,
            }}
          />
        </div>
        <div className="h-8 flex-1 border" />
      </motion.div>
    </section>
  )
}
