"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, HelpCircle, Volume2, Lightbulb } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { useTheme } from "next-themes"
import { getDashedBorderSvg } from "@/lib/utils"

const schedulingFeatures = [
  {
    id: "unified-scheduling",
    title: "Unified Management",
    description: "Manage all your AI agents and access key market insights from one intuitive interface.",
    icon: HelpCircle,
    image: "/placeholder.svg?height=743&width=1312",
  },
  {
    id: "insightful-performance",
    title: "Competitor Insights",
    description:
      "Automatically track and analyze competitors to uncover strategies, strengths, and gaps—so you can outmaneuver them and stay ahead.",
    icon: Volume2,
    image: "/placeholder.svg?height=743&width=1312",
  },
  {
    id: "effortless-integrations",
    title: "Smart Lead Prioritization",
    description:
      "Use AI-driven analytics to identify, score, and prioritize high-potential leads, ensuring your efforts are focused on the most valuable prospects.",
    icon: Lightbulb,
    image: "/placeholder.svg?height=743&width=1312",
  },
]

export function OptimizedSchedulingSection() {
  const [activeTab, setActiveTab] = useState("unified-scheduling")
  const { theme } = useTheme()
  const dashedBorderSvg = getDashedBorderSvg(theme)

  return (
    <section id="optimized-scheduling">
      <div className="border-b">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-3.5">
          <FadeIn>
            <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-lg">
              <Eye className="size-4" />
              <span>Optimize</span>
            </Badge>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-semibold">
              End-to-End Marketing Optimization
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-normal">
              Achieve seamless marketing efficiency with intelligent insights, unified control, and strategic lead
              prioritization.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container border-x lg:!px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="inline-flex items-center justify-center rounded-lg h-auto w-full bg-transparent p-0 max-lg:flex-col max-lg:divide-y lg:grid lg:grid-cols-3 lg:divide-x">
            {schedulingFeatures.map((feature, index) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="group relative isolate inline-block h-full w-full rounded-none px-1 py-5 text-start whitespace-normal data-[state=active]:shadow-none max-lg:border-x last:max-lg:!border-b lg:border-b lg:px-8"
              >
                <div className="absolute bottom-[-1px] left-0 h-[1px] w-0 bg-gradient-to-r from-blue-600 via-sky-300 to-transparent transition-all duration-300 group-data-[state=active]:w-1/2" />

                {/* Corner decorations */}
                <div className="size-2 rounded-[1px] absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-gray-400" />
                <div className="size-2 rounded-[1px] absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 bg-gray-400" />
                {feature.id === "effortless-integrations" && (
                  <>
                    <div className="size-2 rounded-[1px] absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-gray-400" />
                    <div className="size-2 rounded-[1px] absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 bg-gray-400" />
                  </>
                )}
                <FadeIn delay={0.1 + index * 0.1}>
                  {" "}
                  {/* Added FadeIn here */}
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="relative size-6">
                      <div className="absolute inset-0 -rotate-45 rounded-full bg-gradient-to-l from-blue-600 via-sky-300 to-50% transition-all duration-1000 group-data-[state=inactive]:opacity-0" />
                      <div className="absolute inset-[0.75px] rounded-full bg-gray-100" />
                      <div className="absolute inset-[1.25px] grid place-items-center rounded-full bg-border">
                        <feature.icon className="size-3.5" />
                      </div>
                    </div>
                    <h3 className="text-2xl tracking-[-0.36px]">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mt-2 tracking-[-0.32px] font-light text-base">
                    {feature.description}
                  </p>
                </FadeIn>
              </TabsTrigger>
            ))}
          </TabsList>

          {schedulingFeatures.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-0">
              <div className="flex flex-1 flex-col px-2 py-4 max-lg:border-x">
                <div
                  className="w-full border-2 border-dashed h-5 opacity-20 border-black dark:border-white"
                  style={{
                    backgroundImage: dashedBorderSvg,
                  }}
                />
                <Image
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  width={1312}
                  height={743}
                  className="my-2 rounded-md object-contain shadow-md lg:rounded-xl lg:shadow-lg dark:invert"
                />
                <div
                  className="w-full border-2 border-dashed h-5 opacity-20 border-black dark:border-white"
                  style={{
                    backgroundImage: dashedBorderSvg,
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
