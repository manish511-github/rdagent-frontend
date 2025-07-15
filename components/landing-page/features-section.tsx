"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PocketKnife, CalendarClock, BarChartIcon as ChartBar } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useTheme } from "next-themes"
import { getDashedBorderSvg } from "@/lib/utils"

const features = [
  {
    id: "smart-task-management",
    title: "Smart Brand & Product Monitoring",
    description:
      "Stay effortlessly informed as AI agents continuously scan and track posts about your company and products. Instantly surface relevant conversations and trends, so you never miss what matters most to your brand.",
    icon: PocketKnife,
    image: "/placeholder.svg?height=510&width=400",
  },
  {
    id: "automated-scheduling",
    title: "Effortless Lead Generation",
    description:
      "Grow your customer base with AI-powered lead discovery. Our agents analyze online discussions to identify and qualify prospects who are already interested in your offerings—delivering high-quality leads directly to you.",
    icon: CalendarClock,
    image: "/placeholder.svg?height=510&width=400",
  },
  {
    id: "personalized-insights",
    title: "Automated Brand Engagement",
    description:
      "Boost your brand’s visibility and reputation with intelligent, sentiment-driven engagement. AI agents analyze the tone of conversations and automatically join in with tailored responses or content, ensuring your brand always delivers the right message at the right moment.",
    icon: ChartBar,
    image: "/placeholder.svg?height=510&width=400",
  },
]

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("smart-task-management")
  const { theme } = useTheme()
  const dashedBorderSvg = getDashedBorderSvg(theme)

  return (
    <section id="smart-productivity" className="pt-12 lg:pt-5">
      <div className="border-y">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-3.5">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                >
                  <PocketKnife className="size-4" />
                </motion.div>
                <span>Features</span>
              </Badge>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-semibold">
              Unleash Marketing Velocity
            </h2>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light">
              Achieve unstoppable marketing momentum with features that streamline your workflow, boost productivity,
              and maximize your brand’s impact.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container border-x lg:!px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex items-center max-lg:flex-col lg:divide-x">
          <TabsList className="flex h-auto flex-1 flex-col bg-transparent p-0 max-lg:border-x lg:border-t">
            {features.map((feature, index) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="group relative border-b px-1 py-5 text-start whitespace-normal data-[state=active]:shadow-none lg:px-8 leading-5"
              >
                <motion.div
                  className="absolute bottom-[-1px] left-0 z-10 h-[1px] bg-gradient-to-r from-blue-600 via-sky-300 to-transparent transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeTab === feature.id ? "50%" : 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <FadeIn delay={0.1 + index * 0.1}>
                  {" "}
                  {/* Added FadeIn here */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <feature.icon className="size-4" />
                      </motion.div>
                      <h3 className="tracking-[-0.36px] font-medium text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground mt-2.5 tracking-[-0.32px] font-light">{feature.description}</p>
                  </div>
                </FadeIn>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {features.map((feature) => (
                <TabsContent key={feature.id} value={feature.id} className="m-0 px-6 py-[38px] max-lg:border-x">
                  {activeTab === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex justify-center"
                    >
                      <div>
                        <div className="px-6 lg:px-10">
                          <motion.div
                            className="w-full border-2 border-dashed opacity-20 border-black dark:border-white h-10"
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
                              src={feature.image || "/placeholder.svg"}
                              alt={feature.title}
                              width={400}
                              height={510}
                              className="m-3 rounded-md object-contain shadow-md lg:rounded-xl lg:shadow-lg dark:invert transition-all duration-300 hover:shadow-xl"
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
                    </motion.div>
                  )}
                </TabsContent>
              ))}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container w-full border-x h-full" />
      </div>
    </section>
  )
}
