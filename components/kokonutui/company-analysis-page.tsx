"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Tabs } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Building2,
  Globe,
  Megaphone,
  Newspaper,
  BarChart2,
  TrendingUp,
  Star,
  Target,
  Eye,
  Heart,
  History,
  Users,
  Briefcase,
  Sparkles,
  Award,
  MapPin,
  Flag,
  Lightbulb,
  CalendarClock,
  DollarSign,
} from "lucide-react"

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

type YouTubeAnalysis = {
  success: boolean
  data: {
    channel_id: string
    title: string
    description: string
    subscribers: number
    total_views: number
    total_likes: number
    total_comments: number
    total_videos: number
    avg_views: number
    avg_engagement: number
  }
  metadata: {
    channel_url: string
    days: number
  }
  report: {
    channel_summary: {
      number_of_videos: number
      activity: string
      summary_of_topics: string[]
      examples: { title: string; description: string }[]
    }
    scoring: {
      number_of_videos: { score: number; reason: string }
      activity: { score: number; reason: string }
      engagement: { score: number; reason: string }
      relevancy: { score: number; reason: string }
      total_channel_score: number
    }
    opportunities_for_improvement: {
      category: string
      title: string
      rationale: string
      sample_titles: string[]
    }[]
    action_plan: {
      objective: string
      hypothesis: string
      actions: string[]
    }[]
    supporting_insights: {
      formats_and_length: string[]
      top_performers: { title: string; reason: string }[]
      bottom_performers: { title: string; reason: string }[]
      trends: string[]
      comments_intelligence: { themes: string[]; faqs: string[]; notes: string }
    }
  }
}

type NewsAnalysis = {
  summary: string
  themes: { name: string; evidence_titles: string[] }[]
  sentiment: { overall: string; by_theme: { theme: string; sentiment: string }[] }
  risks: string[]
  opportunities: string[]
  notable_entities: string[]
}

const SAMPLE_NEWS: NewsAnalysis = {
  summary:
    "Hexnode has been active in the last six months, focusing on expansion, partnerships, and product development. Key activities include the announcement of their annual user conference, HexCon25, a partnership with Quokka to enhance mobile app security, the launch of a new data center in the UAE to support Middle East digital transformation, a distribution deal with Kite in the UK, and the launch of UEM MSP for managed service providers. The CEO has also been vocal about Apple's shortcomings in IT and supply chain security challenges.",
  themes: [
    {
      name: "Expansion",
      evidence_titles: [
        "Hexnode Empowers Middle East Digital Transformation with New UAE Data Centre",
        "Hexnode expands in the Middle East with new UAE data centre",
        "Hexnode’s UEM solutions take flight in UK with Kite distribution deal",
      ],
    },
    {
      name: "Partnerships",
      evidence_titles: [
        "Hexnode UEM Partners With Quokka to Double Down on Mobile App Security for Businesses",
        "Hexnode’s UEM solutions take flight in UK with Kite distribution deal",
        ],
      },
      {
      name: "Product Development/Launches",
      evidence_titles: ["Hexnode Launches UEM MSP: Purpose-Built for Managed Service Providers"],
    },
    {
      name: "Industry Commentary",
      evidence_titles: [
        "Hexnode CEO sees 3 pain points Apple should fix for IT",
        "Hexnode CEO: The supply chain still doesn’t know how to protect itself",
      ],
    },
    {
      name: "User Conference",
      evidence_titles: [
        "Hexnode Announces HexCon25: The Annual User Conference Set for September 17–18, 2025, in Atlanta",
      ],
    },
  ],
  sentiment: {
    overall: "positive",
    by_theme: [
      { theme: "Expansion", sentiment: "positive" },
      { theme: "Partnerships", sentiment: "positive" },
      { theme: "Product Development/Launches", sentiment: "positive" },
      { theme: "Industry Commentary", sentiment: "neutral" },
      { theme: "User Conference", sentiment: "positive" },
    ],
  },
  risks: [
    "Supply chain security vulnerabilities highlighted by the CEO could impact Hexnode's clients and require ongoing security enhancements.",
    "Apple's failure to address the pain points identified by Hexnode's CEO could limit the effectiveness of Hexnode's solutions for Apple devices.",
  ],
  opportunities: [
    "Expansion into new markets like the Middle East and UK presents growth opportunities.",
    "Partnerships, like the one with Quokka, can enhance product offerings and attract new customers.",
    "The launch of UEM MSP caters to the growing demand from managed service providers.",
    "HexCon25 provides a platform to engage with users, gather feedback, and showcase new developments.",
  ],
  notable_entities: ["Hexnode", "Mitsogo Inc.", "Apu Pavithran", "Quokka", "Kite", "Apple"],
}

type CompanyAnalysisPageProps = {
  projectId: string
  companySlug?: string
  features?: FeatureItem[]
  plans?: PlanItem[]
  overview?: CompanyOverviewData
  youtubeAnalysis?: YouTubeAnalysis
  newsAnalysis?: NewsAnalysis
}

export default function CompanyAnalysisPage({
  projectId,
  companySlug,
  features: featuresProp,
  plans: plansProp,
  overview: overviewProp,
  youtubeAnalysis,
  newsAnalysis,
}: CompanyAnalysisPageProps) {
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
    <div className="h-full bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Hexnode</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Company Analysis Dashboard</p>
            </div>
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 min-h-0 flex flex-col overflow-hidden">
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
              const overviewSample: CompanyOverviewData = {
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

              const ov = overviewProp ?? overviewSample

                const sectionIcons: Record<string, React.ReactElement> = {
                  mission: <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  vision: <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "core-values": <Heart className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "founding-history": <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "key-milestones": <Flag className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "organizational-structure": <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "leadership-team": <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "business-model": <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "value-proposition": <Lightbulb className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "target-market": <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "customer-segments": <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "competitive-positioning": <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  differentiators: <Sparkles className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "recent-achievements": <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  "growth-metrics": <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  awards: <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  locations: <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
              }

              const sections = [
                ov.mission_statement && {
                  id: "mission",
                  title: "Mission",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.mission_statement}</p>,
                },
                ov.vision && {
                  id: "vision",
                  title: "Vision",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.vision}</p>,
                },
                  ov.core_values &&
                    ov.core_values.length > 0 && {
                  id: "core-values",
                  title: "Core Values",
                  content: (
                        <div className="flex flex-wrap gap-2">
                      {ov.core_values.map((v: string) => (
                            <span
                              key={v}
                               className="inline-flex items-center rounded bg-gray-100 dark:bg-[#0F0F0F] px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                  ),
                },
                ov.founding_history && {
                  id: "founding-history",
                  title: "Founding History",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.founding_history}</p>,
                },
                  ov.key_milestones &&
                    ov.key_milestones.length > 0 && {
                  id: "key-milestones",
                  title: "Key Milestones",
                  content: (
                        <div className="space-y-3">
                      {ov.key_milestones.map((m: string) => (
                            <div key={m} className="flex items-start gap-3">
                              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded bg-gray-400 dark:bg-gray-500" />
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{m}</p>
                            </div>
                      ))}
                        </div>
                  ),
                },
                ov.organizational_structure && {
                  id: "organizational-structure",
                  title: "Organizational Structure",
                  content: (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.organizational_structure}</p>
                  ),
                },
                  ov.leadership_team &&
                    ov.leadership_team.length > 0 && {
                  id: "leadership-team",
                  title: "Leadership Team",
                  content: (
                        <div className="grid gap-3 sm:grid-cols-2">
                      {ov.leadership_team.map((l: string) => (
                              <div
                                key={l}
                                className="flex items-center gap-3 rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-3"
                              >
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{l}</span>
                            </div>
                          ))}
                        </div>
                  ),
                },
                ov.business_model && {
                  id: "business-model",
                  title: "Business Model",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.business_model}</p>,
                },
                ov.value_proposition && {
                  id: "value-proposition",
                  title: "Value Proposition",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.value_proposition}</p>,
                },
                ov.target_market && {
                  id: "target-market",
                  title: "Target Market",
                    content: <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.target_market}</p>,
                },
                  ov.customer_segments &&
                    ov.customer_segments.length > 0 && {
                  id: "customer-segments",
                  title: "Customer Segments",
                  content: (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {ov.customer_segments.map((s: string) => (
                              <div
                                key={s}
                                className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-3 text-center"
                              >
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s}</span>
                            </div>
                          ))}
                        </div>
                  ),
                },
                ov.competitive_positioning && {
                  id: "competitive-positioning",
                  title: "Competitive Positioning",
                  content: (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ov.competitive_positioning}</p>
                  ),
                },
                  ov.differentiators &&
                    ov.differentiators.length > 0 && {
                  id: "differentiators",
                  title: "Differentiators",
                  content: (
                        <div className="grid gap-3 sm:grid-cols-2">
                      {ov.differentiators.map((d: string) => (
                              <div
                                key={d}
                                className="flex items-center gap-3 rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-3"
                              >
                              <Sparkles className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{d}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ov.recent_achievements &&
                    ov.recent_achievements.length > 0 && {
                  id: "recent-achievements",
                  title: "Recent Achievements",
                  content: (
                               <div className="space-y-3">
                      {ov.recent_achievements.map((a: string) => (
                            <div key={a} className="flex items-start gap-3">
                              <Award className="mt-1 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{a}</p>
                            </div>
                      ))}
                        </div>
                  ),
                },
                  ov.growth_metrics &&
                    Object.values(ov.growth_metrics).some(Boolean) && {
                  id: "growth-metrics",
                  title: "Growth Metrics",
                  content: (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                          {[
                            { label: "Revenue", value: ov.growth_metrics?.revenue, icon: DollarSign },
                            { label: "ARR", value: ov.growth_metrics?.arr, icon: TrendingUp },
                            { label: "YoY Growth", value: ov.growth_metrics?.yoy_growth, icon: BarChart2 },
                            { label: "Customers", value: ov.growth_metrics?.customers, icon: Users },
                          ].map(({ label, value, icon: Icon }) => (
                            <div
                              key={label}
                              className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-4 text-center"
                            >
                              <Icon className="mx-auto mb-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {value || "—"}
                              </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                  ov.awards_and_recognition &&
                    ov.awards_and_recognition.length > 0 && {
                  id: "awards",
                  title: "Awards & Recognition",
                  content: (
                         <div className="space-y-3">
                      {ov.awards_and_recognition.map((aw: string) => (
                            <div key={aw} className="flex items-start gap-3">
                              <Star className="mt-1 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aw}</p>
                            </div>
                      ))}
                        </div>
                  ),
                },
                  ov.locations &&
                    ov.locations.length > 0 && {
                  id: "locations",
                  title: "Locations",
                  content: (
                        <div className="flex flex-wrap gap-2">
                      {ov.locations.map((loc: string) => (
                              <div
                                key={loc}
                                className="flex items-center gap-2 rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent px-3 py-2"
                              >
                              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{loc}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                ].filter(Boolean) as { id: string; title: string; content: React.ReactElement }[]

              return (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 min-h-0 flex-1">
                    <div className="lg:col-span-1 order-2 lg:order-2">
                      <div className="sticky top-6">
                        <div className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                          <div className="border-b border-gray-200 dark:border-[#1A1A1A] px-4 py-3">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Contents</h3>
                      </div>
                          <nav className="p-2">
                            <div className="space-y-1">
                        {sections.map((s) => (
                            <a
                                  key={s.id}
                              href={`#${s.id}`}
                              onClick={(e) => handleTocClick(e, s.id)}
                              className={cn(
                                   "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-[#101010]",
                                    activeSection === s.id
                                      ? "bg-gray-100 dark:bg-[#0F0F0F] font-medium text-gray-900 dark:text-gray-100"
                                      : "text-gray-600 dark:text-gray-400",
                                  )}
                                >
                                  {sectionIcons[s.id]}
                                  {s.title}
                                </a>
                              ))}
                            </div>
                    </nav>
                  </div>
                        </div>
                                </div>

                    <div className="lg:col-span-3 order-1 lg:order-1 flex flex-col min-h-0 flex-1 overflow-hidden">
                      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
                        <div className="space-y-2 pr-4 pb-20">
                          {sections.map((s) => (
                      <section
                              key={s.id}
                              id={s.id}
                              ref={(ref) => addSectionRef(s.id, ref)}
                              className="scroll-mt-6"
                            >
                           <div className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-6">
                                <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {sectionIcons[s.id]}
                                  {s.title}
                                </h3>
                                {s.content}
                                </div>
                            </section>
                          ))}
                              </div>
                    </ScrollArea>
                  </div>
                      </div>
              )
            })()}
                        </div>
          )}

          {activeTab === "website" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pr-4 pb-20">
              <div className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                    <div className="p-12 text-center">
                      <Globe className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Website Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-400">Website analysis content will be displayed here.</p>
                                  </div>
                                  </div>
                                </div>
              </ScrollArea>
                                    </div>
          )}

          {activeTab === "social" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pr-4 pb-20">
                  <div className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                    <div className="p-12 text-center">
                      <Megaphone className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Social Media Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-400">Social media analysis content will be displayed here.</p>
                                  </div>
                                    </div>
                      </div>
                    </ScrollArea>
                  </div>
          )}

          {activeTab === "news" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pr-4 pb-20 space-y-4">
                  <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Newspaper className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">News Analysis</h3>
                          <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                            {(newsAnalysis ?? SAMPLE_NEWS).summary}
                          </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                    <CardContent className="p-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Themes</h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(newsAnalysis ?? SAMPLE_NEWS).themes.map((t: { name: string; evidence_titles: string[] }) => (
                          <div key={t.name} className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
                              <Badge variant="outline" className="text-[10px]">{t.evidence_titles.length} refs</Badge>
                          </div>
                            <ul className="mt-2 list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                              {t.evidence_titles.slice(0,3).map((title: string) => (
                                <li key={title}>{title}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        </div>
                      </CardContent>
                    </Card>

                  

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                      <CardContent className="p-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Opportunities</h4>
                        <ul className="list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {(newsAnalysis ?? SAMPLE_NEWS).opportunities.map((o: string) => (
                            <li key={o}>{o}</li>
                              ))}
                            </ul>
                </CardContent>
              </Card>

                    <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                      <CardContent className="p-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Risks</h4>
                        <ul className="list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {(newsAnalysis ?? SAMPLE_NEWS).risks.map((r: string) => (
                            <li key={r}>{r}</li>
                              ))}
                            </ul>
                </CardContent>
              </Card>
            </div>
                  </div>
                </ScrollArea>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}
