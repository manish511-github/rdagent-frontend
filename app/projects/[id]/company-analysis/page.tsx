"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Globe,
  Megaphone,
  Newspaper,
  BarChart2,
  TrendingUp,
  Target,
  Eye,
  Heart,
  History,
  Users,
  Briefcase,
  MapPin,
  Lightbulb,
  CalendarClock,
  Youtube,
  Twitter,
  Facebook,
  AlertTriangle,
  Hash,
  DollarSign,
} from "lucide-react"
import { YouTubeAnalysis } from "@/components/social-media/youtube-analysis"
import { TwitterAnalysis } from "@/components/social-media/twitter-analysis"
import { FacebookAnalysis } from "@/components/social-media/facebook-analysis"
import { OverviewCard } from "@/components/overview/overview-card"
import { MetricsDashboard } from "@/components/overview/metrics-dashboard"
import { TimelineView } from "@/components/overview/timeline-view"
import { FeatureComparison } from "@/components/website/feature-comparison"
import { SwotAnalysis } from "@/components/website/swot-analysis"
 
import { PricingPlans } from "@/components/website/pricing-plans"
import MarkdownRender from "@/components/markdown-render"
 
import Layout from "@/components/kokonutui/layout"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store";
import SeoTraffic from "@/components/website/seo-traffic"
import { selectSEO, selectFeatures, selectYouTube, loadCompetitorAnalysis, selectTwitter, selectFacebook, selectNews, selectPricing, selectOverview } from "@/store/slices/competitorAnalysisSlice"
import { useParams, useSearchParams } from "next/navigation"
import type { AppDispatch } from "@/store/store"

type FeatureItem = {
  feature_name: string
  description: string
  category?: string
  technical_depth?: string
  implementation_scale?: string
}

type PlanItem = {
  name: string
  tier: number
  description: string
  pricing: {
    monthly: { amount: number | null; unit: string; currency: string }
    annual: { amount: number | null; unit: string; currency: string; effective_discount: string | null }
    custom_pricing: boolean
  }
  feature_matrix: { core: string[] }
}

type CompanyOverviewData = {
  mission_statement?: string
  vision?: string
  core_values?: string[]
  founding_history?: string
  key_milestones?: string[]
  organizational_structure?: string
  leadership_team?: string[]
  business_model?: string
  value_proposition?: string
  target_market?: string
  customer_segments?: string[]
  competitive_positioning?: string
  differentiators?: string[]
  recent_achievements?: string[]
  growth_metrics?: {
    revenue?: string
    arr?: string
    yoy_growth?: string
    customers?: string
  }
  awards_and_recognition?: string[]
  locations?: string[]
}

type NewsAnalysis = {
  summary: string
  themes: { name: string; evidence_titles: string[] }[]
  sentiment: { overall: string; by_theme: { theme: string; sentiment: string }[] }
  risks: string[]
  opportunities: string[]
  notable_entities: string[]
}



export default function CompanyAnalysisPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const projectId = (params?.id as string) || ""
  // Prefer URLs from query params; fallback to source_id only for backward compatibility
  const ourUrl = (searchParams.get("our_url") || "") as string
  const competitorUrl = (searchParams.get("competitor_url") || "") as string
  // Get user id from redux from user slice
  const userInfo = useSelector((state: RootState) => state.user.info);
  const userId = userInfo?.id ? String(userInfo.id) : '';

  const overviewProp = undefined as CompanyOverviewData | undefined

  const dispatch = useDispatch<AppDispatch>()
  const featuresFromStore = useSelector(selectFeatures) as any
  const overviewFromStore = useSelector(selectOverview) as any
  const pricingFromStore = useSelector(selectPricing) as any
  const pricingAnalysis = pricingFromStore || undefined
  const youtubeFromStore = useSelector(selectYouTube) as any
  const twitterFromStore = useSelector(selectTwitter) as any
  const facebookFromStore = useSelector(selectFacebook) as any  
  const twitterAnalysis = twitterFromStore || undefined
  const youtubeAnalysis = youtubeFromStore || undefined
  const facebookAnalysis = facebookFromStore || undefined
  const newsFromStore = useSelector(selectNews) as any
  const newsAnalysis = newsFromStore || undefined
  const seoFromStore = useSelector(selectSEO) as any
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref
    }
  }

  useEffect(() => {
    // Reset section refs and active section when switching tabs
    sectionRefs.current = {}
    setActiveSection(null)
  }, [activeTab])

  // Fetch competitor analysis on initial mount so refresh populates Redux
  useEffect(() => {
    ;(async () => {
      try {
        if (!featuresFromStore && projectId && userId) {
          dispatch(
            loadCompetitorAnalysis({
              projectId,
              ourUrl: ourUrl || undefined,
              competitorUrl: competitorUrl || undefined,
              userId: Number(userId),
            }),
          )
        }
      } catch (_) {
        // ignore
      }
    })()
  }, [dispatch, projectId, userId, ourUrl, competitorUrl, featuresFromStore])

  useEffect(() => {
    const sectionIds = Object.keys(sectionRefs.current)
    if (sectionIds.length === 0) return

    const viewportEl = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        root: viewportEl ?? null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.3,
      },
    )

    sectionIds.forEach((id) => {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [activeTab])

  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    event.preventDefault()
    const viewportEl = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null
    const targetEl = sectionRefs.current[targetId]
    if (viewportEl && targetEl) {
      const top =
        targetEl.getBoundingClientRect().top - viewportEl.getBoundingClientRect().top + viewportEl.scrollTop - 8
      viewportEl.scrollTo({ top, behavior: "smooth" })
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // NewsAnalysis type defined above with explicit fields

  
  




  return (
    <Layout>
    <div className="h-full bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {overviewFromStore?.company_name || "Unknown Company"}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Company Analysis Dashboard</p>
            </div>
            {/* <TooltipProvider>
              <div className="flex flex-wrap items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-2 rounded-sm border border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-[#0A0A0A] px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#101010]">
                      <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <span>501–1,000</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Company size</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-2 rounded-sm border border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-[#0A0A0A] px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#101010]">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <span>San Francisco, CA</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Headquarters</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-2 rounded-sm border border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-[#0A0A0A] px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#101010]">
                      <CalendarClock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <span>2013</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Founded</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider> */}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <BarChart2 className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("website")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeTab === "website"
                    ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <Globe className="h-4 w-4" />
                Website
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeTab === "social"
                    ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <Megaphone className="h-4 w-4" />
                Social
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeTab === "news"
                    ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                <Newspaper className="h-4 w-4" />
                News
              </button>
            </nav>
          </div>

          {activeTab === "overview" && (
            <div className="mt-0 flex-1 min-h-0 flex flex-col">
              {(() => {
                {/* const overviewSample: CompanyOverviewData = {
                  mission_statement:
                    "To empower businesses with cutting-edge mobile device management solutions that enhance productivity and security.",
                  vision:
                    "To be the global leader in unified endpoint management, creating a seamlessly connected and secure digital workplace.",
                  core_values: ["Innovation", "Security", "Customer Success", "Integrity", "Excellence"],
                  founding_history:
                    "Founded in 2013 by a team of mobile security experts who recognized the growing need for comprehensive device management solutions in the enterprise market.",
                  key_milestones: [
                    "2013: Company founded with initial focus on iOS device management",
                    "2015: Expanded to Android and Windows device support",
                    "2017: Launched unified endpoint management platform",
                    "2019: Achieved SOC 2 Type II compliance",
                    "2021: Reached 10,000+ enterprise customers globally",
                    "2023: Introduced AI-powered security analytics",
                  ],
                  organizational_structure:
                    "Hexnode operates as a global organization with development centers in San Francisco and London, serving customers across 100+ countries.",
                  leadership_team: [
                    "John Smith - CEO & Co-founder",
                    "Sarah Johnson - CTO & Co-founder",
                    "Michael Chen - VP of Engineering",
                    "Lisa Rodriguez - VP of Sales",
                    "David Kim - VP of Marketing",
                  ],
                  business_model:
                    "SaaS-based subscription model with tiered pricing based on device count and feature requirements.",
                  value_proposition:
                    "Comprehensive mobile device management with industry-leading security, intuitive administration, and seamless user experience.",
                  target_market:
                    "Mid-market to enterprise organizations across healthcare, education, retail, and financial services sectors.",
                  customer_segments: [
                    "Healthcare Organizations",
                    "Educational Institutions",
                    "Retail Chains",
                    "Financial Services",
                    "Government Agencies",
                  ],
                  competitive_positioning:
                    "Positioned as a comprehensive, user-friendly alternative to complex enterprise mobility management solutions.",
                  differentiators: [
                    "Intuitive user interface",
                    "Comprehensive device support",
                    "Advanced security features",
                    "Competitive pricing",
                    "Excellent customer support",
                  ],
                  recent_achievements: [
                    "Named Leader in Gartner Magic Quadrant for UEM",
                    "Achieved 99.9% uptime SLA for 12 consecutive months",
                    "Expanded to 15 new international markets",
                    "Launched partnership with Microsoft for enhanced integration",
                  ],
                  growth_metrics: {
                    revenue: "$50M ARR",
                    arr: "$50M",
                    yoy_growth: "45%",
                    customers: "10,000+",
                  },
                  awards_and_recognition: [
                    "Gartner Magic Quadrant Leader 2023",
                    "Best Mobile Device Management Solution - TechCrunch Awards",
                    "Top 50 SaaS Companies to Watch - Forbes",
                  ],
                  locations: ["San Francisco, CA, USA", "London, UK"],
                }

                const ov = overviewProp ?? overviewSample */}

                return (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 pr-4 pb-20">
                      {/* Other overview sections are temporarily commented out */}

                      {/* Report (Markdown) */}
                      {overviewFromStore?.markdown_report && (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report</h2>
                          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                            <MarkdownRender content={overviewFromStore.markdown_report as string} />
                          </div>
                        </div>
                      )}

                      {/* Remaining overview cards commented out */}
                    </div>
                  </ScrollArea>
                )
              })()}
            </div>
          )}

          {activeTab === "website" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
                          <Tabs defaultValue="seo" className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-center mb-4">
                  <TabsList className="inline-flex h-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400">
                    <TabsTrigger
                      value="seo"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-100"
                    >
                      <Globe className="h-4 w-4 mr-1.5" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger
                    value="features"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-100"
                    >
                      <BarChart2 className="h-4 w-4 mr-1.5" />
                    Features
                    </TabsTrigger>
                    <TabsTrigger
                      value="pricing"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-100"
                    >
                      <DollarSign className="h-4 w-4 mr-1.5" />
                      Pricing
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent value="seo" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="pr-4 pb-20 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SEO Traffic</h2>
                          </div>
                          {/* Replace this sample with real data source once connected */}
                          <SeoTraffic
                            data={seoFromStore}
                          />
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="features" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="pr-4 pb-20 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Feature
                            </h2>
                          </div>
                          <FeatureComparison />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SWOT Analysis</h2>
                          </div>
                          <SwotAnalysis
                            report={{
                              swot_ours: {
                                strengths: (featuresFromStore?.summary_analysis?.strengths ?? []) as string[],
                                weaknesses: (featuresFromStore?.summary_analysis?.weaknesses ?? []) as string[],
                                opportunities: (featuresFromStore?.summary_analysis?.opportunities ?? []) as string[],
                                threats: (featuresFromStore?.summary_analysis?.threats ?? []) as string[],
                              },
                              swot_competitor: {
                                strengths: (
                                  featuresFromStore?.summary_analysis?.competitor_strengths ??
                                  featuresFromStore?.summary_analysis?.strengths ??
                                  []
                                ) as string[],
                                weaknesses: (
                                  featuresFromStore?.summary_analysis?.competitor_weaknesses ??
                                  featuresFromStore?.summary_analysis?.weaknesses ??
                                  []
                                ) as string[],
                                opportunities: (
                                  featuresFromStore?.summary_analysis?.competitor_opportunities ??
                                  featuresFromStore?.summary_analysis?.opportunities ??
                                  []
                                ) as string[],
                                threats: (
                                  featuresFromStore?.summary_analysis?.competitor_threats ??
                                  featuresFromStore?.summary_analysis?.threats ??
                                  []
                                ) as string[],
                              },
                            }}
                          />
                        </div>

                        
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="pr-4 pb-20 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pricing Analysis</h2>
                          </div>
                          <PricingPlans
                            plans={pricingAnalysis?.plans || []}
                          />
                        </div>

                        
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          {activeTab === "social" && (
            <div className="mt-0 flex-1 min-h-0 flex flex-col">
              <Tabs defaultValue="youtube" className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-center mb-4">
                  <TabsList className="inline-flex h-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400">
                    <TabsTrigger
                      value="youtube"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-red-500"
                    >
                      <Youtube className="h-4 w-4 mr-1.5" />
                      YouTube
                    </TabsTrigger>
                    <TabsTrigger
                      value="twitter"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-blue-400"
                    >
                      <Twitter className="h-4 w-4 mr-1.5" />
                      Twitter
                    </TabsTrigger>
                    <TabsTrigger
                      value="facebook"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-blue-500"
                    >
                      <Facebook className="h-4 w-4 mr-1.5" />
                      Facebook
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent value="youtube" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="px-4 pb-4">
                        <YouTubeAnalysis data={youtubeAnalysis || undefined} />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="twitter" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="px-4 pb-4">
                        <TwitterAnalysis data={twitterAnalysis || undefined} />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="facebook" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="px-4 pb-4">
                        <FacebookAnalysis data={facebookAnalysis || undefined} />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          {activeTab === "news" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pr-4 pb-20 space-y-4">
                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Newspaper className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Summary</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {newsAnalysis?.summary}
                    </p>
                  </div>

                  {/* <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sentiment</h4>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {newsAnalysis?.sentiment.overall}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">By Theme</div>
                        <div className="space-y-1">
                          {newsAnalysis?.sentiment.by_theme
                            .slice(0, 2)
                            .map((item: { theme: string; sentiment: string }) => (
                              <div key={item.theme} className="flex justify-between items-center">
                                <span className="text-xs text-gray-700 dark:text-gray-300">{item.theme}</span>
                                <span
                                  className={`text-xs px-1 ${
                                    item.sentiment.toLowerCase() === "positive"
                                      ? "text-green-600 dark:text-green-400"
                                      : item.sentiment.toLowerCase() === "negative"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                  }`}
                                >
                                  {item.sentiment}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Key Themes</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {newsAnalysis?.themes.length} themes identified
                      </span>
                    </div>
                                         <div className="grid gap-3 sm:grid-cols-2">
                        {newsAnalysis?.themes.map((t: { name: string; evidence_titles: string[] }) => (
                        <div
                          key={t.name}
                          className="group p-3 border border-gray-200 dark:border-[#1A1A1A] bg-gray-50/50 dark:bg-[#0A0A0A] hover:bg-gray-100/50 dark:hover:bg-[#111111] transition-colors duration-200 rounded-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                              {t.name}
                            </h5>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t.evidence_titles.length}
                              </span>
                            </div>
                          </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {t.evidence_titles.map((title: string, idx: number) => (
                              <div key={title} className="flex items-start gap-1.5">
                                  <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Opportunities</h4>
                      </div>
                      <div className="space-y-2">
                        {newsAnalysis?.opportunities.map((o: string, index: number) => (
                          <div key={o} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="text-green-600 dark:text-green-400 font-medium">{index + 1}.</span>
                            <span className="leading-relaxed">{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Risks</h4>
                      </div>
                      <div className="space-y-2">
                        {newsAnalysis?.risks.map((r: string, index: number) => (
                          <div key={r} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="text-red-600 dark:text-red-400 font-medium">{index + 1}.</span>
                            <span className="leading-relaxed">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notable Entities</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {newsAnalysis?.notable_entities.map((entity: string) => (
                        <span
                          key={entity}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </Tabs>
      </div>
    </div>
    </Layout>
  )
}
