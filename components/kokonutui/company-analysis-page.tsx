"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useSearchParams, useRouter } from "next/navigation"
import {
  selectOverview,
  selectNews,
  selectYouTube,
  selectTwitter,
  selectFacebook,
  updateSocialMediaFromResponse,
  loadCompetitorAnalysis,
  setAnalysisFromApi,
} from "@/store/slices/competitorAnalysisSlice"
import type { AppDispatch } from "@/store/store"
import {
  selectUserInfo,
  selectHasEnoughCreditsForCompetitorAnalysis,
  selectCompetitorAnalysisCost,
  selectRemainingCredits,
} from "@/store/slices/userSlice"
import { fetchAgents, selectAgents, selectAgentsStatus } from "@/store/slices/agentsSlice"
import { Tabs } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, refreshAccessToken } from "@/lib/utils"
import { SocialMediaDashboard } from "@/components/social-media/social-media-dashboard"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl } from "@/lib/config"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  ArrowRight,
  Loader2,
  Plus,
  SearchIcon,
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


type CompanyAnalysisPageProps = {
  projectId?: string
  companySlug?: string
  features?: FeatureItem[]
  plans?: PlanItem[]
  overview?: CompanyOverviewData
  youtubeAnalysis?: YouTubeAnalysis
  newsAnalysis?: NewsAnalysis
}

const SAMPLE_NEWS: NewsAnalysis = {
  summary: "No news analysis available.",
  themes: [],
  sentiment: { overall: "Neutral", by_theme: [] },
  risks: [],
  opportunities: [],
  notable_entities: [],
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
  const searchParams = useSearchParams()
  const competitorUrl = searchParams.get("competitor_url") || ""
  const dispatch = useDispatch<AppDispatch>()

  const agents = useSelector(selectAgents)
  const agentsStatus = useSelector(selectAgentsStatus)

  useEffect(() => {
    if (agentsStatus === "idle") {
      dispatch(fetchAgents() as any)
    }
  }, [agentsStatus, dispatch])

  const selectedAgent = agents[0]
  const resolvedProjectId = selectedAgent?.id?.toString() || projectId || ""

  // Redux selectors
  const overviewFromStore = useSelector(selectOverview) as any
  const newsFromStore = useSelector(selectNews) as any
  const youtubeFromStore = useSelector(selectYouTube) as any
  const twitterFromStore = useSelector(selectTwitter) as any
  const facebookFromStore = useSelector(selectFacebook) as any
  const user = useSelector(selectUserInfo) as any

  const [activeTab, setActiveTab] = useState<string>("overview")
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  const [newCompetitorUrl, setNewCompetitorUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)

  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  const hasEnoughCredits = useSelector(selectHasEnoughCreditsForCompetitorAnalysis)
  const competitorCost = useSelector(selectCompetitorAnalysisCost)
  const remainingCredits = useSelector(selectRemainingCredits)
  const isSubscriptionInactive = user?.subscription?.status === 'inactive'

  // Helper domain normalization & validation
  const validateUrl = (input: string): boolean => {
    if (!input.trim()) return false
    try {
      new URL(input)
      return true
    } catch {
      try {
        new URL(`https://${input}`)
        return true
      } catch {
        return false
      }
    }
  }

  useEffect(() => {
    if (!newCompetitorUrl) {
      setUrlError("")
      return
    }
    setUrlError(
      validateUrl(newCompetitorUrl) ? "" : "Enter a valid URL or domain (example.com)"
    )
  }, [newCompetitorUrl])

  // Fetch competitors for selection
  const queryKey = ["competitors", user?.id, resolvedProjectId]
  const competitorsQuery = useQuery({
    queryKey,
    enabled: !!user?.id && !!resolvedProjectId,
    queryFn: async ({ signal }) => {
      const res = await fetch(
        getApiUrl(`/company/competitor?user_id=${user?.id}&project_id=${resolvedProjectId}`),
        { signal }
      )
      if (!res.ok) throw new Error("Failed to fetch competitors")
      const json = await res.json()
      return (json?.data ?? []) as Array<{
        id: number
        status: string
        competitor_name: string
        competitor_description: string
        competitor_category: string
        competitor_source_id?: string
        our_source_id?: string
      }>
    },
  })

  const filteredCompetitors = (competitorsQuery.data ?? []).filter((comp) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase()
    return (
      (comp.competitor_name || "").toLowerCase().includes(q) ||
      (comp.competitor_source_id || "").toLowerCase().includes(q)
    )
  })

  // Load active competitor details if competitorUrl changes (e.g. page refresh)
  useEffect(() => {
    if (competitorUrl && user?.id && !overviewFromStore) {
      setIsLoadingAnalysis(true)
      dispatch(
        loadCompetitorAnalysis({
          ourUrl: selectedAgent?.website_url || "",
          competitorUrl: competitorUrl,
          userId: user?.id,
        })
      )
        .unwrap()
        .catch((err) => {
          console.error("Failed to load analysis:", err)
          toast({
            title: "Failed to load analysis",
            description: "An error occurred while fetching the analysis data.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoadingAnalysis(false)
        })
    }
  }, [competitorUrl, user?.id, dispatch, selectedAgent?.website_url, overviewFromStore])

  const createMutation = useMutation({
    mutationFn: async (body: {
      our_url: string
      competitor_url: string
      project_id: string
      user_id: number
      run_now: boolean
      scrape: boolean
      overview: boolean
      features: boolean
      pricing: boolean
      compare_features: boolean
      compare_pricing: boolean
      social_media: boolean
      youtube: boolean
      twitter: boolean
      facebook: boolean
      news: boolean
    }) => {
      let token = Cookies.get("access_token")
      let res = await fetch(getApiUrl(`/company/competitor`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        token = await refreshAccessToken()
        if (token) {
          res = await fetch(getApiUrl(`/company/competitor`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          })
        }
      }

      if (res.status === 402) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData?.detail || "Insufficient credits to create competitor."
        throw new Error(errorMessage)
      }

      if (!res.ok) throw new Error("Failed to create competitor")
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey })
      toast({
        title: "Competitor added and analysis started",
        description: `Analysis for ${variables.competitor_url} is now in progress.`,
      })

      const sourceId = variables.competitor_url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\./g, "_")

      const q = new URLSearchParams({
        source_id: sourceId,
        our_url: variables.our_url,
        competitor_url: variables.competitor_url,
      })
      router.push(`/company-analysis?${q.toString()}`)
      setNewCompetitorUrl("")
    },
    onError: (error: any) =>
      toast({
        title: "Analysis Failed",
        description: error?.message || "An error occurred while starting the competitor analysis.",
        variant: "destructive",
      }),
  })

  const handleAnalyzeNewCompetitor = () => {
    if (!user?.id || !resolvedProjectId || !newCompetitorUrl.trim()) return

    if (!hasEnoughCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${competitorCost} credits for competitor analysis, but you only have ${remainingCredits} credits remaining.`,
        variant: "destructive",
      })
      return
    }

    createMutation.mutate({
      our_url: selectedAgent?.website_url || "",
      competitor_url: newCompetitorUrl.trim(),
      project_id: resolvedProjectId,
      user_id: user?.id,
      run_now: true,
      scrape: true,
      overview: true,
      features: true,
      pricing: true,
      compare_features: true,
      compare_pricing: true,
      social_media: true,
      youtube: true,
      twitter: true,
      facebook: true,
      news: true,
    })
  }

  const handleSelectCompetitor = (row: any) => {
    const ourUrl = selectedAgent?.website_url || ""
    const competitorUrl = row.competitor_source_id
      ? `https://${row.competitor_source_id.replace(/_/g, ".").replace(/\.com$/i, ".com")}/`
      : `https://${row.competitor_name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com/`

    const sourceIdParam =
      row.competitor_source_id ||
      new URL(competitorUrl).hostname.replace(/^www\./, "").replace(/\./g, "_")

    setIsLoadingAnalysis(true)
    fetch(getApiUrl(`/company/competitor/analysis`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        project_id: resolvedProjectId,
        our_url: ourUrl,
        competitor_url: competitorUrl,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to request analysis")
        return res.json()
      })
      .then((data) => {
        dispatch(setAnalysisFromApi({ api: data }))
        const q = new URLSearchParams({
          source_id: sourceIdParam,
          our_url: ourUrl,
          competitor_url: competitorUrl,
        })
        router.push(`/company-analysis?${q.toString()}`)
      })
      .catch((err) => {
        console.error(err)
        toast({
          title: "Failed to open analysis",
          description: "An error occurred while loading this competitor's analysis.",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsLoadingAnalysis(false)
      })
  }

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
  if (isLoadingAnalysis) {
    return (
      <div className="h-full bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-800 dark:text-slate-200" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading company analysis...
          </p>
        </div>
      </div>
    )
  }

  if (!competitorUrl || !overviewFromStore) {
    return (
      <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Company Analysis
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Get an instant strategic overview of any competitor. Monitor their pricing tiers, key features, website footprint, social media channels, and top news.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Column 1: Add/Analyze a New Competitor */}
            <Card className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-primary" />
                Analyze a New Competitor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter a competitor's website URL to fetch their organizational overview, social networks, and public news highlights.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="competitor-input-url" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Website URL / Domain
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="competitor-input-url"
                      placeholder="e.g. competitorsite.com"
                      value={newCompetitorUrl}
                      onChange={(e) => {
                        setNewCompetitorUrl(e.target.value)
                      }}
                      className="pl-9 h-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !urlError && newCompetitorUrl.trim()) {
                          e.preventDefault()
                          handleAnalyzeNewCompetitor()
                        }
                      }}
                    />
                  </div>
                  {urlError && (
                    <p className="text-xs text-red-500 mt-1">{urlError}</p>
                  )}
                </div>

                {/* Credit Cost Indicator */}
                <div className="rounded-lg bg-gray-50 dark:bg-[#0F0F0F] border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Analysis Cost</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{competitorCost} credits</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Your Remaining Credits</span>
                    <span className={`font-semibold ${hasEnoughCredits ? 'text-green-600' : 'text-red-500'}`}>
                      {remainingCredits} credits
                    </span>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <div className="w-full">
                      <Button
                        className="w-full h-10 gap-2 font-medium"
                        onClick={handleAnalyzeNewCompetitor}
                        disabled={
                          !!urlError ||
                          !newCompetitorUrl.trim() ||
                          createMutation.isPending ||
                          isSubscriptionInactive ||
                          !hasEnoughCredits
                        }
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4" />
                            Start Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverTrigger>
                  {(isSubscriptionInactive || !hasEnoughCredits) && (
                    <PopoverContent className="w-80 p-4" side="bottom" align="center">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-black dark:text-white">
                          {isSubscriptionInactive ? "Subscription Inactive" : "Insufficient Credits"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {isSubscriptionInactive
                            ? "Your subscription is inactive. Please activate your plan to analyze competitors."
                            : `You need ${competitorCost} credits for competitor analysis, but you only have ${remainingCredits} credits remaining.`
                          }
                        </p>
                        <Button
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={() => router.push("/pricing")}
                        >
                          {isSubscriptionInactive ? "Activate Subscription" : "Purchase Credits"}
                        </Button>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              </div>
            </Card>

            {/* Column 2: Select Existing Competitor */}
            <Card className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] shadow-md p-6 h-[460px] flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                Select Existing Competitor
              </h2>

              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your competitors..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5">
                {competitorsQuery.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse bg-gray-50 dark:bg-[#0F0F0F]" />
                    ))}
                  </div>
                ) : competitorsQuery.isError ? (
                  <div className="text-center py-10 text-xs text-red-500">
                    Failed to fetch existing competitors.
                  </div>
                ) : filteredCompetitors.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">No competitors found.</p>
                  </div>
                ) : (
                  filteredCompetitors.map((comp) => {
                    const domain = comp.competitor_source_id
                      ? comp.competitor_source_id.replace(/_/g, ".")
                      : `${comp.competitor_name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`
                    
                    return (
                      <div
                        key={comp.id}
                        onClick={() => handleSelectCompetitor(comp)}
                        className="group flex items-center justify-between p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary bg-gray-50/50 hover:bg-primary/[0.02] dark:bg-[#0A0A0A] dark:hover:bg-primary/[0.01] transition-all cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary truncate">
                              {comp.competitor_name || "—"}
                            </span>
                            <Badge
                              variant={comp.status === "completed" ? "secondary" : "outline"}
                              className="text-[9px] px-1.5 py-0"
                            >
                              {comp.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 truncate block mt-0.5">
                            {domain}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{overviewFromStore?.company_name || "Company"}</h1>
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

                const ov = (overviewFromStore as CompanyOverviewData) ?? overviewProp ?? overviewSample

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
                  <SocialMediaDashboard
                    youtubeData={youtubeFromStore}
                    twitterData={twitterFromStore}
                    facebookData={facebookFromStore}
                    projectId={resolvedProjectId}
                    userId={user?.id}
                    companyUrl={competitorUrl}
                    onLinksUpdated={async (data) => {
                      // Update Redux store with social media analysis from the response
                      if (data) {
                        dispatch(updateSocialMediaFromResponse({ response: data }))
                      }
                      console.log("Social links updated:", data)
                    }}
                  />
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
                            {(newsFromStore?.summary ?? newsAnalysis ?? SAMPLE_NEWS).summary}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                    <CardContent className="p-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Themes</h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(newsFromStore?.themes ?? (newsAnalysis ?? SAMPLE_NEWS).themes).map((t: { name: string; evidence_titles: string[] }) => (
                          <div key={t.name} className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
                              <Badge variant="outline" className="text-[10px]">{t.evidence_titles.length} refs</Badge>
                            </div>
                            <ul className="mt-2 list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                              {t.evidence_titles.slice(0, 3).map((title: string) => (
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
                          {(newsFromStore?.opportunities ?? (newsAnalysis ?? SAMPLE_NEWS).opportunities).map((o: string) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="rounded border border-gray-200 dark:border-[#1A1A1A] bg-transparent dark:bg-transparent">
                      <CardContent className="p-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Risks</h4>
                        <ul className="list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {(newsFromStore?.risks ?? (newsAnalysis ?? SAMPLE_NEWS).risks).map((r: string) => (
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
