import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Shapes } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in" // Import FadeIn

const workflows = [
  {
    title: "Customizable AI Agents",
    description: "Easily adapt agents to your industry, audience, and goals for truly personalized automation.",
    image: "/placeholder.svg?height=233&width=416",
  },
  {
    title: "Adaptive Audience Engagement",
    description:
      "AI agents interact with your audience in your brand’s voice, while allowing you to step in for a personal touch whenever you choose.",
    image: "/placeholder.svg?height=233&width=416",
  },
  {
    title: "Smart Post Scheduling",
    description: "Schedule posts in advance to reach your audience at the perfect time and boost engagement.",
    image: "/placeholder.svg?height=233&width=416",
  },
]

export function AdaptiveWorkflowsSection() {
  return (
    <section id="adaptive-workflows">
      <div className="border-b">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-3.5">
          <FadeIn>
            <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-lg">
              <Shapes className="size-4" />
              <span>Adaptive</span>
            </Badge>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-semibold">
              Adapt to every market shift
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light">
              Our AI-powered platform ensures your marketing strategies are always agile, responsive, and perfectly
              aligned with market dynamics.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container border-x lg:!px-0">
        <div className="items-center">
          <div className="grid flex-1 max-lg:divide-y max-lg:border-x lg:grid-cols-3 lg:divide-x">
            {workflows.map((workflow, index) => (
              <FadeIn key={index} delay={0.1 + index * 0.1}>
                {" "}
                {/* Added FadeIn here */}
                <div className="relative isolate pt-5 text-start lg:pt-5">
                  <h3 className="mt-2 px-1 tracking-[-0.36px] lg:px-8 text-4xl">{workflow.title}</h3>
                  <p className="text-muted-foreground px-1 py-4 tracking-[-0.32px] lg:px-8 font-light text-base">
                    {workflow.description}
                  </p>
                  <div className="border-t py-4 lg:px-2">
                    <Image
                      src={workflow.image || "/placeholder.svg"}
                      alt={workflow.title}
                      width={416}
                      height={233}
                      className="rounded-md shadow-md lg:rounded-xl lg:shadow-lg dark:invert"
                    />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
