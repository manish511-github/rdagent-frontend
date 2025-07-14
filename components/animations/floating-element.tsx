"use client"

import type React from "react"

import { motion } from "framer-motion"

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function FloatingElement({ children, className, duration = 3, delay = 0 }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}
