"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Rocket, LayoutList, LocateFixed, Users } from "lucide-react"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/fade-in"
import { useTheme } from "next-themes"
import { getDashedBorderSvg } from "@/lib/utils"

const planningSteps = [
  {
    title: "Reddit Marketing",
    description:
      "Leverage AI-powered agents to monitor, analyze, and engage with relevant Reddit posts and communities. Instantly discover trending discussions, track mentions of your brand or products, and identify new marketing opportunities. Automate outreach, respond to user queries, and boost your brand presence on Reddit—all while gaining actionable insights to refine your strategy.",
    icon: LayoutList,
    image: "/placeholder.svg?height=500&width=400",
    alignment: "left",
  },
  {
    title: "Hacker News Marketing",
    description:
      "Leverage AI-powered agents to monitor and analyze Hacker News for posts and comments specifically about your company or products. Instantly track relevant mentions, discover discussions tied to your offerings, and identify marketing opportunities. Automate thoughtful responses and participate in product-related threads to boost your brand’s visibility and reputation—while gaining insights to enhance your outreach.",
    icon: LocateFixed,
    image: "/placeholder.svg?height=500&width=400",
    alignment: "right",
  },
  {
    title: "Twitter Marketing",
    description:
      "Tap into the real-time pulse of your industry with Twitter—one of the most dynamic platforms for brand visibility and customer engagement. Market-Agent’s AI agents monitor and analyze tweets specifically about your company and products, helping you track brand mentions, boost awareness, and identify high-potential leads from product-focused conversations. Effortlessly schedule posts for maximum reach and track the impact of every tweet. With Twitter’s vast, active audience and our intelligent automation, you can amplify your brand, connect with prospects, and stay ahead of trends—all centered around your products.",
    icon: Users,
    image: "/placeholder.svg?height=500&width=400",
    alignment: "left",
  },
]

export function AcceleratePlanningSection() {
  const { theme } = useTheme()
  const dashedBorderSvg = getDashedBorderSvg(theme)

  return (
    <section id="accelerate-planning">
      <div className="border-b">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-3.5">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                >
                  <Rocket className="size-4" />
                </motion.div>
                <span>Accelerate</span>
              </Badge>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-semibold">
              Accelerate your marketing reach
            </h2>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light">
              Expand your brand's influence across key platforms with AI-driven monitoring, engagement, and lead
              generation.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container border-x [&>*:last-child]:pb-20 [&>div>div:first-child]:!pt-20 lg:pt-0 pb-0">
        {planningSteps.map((step, index) => (
          <FadeIn key={index} delay={index * 0.2}>
            <div className="relative flex">
              <div
                className={`flex w-full justify-center text-end md:gap-6 lg:gap-10 py-10 leading-7 ${step.alignment === "right" ? "lg:flex-row-reverse lg:text-start" : ""}`}
              >
                <div className="flex-1 max-lg:hidden">
                  <h3 className={`tracking-[-0.96px] text-5xl ${step.alignment === "right" ? "" : ""}`}>
                    {step.title}
                  </h3>
                  <p
                    className={`text-muted-foreground max-w-[400px] text-balance text-xl tracking-[-0.32px] leading-7 mt-6 font-light ${step.alignment === "right" ? "" : "ml-auto"}`}
                  >
                    {step.description}
                  </p>
                </div>

                <motion.div
                  className="bg-background z-[-1] size-fit -translate-y-5 p-4 max-lg:-translate-x-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="bg-card rounded-[10px] border p-[5px] shadow-md">
                    <div className="bg-muted size-fit rounded-md border p-1">
                      <step.icon className="size-4 shrink-0" />
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 max-lg:-translate-x-4">
                  <div className="text-start lg:pointer-events-none lg:hidden">
                    <h3 className="text-2xl tracking-[-0.96px]">{step.title}</h3>
                    <p className="text-muted-foreground mt-2.5 mb-10 max-w-[300px] tracking-[-0.32px] text-balance">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-start justify-start">
                    <div className={step.alignment === "right" ? "lg:ml-auto" : ""}>
                      <div className="px-6 lg:px-10">
                        <motion.div
                          className="w-full border-2 border-dashed h-6 lg:h-10 opacity-20 border-black dark:border-white"
                          style={{
                            backgroundImage: dashedBorderSvg,
                          }}
                        />
                      </div>
                      <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch">
                        <motion.div
                          className="border-2 border-dashed h-full w-6 lg:w-10 opacity-20 border-black dark:border-white"
                          style={{
                            backgroundImage: dashedBorderSvg,
                          }}
                        />
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Image
                            src={step.image || "/placeholder.svg"}
                            width={400}
                            height={500}
                            alt={step.title}
                            className="m-2 rounded-md object-contain shadow-md lg:rounded-xl lg:shadow-lg dark:invert transition-all duration-300 hover:shadow-xl"
                          />
                        </motion.div>
                        <motion.div
                          className="h-full border-2 border-dashed w-6 lg:w-10 opacity-20 border-black dark:border-white"
                          style={{
                            backgroundImage: dashedBorderSvg,
                          }}
                        />
                      </div>
                      <div className="px-6 lg:px-10">
                        <motion.div
                          className="w-full border-2 border-dashed h-6 lg:h-10 opacity-20 border-black dark:border-white"
                          style={{
                            backgroundImage: dashedBorderSvg,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`absolute z-[-2] h-full w-[3px] translate-x-5 rounded-full lg:left-1/2 lg:-translate-x-1/2 ${index === planningSteps.length - 1 ? "from-foreground/10 via-foreground/10 bg-gradient-to-b to-transparent" : "bg-foreground/10"}`}
              >
                {index === 0 && (
                  <div className="to-foreground/10 h-4 w-[3px] -translate-y-full bg-gradient-to-b from-transparent" />
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
