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
import { CompetitiveOverview } from "@/components/website/competitive-overview"
import { SwotAnalysis } from "@/components/website/swot-analysis"
import { HeadToHead } from "@/components/website/head-to-head"
import { Recommendations } from "@/components/website/recommendations"
import { PricingPlans } from "@/components/website/pricing-plans"
import { MarketAnalysis } from "@/components/website/market-analysis"
import Layout from "@/components/kokonutui/layout"

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
  youtubeAnalysis?: any
  twitterAnalysis?: any
  facebookAnalysis?: any
  newsAnalysis?: NewsAnalysis
}

export default function CompanyAnalysisPage({
  projectId,
  companySlug,
  features: featuresProp,
  plans: plansProp,
  overview: overviewProp,
  youtubeAnalysis,
  twitterAnalysis,
  facebookAnalysis,
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

  const sampleYouTubeData = {
    success: true,
    data: {
      channel_id: "UCsJ0VeziRFiiVABMKNRaFBw",
      title: "Hexnode",
      description:
        "Hexnode UEM is an industry-leading endpoint management solution that offers a rich set of features aimed at securing, managing, and remotely monitoring devices within the enterprise. Evolving to accommodate the latest technologies and industry trends, Hexnode serves businesses of all sizes, from start-ups to Fortune 100 companies, with the best business mobility experience. Its reputation is concreted with success stories from satisfied customers across the globe, spanning almost a decade.\n\nHexnode hosts its annual events such as partner summits and user conferences building a global community of IT professionals, enthusiasts and industry experts. They have been featured in many reputed magazines such as TechRadar, Bloomberg, CIO, etc. and have also earned several awards for its technical excellence and performance throughout the years.\n\nTo learn more about Hexnode, try the 30-day free trial or visit www.hexnode.com today!\n",
      subscribers: 12800,
      total_views: 1476,
      total_likes: 11,
      total_comments: 0,
      total_videos: 259,
      avg_views: 134.1818181818182,
      avg_engagement: 0.007934353643134011,
    },
    metadata: {
      channel_url: "https://www.youtube.com/c/hexnode",
      max_videos: 50,
      days: 180,
      include_comments: false,
      max_comments_per_video: 20,
    },
    report: {
      channel_summary: {
        number_of_videos: 13,
        activity: "irregular",
        summary_of_topics: [
          "Events (Black Hat, RSAC, MWC, HIMSS, RTS, HexCon)",
          "Customer Success Stories",
          "Product Updates (Hexnode Genie, UEM MSP)",
          "IT Automation",
          "Device Management Strategies",
        ],
        examples: [
          {
            title: "Hexnode at Black Hat USA 2025 - Exploring Cybersecurity and Endpoint management | Highlights video",
            description:
              "Team Hexnode had a rewarding experience at Black Hat USA 2025, held at Mandalay Bay, Las Vegas.",
          },
          {
            title:
              "Empowering POS Systems: Joe & the Juice's Global Device Management Strategy | Hexnode Success Story",
            description:
              "Andrei Vornicu, Systems Administrator at Joe & the Juice, shares how Hexnode became their go-to solution for managing 2000+ iPads deployed across their global retail locations.",
          },
        ],
      },
      scoring: {
        number_of_videos: {
          score: 3,
          reason: "13 videos in the last 180 days is a low volume of content.",
        },
        activity: {
          score: 2,
          reason:
            "The posting schedule is irregular, with videos uploaded in bursts rather than consistently over time.",
        },
        engagement: {
          score: 3,
          reason:
            "Engagement is low. The weighted engagement rate is very low, and very few videos have high views or engagement.",
        },
        relevancy: {
          score: 10,
          reason:
            "The content is highly relevant to Hexnode's UEM offerings, focusing on endpoint management, cybersecurity, and customer success.",
        },
        total_channel_score: 4.5,
      },
      opportunities_for_improvement: [
        {
          category: "content_gaps",
          title: "Address Specific Pain Points and FAQs",
          rationale:
            "The channel lacks content directly addressing specific pain points and frequently asked questions related to UEM implementation and troubleshooting. Creating content around these topics would likely increase engagement and provide valuable resources for potential customers.",
          sample_titles: [
            "Top 5 UEM Challenges and How to Overcome Them with Hexnode",
            "Hexnode FAQ: Troubleshooting Common Device Enrollment Issues",
          ],
        },
        {
          category: "format_mix",
          title: "Experiment with Shorter, More Engaging Content",
          rationale:
            "The channel primarily features longer videos (1-3 minutes). Creating shorter, more focused videos (under 60 seconds) can increase engagement and improve view duration, especially when highlighting specific features or addressing quick tips.",
          sample_titles: [
            "Hexnode Tip: Remotely Lock a Lost Device in Seconds",
            "3 Reasons to Choose Hexnode for Your Business",
          ],
        },
      ],
      action_plan: [
        {
          objective: "Increase channel engagement and views by creating shorter, more focused content.",
          hypothesis:
            "Shorter videos (under 60 seconds) with compelling visuals and clear calls to action will generate higher engagement rates and views compared to longer videos.",
          actions: [
            "Identify 3-5 key Hexnode features or benefits that can be explained in under 60 seconds.",
            "Create visually appealing short videos (using screen recordings, animations, or short talking-head clips) highlighting these features.",
            "Optimize titles and thumbnails with attention-grabbing headlines and visuals.",
          ],
        },
      ],
      supporting_insights: {
        formats_and_length: [
          "Videos <60s: No videos in this category.",
          "Videos 1-5m: Most videos fall into this category. Performance is mixed.",
        ],
        top_performers: [
          {
            title:
              "Empowering POS Systems: Joe & the Juice's Global Device Management Strategy | Hexnode Success Story",
            reason:
              "Highest views (339), likely due to a clear success story format and a recognizable brand (Joe & the Juice).",
          },
        ],
        bottom_performers: [
          {
            title: "Hexnode at Black Hat USA 2025 - Exploring Cybersecurity and Endpoint management | Highlights video",
            reason: "Lowest views (53), possibly due to the event highlight format not resonating broadly.",
          },
        ],
        trends: [
          "The last 5 videos have slightly lower mean views compared to the prior 5.",
          "The focus remains on event highlights and customer success stories.",
        ],
      },
    },
  }

  const sampleTwitterData = {
    success: true,
    data: {
      id: "2922760149",
      name: "Hexnode",
      screen_name: "thehexnode",
      description:
        "Automating Everywhere Workplace by unifying and managing the endpoints from a single console. For support, visit- https://t.co/ORx09YfE8Y",
      followers: 17982,
      following: 987,
      total_tweets: 15,
      total_likes: 10890,
      total_retweets: 2876,
      total_replies: 1034,
      total_quotes: 218,
      avg_likes: 726,
      avg_retweets: 191.73333333333332,
      avg_replies: 68.93333333333334,
      avg_quotes: 14.533333333333333,
    },
    metadata: {
      user: "thehexnode",
      max_tweets: 50,
      days: 60,
    },
    report: {
      channel_summary: {
        number_of_videos: 0,
        activity: "consistent",
        summary_of_topics: [
          "Endpoint Management",
          "Digital Employee Experience (DEX)",
          "Cybersecurity",
          "Mobile App Security",
          "Partnerships",
          "Events (Black Hat USA, HexCon)",
          "Company Anniversary",
          "Employee Wellness",
          "African Digital Workforce",
        ],
        examples: [
          {
            title: "Digital Employee Experience",
            description:
              "Posts discussing the importance of DEX in boosting productivity and focus, and announcing related webinars.",
          },
          {
            title: "Mobile App Security",
            description:
              "Posts highlighting mobile app vulnerabilities and solutions, including partnerships with security firms.",
          },
        ],
      },
      scoring: {
        number_of_videos: {
          score: 1,
          reason: "No videos were present in the provided data.",
        },
        activity: {
          score: 7,
          reason:
            "Posting cadence is roughly consistent, with posts occurring approximately every 3-4 days. While not 'highly consistent', it maintains a regular presence.",
        },
        engagement: {
          score: 3,
          reason:
            "Low engagement across most posts. The mean and median total engagement are low, indicating limited interaction. One tweet from Grok skewed the average significantly.",
        },
        relevancy: {
          score: 8,
          reason:
            "Content is highly relevant to Hexnode's endpoint management and security solutions. The topics cover key areas like DEX, mobile security, and industry events.",
        },
        total_channel_score: 4.75,
      },
      opportunities_for_improvement: [
        {
          category: "engagement",
          title: "Increase Audience Engagement",
          rationale:
            "Low engagement rates suggest content isn't resonating strongly with the target audience. Focus on interactive content and compelling calls to action to boost likes, retweets, and replies.",
          sample_titles: [
            "Run polls on endpoint management challenges",
            "Ask questions related to DEX in posts",
            "Create short video explainers of Hexnode features",
          ],
        },
      ],
      action_plan: [
        {
          objective: "Increase average engagement per tweet by 50% within 3 months.",
          hypothesis:
            "By diversifying content formats and incorporating more interactive elements, we can capture greater audience attention and drive higher engagement.",
          actions: [
            "Create 3-5 short demo videos showcasing key Hexnode features.",
            "Run weekly polls or Q&A sessions on Twitter related to endpoint management.",
            "Develop visually appealing infographics to explain complex cybersecurity topics.",
          ],
        },
      ],
      supporting_insights: {
        formats_and_length: [
          "Primarily text-based updates with links to external resources.",
          "Tweet length varies, but generally within the character limit.",
        ],
        top_performers: [
          {
            title: "Generate videos in just a few seconds. Try Grok Imagine, free for a limited time.",
            reason:
              "This tweet from Grok (not Hexnode) gained significant traction due to its broad appeal and the novelty of AI-powered video generation. It is an outlier in this dataset.",
          },
        ],
        bottom_performers: [
          {
            title:
              "Technology should empower, not exhaust!!... Digital Employee Experience (DEX) is fast becoming a boardroom-level priority.",
            reason:
              "Low engagement could be due to the lengthy text and lack of a compelling visual or immediate call to action.",
          },
        ],
        trends: [
          "The last 10 tweets have a slightly higher mean engagement (excluding Grok's post) compared to the prior tweets, possibly due to the focus on events and partnerships. However, overall engagement remains low.",
        ],
      },
    },
  }

  const sampleFacebookData = {
    success: true,
    data: {
      id: "100063578093997",
      name: "Hexnode",
      description:
        "Hexnode UEM is a leading endpoint management solution that offers a rich set of features aimed at securing, managing, and remotely monitoring devices within the enterprise.",
      followers: 15000,
      likes: 17000,
      total_posts: 21,
      total_reactions: 12,
      total_comments: 5,
      total_shares: 4,
      avg_reactions: 0.5714285714285714,
      avg_comments: 0.23809523809523808,
      avg_shares: 0.19047619047619047,
    },
    metadata: {
      page: "https://www.facebook.com/Hexnode/",
      max_posts: 50,
      days: 60,
    },
    report: {
      channel_summary: {
        number_of_videos: 0,
        activity: "highly_consistent",
        summary_of_topics: [
          "Endpoint Management (UEM)",
          "Cybersecurity",
          "Digital Employee Experience (DEX)",
          "Hexnode Events (HexCon, Black Hat, Globe Summit)",
          "Mobile App Security",
          "Partnerships and Integrations (Quokka, Inflow Technologies)",
          "Windows/iOS Management",
          "Company Anniversary/Culture",
        ],
        examples: [
          {
            title: "Hexnode Live - Digital Employee Experience",
            description:
              "Promotion of a LinkedIn Live event discussing Digital Employee Experience (DEX) and how to build a seamless digital workplace.",
          },
          {
            title: "Black Hat USA 2025",
            description:
              "Posts related to Hexnode's participation in the Black Hat USA 2025 cybersecurity event, showcasing their UEM solution.",
          },
        ],
      },
      scoring: {
        number_of_videos: {
          score: 1,
          reason: "No video content detected in the provided data.",
        },
        activity: {
          score: 10,
          reason:
            "Posts are consistently published, almost daily or every other day, indicating a highly consistent activity level.",
        },
        engagement: {
          score: 3,
          reason:
            "Low average engagement (reactions, comments, shares) per post. Most posts have very little to no engagement. Few posts have comments or shares, indicating most engagement is reaction-based.",
        },
        relevancy: {
          score: 10,
          reason:
            "Content is highly relevant to Hexnode's UEM solution, cybersecurity, and related industry events and partnerships.",
        },
        total_channel_score: 6,
      },
      opportunities_for_improvement: [
        {
          category: "engagement",
          title: "Increase Post Engagement",
          rationale:
            "Current engagement levels (reactions, comments, shares) are low. Focus on content that encourages interaction and discussion. Asking direct questions and prompting responses can increase engagement.",
          sample_titles: [
            "Ask questions related to endpoint management challenges.",
            "Run polls on device preferences and security practices.",
            "Request user stories about successful UEM implementations.",
          ],
        },
      ],
      action_plan: [
        {
          objective: "Increase average post engagement by 50% in the next 60 days.",
          hypothesis:
            "By diversifying content formats and actively prompting audience interaction, we can significantly increase engagement.",
          actions: [
            "Develop 3 short explainer videos on key UEM features.",
            "Incorporate a question or poll in at least 50% of posts.",
            "Run a contest or giveaway to encourage participation.",
          ],
        },
      ],
      supporting_insights: {
        formats_and_length: [
          "Posts are primarily text-based with embedded links. Length varies from short announcements to longer, more detailed descriptions of events and features.",
        ],
        top_performers: [
          {
            title: "Hexnode at Globe Business's GSummit2025 in Manila!",
            reason: "Highest reactions, potentially driven by event participation and visual content (photos).",
          },
        ],
        bottom_performers: [
          {
            title:
              "We are delighted to welcome Michele Pelino, Vice President and Principal Analyst at Forrester Research",
            reason: "No engagement, potentially due to lack of visual content or a less compelling message.",
          },
        ],
        trends: [
          "Engagement is generally low across all posts. Recent posts show a slight increase in the use of hashtags and mentions of specific events (Black Hat, HexCon), but this has not translated into significantly higher engagement.",
        ],
        comments_intelligence: {
          themes: [
            {
              name: "Product interest",
              quote: "Comments indicate some user interest in specific features or integrations.",
            },
          ],
          faqs: [
            {
              q: "Where can I find more information about Hexnode's features?",
              a: "Visit our website or contact our sales team for a demo.",
            },
            {
              q: "Does Hexnode integrate with other security solutions?",
              a: "Yes, Hexnode integrates with various security solutions, including Quokka. Please check our website or contact us for a full list.",
            },
          ],
          notes:
            "Limited comments available for deeper analysis. Users express general interest in product features and integrations. More proactive solicitation of feedback would be helpful.",
        },
      },
    },
  }

  return (
    <Layout>
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

                return (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 pr-4 pb-20">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <OverviewCard
                          title="Mission"
                          icon={<Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        >
                          {ov.mission_statement}
                        </OverviewCard>
                        <OverviewCard
                          title="Vision"
                          icon={<Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        >
                          {ov.vision}
                        </OverviewCard>
                      </div>

                      {ov.growth_metrics && Object.values(ov.growth_metrics).some(Boolean) && (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Growth Metrics
                          </h2>
                          <MetricsDashboard metrics={ov.growth_metrics} />
                        </div>
                      )}

                      {ov.key_milestones && ov.key_milestones.length > 0 && (
                        <TimelineView milestones={ov.key_milestones} />
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {ov.core_values && ov.core_values.length > 0 && (
                          <OverviewCard
                            title="Core Values"
                            icon={<Heart className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            <div className="flex flex-wrap gap-2">
                              {ov.core_values.map((v: string) => (
                                <span
                                  key={v}
                                  className="inline-flex items-center rounded-none bg-gray-100 dark:bg-[#0F0F0F] px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          </OverviewCard>
                        )}

                        {ov.business_model && (
                          <OverviewCard
                            title="Business Model"
                            icon={<Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            {ov.business_model}
                          </OverviewCard>
                        )}

                        {ov.value_proposition && (
                          <OverviewCard
                            title="Value Proposition"
                            icon={<Lightbulb className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            {ov.value_proposition}
                          </OverviewCard>
                        )}

                        {ov.target_market && (
                          <OverviewCard
                            title="Target Market"
                            icon={<Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            {ov.target_market}
                          </OverviewCard>
                        )}
                      </div>

                      {ov.customer_segments && ov.customer_segments.length > 0 && (
                        <OverviewCard
                          title="Customer Segments"
                          icon={<Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          className="lg:col-span-2"
                        >
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {ov.customer_segments.map((s: string) => (
                              <div
                                key={s}
                                className="rounded-none border border-gray-200 dark:border-[#1A1A1A] bg-gray-50 dark:bg-gray-900 p-2 text-center"
                              >
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{s}</span>
                              </div>
                            ))}
                          </div>
                        </OverviewCard>
                      )}

                      {ov.leadership_team && ov.leadership_team.length > 0 && (
                        <OverviewCard
                          title="Leadership Team"
                          icon={<Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        >
                          <div className="space-y-2">
                            {ov.leadership_team.map((l: string) => (
                              <div key={l} className="flex items-center gap-2 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                                {l}
                              </div>
                            ))}
                          </div>
                        </OverviewCard>
                      )}

                      <div className="space-y-4">
                        {ov.founding_history && (
                          <OverviewCard
                            title="Founding History"
                            icon={<History className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            {ov.founding_history}
                          </OverviewCard>
                        )}

                        {ov.competitive_positioning && (
                          <OverviewCard
                            title="Competitive Positioning"
                            icon={<TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                          >
                            {ov.competitive_positioning}
                          </OverviewCard>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                )
              })()}
            </div>
          )}

          {activeTab === "website" && (
            <div className="mt-0 h-full flex flex-col min-h-0">
              <Tabs defaultValue="competitive" className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-center mb-4">
                  <TabsList className="inline-flex h-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400">
                    <TabsTrigger
                      value="competitive"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-100"
                    >
                      <BarChart2 className="h-4 w-4 mr-1.5" />
                      Competitive
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
                  <TabsContent value="competitive" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="pr-4 pb-20 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Competitive Overview
                            </h2>
                          </div>
                          <CompetitiveOverview
                            data={{
                              ours: {
                                name: "hexnode",
                                features: [
                                  {
                                    feature_name: "Restricted Browsing",
                                    description:
                                      "Restrict access to URLs by blacklisting or whitelisting them within the Hexnode Kiosk Browser.",
                                    category: "Kiosk Browser",
                                    technical_depth: "Intermediate",
                                    implementation_scale: "Partial",
                                  },
                                  {
                                    feature_name: "Auto Launch Web Apps",
                                    description:
                                      "Set a specific website as the default to automatically open upon device boot in the Hexnode Kiosk Browser.",
                                    category: "Kiosk Browser",
                                    technical_depth: "Intermediate",
                                    implementation_scale: "Complete",
                                  },
                                  {
                                    feature_name: "Unified Endpoint Management",
                                    description:
                                      "Centralize management of mobiles, PCs and wearables in the enterprise.",
                                    category: "Unified Endpoint Management",
                                    technical_depth: "Surface-level",
                                    implementation_scale: "Enterprise-grade",
                                  },
                                ],
                              },
                              competitor: {
                                name: "scalefusion",
                                features: [
                                  {
                                    feature_name: "Authentication",
                                    description: "Validates user credentials through IdP integration.",
                                    category: "Zero Trust Access",
                                    technical_depth: "Intermediate",
                                    implementation_scale: "Enterprise-grade",
                                  },
                                  {
                                    feature_name: "Web Content Filtering",
                                    description:
                                      "Enforces granular access controls over internet usage, leveraging category-based filtering and custom policy rules.",
                                    category: "Security",
                                    technical_depth: "Intermediate",
                                    implementation_scale: "Enterprise-grade",
                                  },
                                ],
                              },
                            }}
                            report={{
                              unique_to_ours: [
                                {
                                  name: "Kiosk Browser Features",
                                  reason: "Scalefusion doesn't explicitly list Kiosk Browser capabilities.",
                                },
                                {
                                  name: "XR Management",
                                  reason: "Scalefusion does not explicitly list XR management capabilities.",
                                },
                              ],
                              unique_to_competitor: [
                                {
                                  name: "Zero Trust Access",
                                  reason: "Hexnode does not explicitly list this specific authentication approach.",
                                },
                              ],
                              common_features: [
                                {
                                  name: "Unified Endpoint Management",
                                  notes: "Both offer UEM capabilities with different focus areas.",
                                },
                              ],
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Feature Comparison
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
                                strengths: [
                                  "Comprehensive feature set covering Kiosk, App, Expense, Patch, XR, and Security Management.",
                                  "Strong Kiosk browser capabilities.",
                                  "Extensive reporting and auditing features.",
                                ],
                                weaknesses: [
                                  "Surface-level description of UEM capabilities may not convey depth.",
                                  "Lacks explicit focus on Authentication and Authorization compared to Scalefusion's Zero Trust Access features.",
                                ],
                                opportunities: [
                                  "Highlight depth of UEM features with case studies or more detailed descriptions.",
                                  "Integrate with IdPs to enhance authentication capabilities.",
                                ],
                                threats: [
                                  "Scalefusion's focused Zero Trust Access offering could be appealing to security-conscious customers.",
                                ],
                              },
                              swot_competitor: {
                                strengths: [
                                  "Strong Zero Trust Access offering with Authentication, Authorization, and Conditional SSO.",
                                  "Web Content Filtering provides granular control over internet usage.",
                                ],
                                weaknesses: [
                                  "Limited feature set compared to Hexnode.",
                                  "Lacks explicit features in Kiosk Management, XR Management and extensive reporting.",
                                  "Does not explicitly address patch management",
                                ],
                                opportunities: [
                                  "Expand feature set to include Kiosk and XR management.",
                                  "Develop more detailed reporting capabilities.",
                                ],
                                threats: [
                                  "Hexnode's broader feature set may be more attractive to organizations with diverse needs.",
                                ],
                              },
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Head-to-Head Comparison
                            </h2>
                          </div>
                          <HeadToHead
                            report={{
                              head_to_head: {
                                areas_we_lead: [
                                  "Kiosk Management (Browser, Lockdown)",
                                  "XR Management",
                                  "Expense Management",
                                  "Comprehensive Reporting and Auditing",
                                  "Patch Management",
                                ],
                                areas_competitor_leads: [
                                  "Zero Trust Access (Authentication, Authorization, Conditional SSO)",
                                  "Web Content Filtering",
                                ],
                                parity: ["Unified Endpoint Management (basic)"],
                              },
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Strategic Recommendations
                            </h2>
                          </div>
                          <Recommendations
                            report={{
                              recommendations: [
                                {
                                  priority: "medium",
                                  item: "Emphasize the depth of existing UEM features in marketing materials.",
                                  rationale:
                                    "Counteract the 'surface-level' perception and showcase the full capabilities of Hexnode's UEM offering.",
                                },
                                {
                                  priority: "medium",
                                  item: "Integrate with popular Identity Providers (IdPs) to enhance authentication capabilities.",
                                  rationale:
                                    "Address the competitive advantage of Scalefusion's Authentication feature within Zero Trust Access.",
                                },
                                {
                                  priority: "low",
                                  item: "Consider adding a broader web content filtering feature.",
                                  rationale:
                                    "While restricted browsing exists, category-based filtering could be a valuable addition.",
                                },
                              ],
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
                            plans={[
                              {
                                name: "Pro",
                                tier: 1,
                                description: "Advanced MDM + Kiosk Essentials",
                                pricing: {
                                  monthly: { amount: 2.2, unit: "per device/month", currency: "USD" },
                                  annual: {
                                    amount: 2.4,
                                    unit: "per device/month",
                                    currency: "USD",
                                    effective_discount: "10%",
                                  },
                                  custom_pricing: false,
                                },
                                feature_matrix: {
                                  core: [
                                    "MDM and Kiosk Android and iOS",
                                    "Location Tracking Android and iOS",
                                    "Apple Business Manager Integration",
                                    "Android Enterprise integration",
                                    "ZTE and Knox Enrollment Android",
                                    "2FA for Technicians",
                                  ],
                                },
                                trial: { duration_days: 14 },
                              },
                              {
                                name: "Enterprise",
                                tier: 2,
                                description: "Basic UEM + Advanced Kiosk",
                                pricing: {
                                  monthly: { amount: 3.2, unit: "per device/month", currency: "USD" },
                                  annual: {
                                    amount: 3.6,
                                    unit: "per device/month",
                                    currency: "USD",
                                    effective_discount: "10%",
                                  },
                                  custom_pricing: false,
                                },
                                feature_matrix: {
                                  core: [
                                    "Everything in Pro",
                                    "Basic Desktop Management macOS and Windows",
                                    "Remote View for Mobile Devices",
                                    "TV Management",
                                    "Roles for Technicians",
                                    "Update Management for Mobile Devices",
                                    "Geofencing",
                                  ],
                                },
                                trial: { duration_days: 14 },
                              },
                              {
                                name: "Ultimate",
                                tier: 3,
                                description: "Advanced UEM + Enterprise Security",
                                pricing: {
                                  monthly: { amount: null, unit: "per device/month", currency: "USD" },
                                  annual: { amount: null, unit: "per device/month", currency: "USD" },
                                  custom_pricing: true,
                                },
                                feature_matrix: {
                                  core: [
                                    "Everything in Enterprise",
                                    "Remote Control",
                                    "Update Management for Desktop Devices",
                                    "Web Content Filtering",
                                    "Mobile Threat Defense",
                                    "Mobile Expense Management",
                                  ],
                                },
                                trial: { duration_days: 14 },
                              },
                              {
                                name: "Ultra",
                                tier: 4,
                                description: "Elite UEM + Zero Trust Security",
                                pricing: {
                                  monthly: { amount: null, unit: "per device/month", currency: "USD" },
                                  annual: { amount: null, unit: "per device/month", currency: "USD" },
                                  custom_pricing: true,
                                },
                                feature_matrix: {
                                  core: [
                                    "Everything in Ultimate",
                                    "Zero Trust Security",
                                    "Conditional Access",
                                    "Endpoint Compliance Management",
                                    "SOAR Integration",
                                    "AISense",
                                  ],
                                },
                                trial: { duration_days: 14 },
                              },
                            ]}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Market Analysis</h2>
                          </div>
                          <MarketAnalysis
                            data={{
                              price_ranges: {
                                low: 2.2,
                                median: 2.7,
                                high: 3.2,
                              },
                            }}
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
                        <YouTubeAnalysis data={youtubeAnalysis || sampleYouTubeData} />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="twitter" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="px-4 pb-4">
                        <TwitterAnalysis data={twitterAnalysis || sampleTwitterData} />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="facebook" className="mt-0 h-full">
                    <ScrollArea className="h-full">
                      <div className="px-4 pb-4">
                        <FacebookAnalysis data={facebookAnalysis || sampleFacebookData} />
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
                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Newspaper className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Summary</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {(newsAnalysis ?? SAMPLE_NEWS).summary}
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sentiment</h4>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {(newsAnalysis ?? SAMPLE_NEWS).sentiment.overall}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">By Theme</div>
                        <div className="space-y-1">
                          {(newsAnalysis ?? SAMPLE_NEWS).sentiment.by_theme
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
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Key Themes</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {(newsAnalysis ?? SAMPLE_NEWS).themes.length} themes identified
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(newsAnalysis ?? SAMPLE_NEWS).themes.map((t: { name: string; evidence_titles: string[] }) => (
                        <div
                          key={t.name}
                          className="group p-3 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-sm"
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
                          <div className="space-y-1">
                            {t.evidence_titles.slice(0, 2).map((title: string, idx: number) => (
                              <div key={title} className="flex items-start gap-1.5">
                                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                  {title}
                                </span>
                              </div>
                            ))}
                            {t.evidence_titles.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                                +{t.evidence_titles.length - 2} more articles
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Opportunities</h4>
                      </div>
                      <div className="space-y-2">
                        {(newsAnalysis ?? SAMPLE_NEWS).opportunities.map((o: string, index: number) => (
                          <div key={o} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="text-green-600 dark:text-green-400 font-medium">{index + 1}.</span>
                            <span className="leading-relaxed">{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Risks</h4>
                      </div>
                      <div className="space-y-2">
                        {(newsAnalysis ?? SAMPLE_NEWS).risks.map((r: string, index: number) => (
                          <div key={r} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="text-red-600 dark:text-red-400 font-medium">{index + 1}.</span>
                            <span className="leading-relaxed">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notable Entities</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(newsAnalysis ?? SAMPLE_NEWS).notable_entities.map((entity: string) => (
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
