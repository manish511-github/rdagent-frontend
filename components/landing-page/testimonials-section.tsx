"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

const testimonials = [
  {
    company: "Zerostatic",
    logo: "/placeholder.svg?height=36&width=155",
    quote:
      "Our team at Zerostatic relies heavily on automation, and this app takes it to another level. It's like having a virtual assistant built right into my workflow.",
    author: "Abdulsalam Abdulsalam",
    role: "Product Designer, Zerostatic",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    company: "Notion",
    logo: "/placeholder.svg?height=36&width=97",
    quote:
      "I especially love the seamless calendar integrations and advanced task management features keep everyone aligned and organized.",
    author: "Emma Lee",
    role: "Product Manager, Notion",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    company: "Slack",
    logo: "/placeholder.svg?height=36&width=91",
    quote:
      "We needed a productivity app that could grow with our team's evolving needs, this has been the perfect fit. The automation tools have saved us hours.",
    author: "Ryan Chen",
    role: "Operations Lead, Slack",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    company: "GitHub",
    logo: "/placeholder.svg?height=36&width=101",
    quote:
      "This platform has been invaluable for managing projects across distributed teams. Its integration with our existing tools makes setup easy.",
    author: "Ryan Patel",
    role: "Engineering Manager, GitHub",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    company: "Figma",
    logo: "/placeholder.svg?height=36&width=82",
    quote:
      "As a designer, I appreciate how intuitive and visually appealing this app is. It simplifies task management without sacrificing powerful features.",
    author: "Carlos Diaz",
    role: "Design Lead, Figma",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    company: "Loom",
    logo: "/placeholder.svg?height=36&width=88",
    quote:
      "The smart reminders and automated scheduling keep our team focused and on track. We've also found the collaborative features to be very helpful.",
    author: "Matthew Kim",
    role: "Content Strategist, Loom",
    avatar: "/placeholder.svg?height=48&width=48",
  },
]

export function TestimonialsSection() {
  return (
    <section className="">
      <div className="">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 border-none">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 text-sm font-normal tracking-tight shadow-sm">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                >
                  <Heart className="size-4" />
                </motion.div>
                <span>lovin' it</span>
              </Badge>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl">
              What industry experts are saying
            </h2>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
              Trusted by Professionals from Leading Tech Companies
            </p>
          </FadeIn>
        </div>
      </div>

      <StaggerContainer
        className="container mt-10 grid gap-8 sm:grid-cols-2 md:mt-14 lg:grid-cols-3"
        staggerDelay={0.15}
      >
        {testimonials.map((testimonial, index) => (
          <StaggerItem key={index}>
            <motion.div
              whileHover={{
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="flex flex-col gap-6 p-6 h-full transition-all duration-300 hover:border-primary/20">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Image
                    src={testimonial.logo || "/placeholder.svg"}
                    alt={`${testimonial.company} logo`}
                    width={155}
                    height={36}
                    className="object-contain dark:invert"
                  />
                </motion.div>

                <motion.blockquote
                  className="text-muted-foreground-subtle text-lg font-normal italic flex-1"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  "{testimonial.quote}"
                </motion.blockquote>

                <div className="mt-auto flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={`${testimonial.author}'s profile picture`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <p className="text-lg tracking-[-0.36px]">{testimonial.author}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
