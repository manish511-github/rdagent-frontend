"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

const partners = [
  { name: "Notion", logo: "/placeholder.svg?height=48&width=109" },
  { name: "GitHub", logo: "/placeholder.svg?height=48&width=109" },
  { name: "Slack", logo: "/placeholder.svg?height=48&width=109" },
  { name: "Loom", logo: "/placeholder.svg?height=48&width=109" },
  { name: "Figma", logo: "/placeholder.svg?height=48&width=109" },
]

export function PartnersSection() {
  return (
    <section className="container flex flex-wrap items-center justify-between gap-12 py-12 lg:py-20">
      <FadeIn direction="left">
        <p className="text-primary text-lg leading-[140%] tracking-[-0.32px]">Used by the world's leading companies</p>
      </FadeIn>

      <StaggerContainer className="flex flex-wrap items-center gap-x-8 gap-y-6 opacity-70 grayscale lg:gap-[60px]">
        {partners.map((partner, index) => (
          <StaggerItem key={partner.name}>
            <motion.div
              className="flex items-center justify-center"
              whileHover={{
                scale: 1.1,
                opacity: 1,
                filter: "grayscale(0%)",
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={partner.logo || "/placeholder.svg"}
                alt={`${partner.name} logo`}
                width={109}
                height={48}
                className="object-contain transition-all duration-300"
              />
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
