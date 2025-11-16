"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, ChevronRight } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

const storyCards = [
  {
    title: "The Challenge You Face",
    content: `You're flying blind in social media. Manually tracking competitors across multiple platforms drains your team's time. Your content strategy relies on guesswork and outdated data. You discover viral trends days too late. While you debate which posts to publish, competitors capture your audience. You miss critical brand mentions and engagement opportunities. This isn't a resource problem—it's an intelligence problem.`,
  },
  {
    title: "The Solution We Built",
    content: `Zooptics AI agents work around the clock to detect trends, analyze competitors, generate leads, and drive social engagement. Our platform continuously monitors your brand and products across platforms like Reddit, Hacker News, Twitter, and YouTube. AI agents automatically engage with your audience in your brand's voice, while you maintain control to step in personally whenever needed. Your marketing stays aligned with every market change, automatically.`,
  },
  {
    title: "Our Vision",
    content: `We believe every business deserves AI-powered marketing intelligence that adapts to market dynamics. With customizable AI agents, comprehensive competitor analysis, and automated brand engagement, small teams can compete with enterprise budgets. Our platform transforms "post and pray" into strategic, data-driven marketing. From smart brand monitoring to effortless lead generation, Zooptics ensures your brand voice resonates authentically across every platform—Reddit, Hacker News, YouTube, Twitter, and beyond.`,
  },
  {
    title: "Our Promise",
    content: `Your brand is unique, and your marketing should reflect that. Zooptics adapts to your industry, audience, and goals with customizable AI agents that learn your voice. Whether you need competitor analysis, automated engagement, or lead generation, our platform grows with your ambition. Stop guessing what works on social media. Start leading with AI-powered insights that keep your marketing aligned with every market change.`,
  },
]

export function AboutSection() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container border-x py-20 md:py-28">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
            <FadeIn>
              <Badge variant="outline" className="mb-6 w-fit gap-2 px-4 py-1.5 text-base font-normal tracking-tight shadow-sm">
                <TrendingUp className="size-5" />
                <span>About Zooptics</span>
              </Badge>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl mb-16">
                Why Zooptics Exists?
              </h2>
            </FadeIn>

            <div className="mx-auto w-full max-w-4xl px-6 md:px-0">
              <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                {storyCards.map((card, index) => (
                  <StaggerItem key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.2 }
                      }}
                      className="group"
                    >
                      <Card className="relative overflow-hidden border transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        <CardContent className="relative p-8 pl-12">
                          <h3 className="mb-4 text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                            {card.title}
                          </h3>
                          
                          {/* Decorative line */}
                          <div className="mb-4 h-px w-16 bg-gradient-to-r from-border to-transparent transition-all duration-300 group-hover:w-24 group-hover:from-primary/50" />
                          
                          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                            {card.content}
                          </p>
                        </CardContent>

                        {/* Corner accent */}
                        <div className="absolute bottom-0 right-0 h-24 w-24 bg-gradient-to-tl from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Card>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b">
        <div className="container border-x py-16 md:py-24">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to Transform How You Market Forever?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join marketers who rely on Zooptics AI agents to surface emerging trends, decode competitor moves, uncover high-intent leads, and spark meaningful social engagement—so their marketing stays perfectly in sync with every shift in the market.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-full"
                  >
                    <Button
                      size="lg"
                      className="w-full rounded-full bg-black text-white border border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200"
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-8 w-full border-b md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </div>
  )
}

