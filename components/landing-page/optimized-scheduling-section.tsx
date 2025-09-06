"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, Globe, LucideIcon } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FeatureCardProps {
  children: ReactNode
  className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card className={cn("group relative rounded-none bg-background/50 backdrop-blur-sm transition-all hover:bg-background/80", className)}>
    <div className="absolute inset-0 border border-border/50 group-hover:border-border"></div>
    <CardDecorator />
    {children}
  </Card>
)

const CardDecorator = () => (
  <>
    <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2 border-primary/50 group-hover:border-primary"></span>
    <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2 border-primary/50 group-hover:border-primary"></span>
    <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 border-primary/50 group-hover:border-primary"></span>
    <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 border-primary/50 group-hover:border-primary"></span>
    <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-muted/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
  </>
)

interface CardHeadingProps {
  icon: LucideIcon
  title: string
  description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2">
      <Icon className="size-4" />
      {title}
    </span>
    <p className="mt-8 text-2xl font-semibold">{description}</p>
  </div>
)

interface DualModeImageProps {
  darkSrc: string
  lightSrc: string
  alt: string
  width: number
  height: number
  className?: string
}

const DualModeImage = ({ darkSrc, lightSrc, alt, width, height, className }: DualModeImageProps) => (
  <>
    <Image
      src={darkSrc}
      className={cn("hidden dark:block", className)}
      alt={`${alt} dark`}
      width={width}
      height={height}
    />
    <Image
      src={lightSrc}
      className={cn("shadow dark:hidden", className)}
      alt={`${alt} light`}
      width={width}
      height={height}
    />
  </>
)

export function OptimizedSchedulingSection() {
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

      <div className="relative overflow-hidden border-x border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-muted/10"></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_500px_at_50%_200px,var(--primary)/3%,transparent_100%)]"></div>
        <div className="container relative border-x py-16 md:py-32">
          <div className="mx-auto grid gap-6 lg:grid-cols-2">
            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="Real-time optimization"
                  description="Advanced tracking system, Instantly locate all your assets and optimize performance."
                />
              </CardHeader>

              <div className="relative mb-6 border-t border-dashed sm:mb-0">
                <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--primary),var(--background)_100%)]"></div>
                <div className="aspect-76/59 p-1 px-6">
                  <DualModeImage
                    darkSrc="/mail2.png"
                    lightSrc="/mail2-light.png"
                    alt="optimization illustration"
                    width={1207}
                    height={929}
                  />
                </div>
              </div>
            </FeatureCard>

            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="AI Post Generator"
                  description="Create on-brand posts instantly with AI. Choose tone, format, and schedule in one click."
                />
              </CardHeader>

              <CardContent>
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--background)_100%)]"></div>
                  <div className="aspect-76/59 border">
                    <DualModeImage
                      darkSrc="/images/post_generator.png"
                      lightSrc="/images/post_generator_light.png"
                      alt="AI post generator illustration"
                      width={1207}
                      height={929}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="News Analysis"
                  description="Stay ahead with real-time news monitoring and competitor intelligence tracking."
                />
              </CardHeader>

              <CardContent>
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--background)_100%)]"></div>
                  <div className="aspect-76/59 border">
                    <DualModeImage
                      darkSrc="/images/news_analysis_dark.png"
                      lightSrc="/images/news_analysis_light.png"
                      alt="news analysis illustration"
                      width={1207}
                      height={929}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="Feature Analysis"
                  description="Deep dive into competitor features and capabilities with comprehensive analysis tools."
                />
              </CardHeader>

              <CardContent>
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--background)_100%)]"></div>
                  <div className="aspect-76/59 border">
                    <DualModeImage
                      darkSrc="/images/feature_dark.png"
                      lightSrc="/images/feature_light.png"
                      alt="feature analysis illustration"
                      width={1207}
                      height={929}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="YouTube Analysis"
                  description="Comprehensive YouTube channel and video performance analytics with competitor insights."
                />
              </CardHeader>

              <CardContent>
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--background)_100%)]"></div>
                  <div className="aspect-76/59 border">
                    <DualModeImage
                      darkSrc="/images/youtube-dark.png"
                      lightSrc="/images/youtube-light.png"
                      alt="YouTube analysis illustration"
                      width={1207}
                      height={929}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Globe}
                  title="Twitter Analysis"
                  description="Advanced Twitter analytics and engagement tracking with real-time social media insights."
                />
              </CardHeader>

              <CardContent>
                <div className="relative mb-6 sm:mb-0">
                  <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--background)_100%)]"></div>
                  <div className="aspect-76/59 border">
                    <DualModeImage
                      darkSrc="/images/twitter-dark.png"
                      lightSrc="/images/twitter-light.png"
                      alt="Twitter analysis illustration"
                      width={1207}
                      height={929}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard className="mt-4 lg:col-span-2">
              <div className="relative border-t border-dashed">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-border/0 via-border/50 to-border/0"></div>
                <div className="p-8 md:p-12">
                  <p className="mx-auto mb-8 max-w-md text-balance text-center text-2xl font-semibold">
                    Smart AI automation with real-time optimization and insights.
                  </p>

                  <div className="flex justify-center gap-6">
                    <div className="bg-gradient-to-b from-border/50 to-border/0 p-px">
                      <div className="relative bg-gradient-to-b from-background to-muted/10 flex items-center space-x-4 rounded-lg p-4">
                        <div className="relative flex aspect-square size-14 items-center rounded-lg border border-border/50 bg-muted/10 p-3 shadow-sm transition-all hover:border-border hover:bg-muted/20">
                          <span className="absolute right-2 top-1.5 text-xs font-medium opacity-70">fn</span>
                          <Globe className="mt-auto size-4" />
                        </div>
                        <div className="flex aspect-square size-14 items-center justify-center rounded-lg border border-border/50 bg-muted/10 p-3 shadow-sm transition-all hover:border-border hover:bg-muted/20">
                          <span className="font-medium">K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
