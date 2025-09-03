"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Removed multi-select Checkbox for single-add flow
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Building2, Globe, Loader2, Plus, Sparkles, LayoutGrid, ListIcon, Filter, SlidersHorizontal, ChevronDown, SearchIcon } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { selectUserInfo } from "@/store/slices/userSlice"
import { selectCurrentProject } from "@/store/slices/currentProjectSlice"
import DataTable from "@/components/kokonutui/competitors-table/data-table"
import { columns as competitorColumns, type CompetitorRow } from "@/components/kokonutui/competitors-table/columns"
import { setAnalysisFromApi } from "@/store/slices/competitorAnalysisSlice"
import { getApiUrl } from "@/lib/config"
import Cookies from "js-cookie"
import { refreshAccessToken } from "@/lib/utils"

type Competitor = {
  name: string
  slug: string
  founded: string
  industry: string
  headline: string
  website?: string
  imageUrl?: string
  metrics?: { score?: number }
  status?: string
  competitorSourceId?: string
}

const COMPETITORS: Competitor[] = [
  {
    name: "Acme Corp",
    slug: "acme",
    founded: "2014",
    industry: "B2B SaaS",
    headline: "Leading platform for enterprise customer engagement",
  },
  {
    name: "Globex",
    slug: "globex",
    founded: "2016",
    industry: "Analytics",
    headline: "AI-powered marketing analytics for modern teams",
  },
  {
    name: "Initech",
    slug: "initech",
    founded: "2012",
    industry: "Automation",
    headline: "Workflow automation to scale operations faster",
  },
  {
    name: "Umbrella",
    slug: "umbrella",
    founded: "2010",
    industry: "Security",
    headline: "Security-first platform for critical infrastructure",
  },
  {
    name: "Stark Industries",
    slug: "stark",
    founded: "2008",
    industry: "AI Platform",
    headline: "Intelligent agent platform for GTM orgs",
  },
]

// API helpers
async function fetchCompetitors(userId: number, projectId: string, signal?: AbortSignal) {
  const res = await fetch(getApiUrl(`/company/competitor?user_id=${userId}&project_id=${projectId}`), { signal })
  if (!res.ok) throw new Error('Failed to fetch competitors')
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
}

async function fetchCompetitorSuggestions(projectUuid: string, signal?: AbortSignal) {
  let token = Cookies.get("access_token");
  let response = await fetch(getApiUrl(`/company/competitor/suggest?project_uuid=${projectUuid}&k=5`), {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      'accept': 'application/json'
    },
  });

  // If unauthorized, try to refresh the token and retry once
  if (response.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      response = await fetch(getApiUrl(`/company/competitor/suggest?project_uuid=${projectUuid}&k=5`), {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json'
        },
      });
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch competitor suggestions");
  }

  const json = await response.json();
  return json?.data?.suggestions ?? [];
}



async function postCompetitor(body: {
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
}) {
  const res = await fetch(getApiUrl(`/company/competitor`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create competitor')
  return res.json()
}

export default function CompetitorsPage({ projectId }: { projectId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const user = useSelector(selectUserInfo)
  const currentProject = useSelector(selectCurrentProject)
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [activeTab, setActiveTab] = useState<string>("url")
  const [urlError, setUrlError] = useState<string>("")
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  // Single-add flow; no multi-select needed
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(new Set())

  // Helpers to normalize website domains for comparison
  const normalizeDomain = (value: string): string => {
    try {
      if (!value) return ""
      let input = value.trim()
      if (!/^https?:\/\//i.test(input)) {
        input = `https://${input}`
      }
      const url = new URL(input)
      return url.hostname.toLowerCase().replace(/^www\./, "")
    } catch {
      return value.toLowerCase().replace(/^www\./, "")
    }
  }
  const sourceIdToDomain = (sourceId?: string): string => {
    if (!sourceId) return ""
    return sourceId.replace(/_/g, ".").toLowerCase().replace(/^www\./, "")
  }

  // Toolbar and derived list state
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = useState<"name" | "industry">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all")

  // Server data via TanStack Query
  const userId = user?.id
  const resolvedProjectId = currentProject?.uuid ?? projectId

  // Fetch suggestions from API
  const suggestionsQuery = useQuery({
    queryKey: ["competitor-suggestions", resolvedProjectId],
    enabled: !!resolvedProjectId,
    queryFn: ({ signal }) => fetchCompetitorSuggestions(resolvedProjectId as string, signal),
  })

  const queryKey = ["competitors", userId, resolvedProjectId]
  const competitorsQuery = useQuery({
    queryKey,
    enabled: !!userId && !!resolvedProjectId,
    queryFn: ({ signal }) => fetchCompetitors(userId as number, resolvedProjectId as string, signal),
    refetchInterval: (data) => (Array.isArray(data) && data.some((c: any) => c.status === 'running') ? 5000 : false),
  })

  const suggested = suggestionsQuery.data || []
 
   const isEnabled = !!userId && !!resolvedProjectId
   const isPending = !isEnabled || competitorsQuery.isLoading

  const existingDomains = useMemo(() => {
    const set = new Set<string>()
    // From already added/loaded competitors in local state
    competitors.forEach((c) => {
      if (c.website) set.add(normalizeDomain(c.website))
    })
    // From API competitors in the table/grid
    ;(competitorsQuery.data as any[] | undefined)?.forEach((row) => {
      if (row?.competitor_source_id) set.add(sourceIdToDomain(row.competitor_source_id))
    })
    // From hidden suggestions this session
    hiddenSuggestions.forEach((d) => set.add(d))
    return set
  }, [competitors, competitorsQuery.data, hiddenSuggestions])
  const visibleSuggested = (suggested as any[]).filter(
    (s: any) => !existingDomains.has(normalizeDomain(s.website || ""))
  )

  const filteredAndSorted = useMemo(() => {
    // Don't compute if data is still loading
    if (isPending) {
      return []
    }
    
    let data = [...competitors]
    if (query.trim()) {
      const q = query.toLowerCase()
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.industry || "").toLowerCase().includes(q) ||
        (c.headline || "").toLowerCase().includes(q)
      )
    }
    // Placeholder: statusFilter depends on backend-provided statuses; keeping all for now
    if (statusFilter !== "all") {
      data = data.filter(() => true)
    }
    data.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir
      return (a.industry || "").localeCompare(b.industry || "") * dir
    })
    return data
  }, [competitors, query, sortBy, sortDirection, statusFilter, isPending])

  useEffect(() => {
    if (competitorsQuery.data) {
      // Map API data into local Competitor shape (show only completed details)
      const mapped: Competitor[] = competitorsQuery.data.map((row: any) => ({
        name: row.status === 'completed' ? row.competitor_name : row.competitor_name || '—',
        slug: (row.competitor_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        founded: '—',
        industry: row.status === 'completed' ? row.competitor_category : '—',
        headline: row.status === 'completed' ? row.competitor_description : `Status: ${row.status}`,
        website: undefined,
        metrics: undefined,
        status: row.status,
        competitorSourceId: row.competitor_source_id,
      }))
      setCompetitors(mapped)
    }
  }, [competitorsQuery.data])

  const createMutation = useMutation({
    mutationFn: postCompetitor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast({ title: 'Failed to create competitor', variant: 'destructive' })
  })

  // Fetch competitor details mutation
  const fetchDetailsMutation = useMutation({
    mutationFn: async (competitorUrl: string) => {
      let token = Cookies.get("access_token");
      let response = await fetch(getApiUrl(`/company/competitor`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          our_url: currentProject?.website_url || '',
          competitor_url: competitorUrl,
          project_id: resolvedProjectId,
          user_id: userId as number,
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
          news: true
        })
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl(`/company/competitor`), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              our_url: currentProject?.website_url || '',
              competitor_url: competitorUrl,
              project_id: resolvedProjectId,
              user_id: userId as number,
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
              news: true
            })
          });
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch competitor details");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey })
      toast({ title: 'Competitor analysis started', description: 'We\'re analyzing the competitor. This may take a few minutes.' })
      // You can add navigation to the analysis page here if needed
    },
    onError: () => toast({ title: 'Failed to analyze competitor', variant: 'destructive' })
  })

  // Delete competitor mutation
  const deleteMutation = useMutation({
    mutationFn: async (competitorId: number) => {
      const res = await fetch(getApiUrl(`/company/competitor/${competitorId}`), {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete competitor')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast({ title: 'Competitor deleted successfully' })
    },
    onError: () => toast({ title: 'Failed to delete competitor', variant: 'destructive' })
  })

  // Refresh competitor mutation
  const refreshMutation = useMutation({
    mutationFn: async (competitorId: number) => {
      // Get the competitor data from TanStack query
      const competitor = competitorsQuery.data?.find((c: any) => c.id === competitorId)
      if (!competitor) throw new Error('Competitor not found')
      
      // Build competitor URL from source_id (same logic as in handleOpen)
      const competitorUrl = competitor.competitor_source_id
        ? `https://${competitor.competitor_source_id.replace(/_/g, ".").replace(/\.com$/i, ".com")}/`
        : `https://${competitor.competitor_name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com/`
      
      const res = await fetch(getApiUrl(`/company/competitor`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          our_url: currentProject?.website_url || '',
          competitor_url: competitorUrl,
          project_id: resolvedProjectId,
          user_id: userId,
          run_now: true,
          scrape: true,
          overview: true,
          features: true,
          pricing: true,
          seo: true,
          compare_features: true,
          compare_pricing: true,
          social_media: true,
          youtube: true,
          twitter: true,
          facebook: true,
          news: true
        }),
      })
      if (!res.ok) throw new Error('Failed to refresh competitor')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast({ title: 'Competitor refresh initiated' })
    },
    onError: () => toast({ title: 'Failed to refresh competitor', variant: 'destructive' })
  })

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleRefresh = (id: number) => {
    refreshMutation.mutate(id)
  }

  const handleOpen = (row: { name: string; competitorSourceId?: string }) => {
    const ourUrl = currentProject?.website_url || ""
    // Build competitor_url from source id: hexnode_com => https://hexnode.com/
    const competitorUrl = row.competitorSourceId
      ? `https://${row.competitorSourceId.replace(/_/g, ".").replace(/\.com$/i, ".com")}/`
      : `https://${row.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com/`

    const companySlug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const sourceIdParam = row.competitorSourceId || new URL(competitorUrl).hostname.replace(/^www\./, '').replace(/\./g, '_')
    analysisMutation.mutate(
      {
        user_id: userId as number,
        project_id: resolvedProjectId as string,
        our_url: ourUrl,
        competitor_url: competitorUrl,
      },
      {
        onSettled: () => {
          const q = new URLSearchParams({
            source_id: sourceIdParam,
            our_url: ourUrl,
            competitor_url: competitorUrl,
          })
          router.push(`/projects/${projectId}/company-analysis?${q.toString()}`)
        },
      },
    )
  }

  const analysisMutation = useMutation({
    mutationFn: async (body: { user_id: number; project_id: string; our_url: string; competitor_url: string }) => {
      const res = await fetch(getApiUrl(`/company/competitor/analysis`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to request analysis')
      return res.json()
    },
    onSuccess: (data) => {
      // Refetch competitors after triggering analysis
      queryClient.invalidateQueries({ queryKey })
      dispatch(setAnalysisFromApi({ api: data }))
    },
  })

  function bodySlugFromUrl(sourceId?: string) {
    if (!sourceId) return ""
    return sourceId.replace(/_com$/i, "").toLowerCase()
  }

  function handleCreateCompetitor() {
    if (!userId || !resolvedProjectId || !websiteUrl.trim()) return
    createMutation.mutate({
      our_url: currentProject?.website_url || '',
      competitor_url: websiteUrl.trim(),
      project_id: resolvedProjectId,
      user_id: userId,
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
    setShowAddDialog(false)
    setWebsiteUrl("")
  }

  function deriveSlugFromUrl(url: string): { slug: string; hostname: string } {
    try {
      const u = new URL(url)
      const host = u.hostname.replace(/^www\./, "")
      const slug = host.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase()
      return { slug, hostname: host }
    } catch {
      const cleaned = url.replace(/^https?:\/\//, "").replace(/^www\./, "")
      const host = cleaned.split("/")[0]
      const slug = host.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase()
      return { slug, hostname: host }
    }
  }

  const { slug: previewSlug, hostname: previewHost } = useMemo(() => deriveSlugFromUrl(websiteUrl.trim() || ""), [websiteUrl])

  function validateUrl(input: string): boolean {
    if (!input.trim()) return false
    try {
      // Try native URL; if it fails, try prefixing https://
      // eslint-disable-next-line no-new
      new URL(input)
      return true
    } catch {
      try {
        // eslint-disable-next-line no-new
        new URL(`https://${input}`)
        return true
      } catch {
        return false
      }
    }
  }

  useEffect(() => {
    if (!websiteUrl) {
      setUrlError("")
      return
    }
    setUrlError(validateUrl(websiteUrl) ? "" : "Enter a valid URL or domain (example.com)")
  }, [websiteUrl])

  function handleQuickAddSuggestion(s: { company_name: string; website: string; description: string }) {
    const { slug } = deriveSlugFromUrl(s.website)
    const comp: Competitor = { 
      name: s.company_name, 
      slug, 
      founded: '—', 
      industry: '—', 
      headline: s.description, 
      website: s.website 
    }
    setCompetitors((prev) => [comp, ...prev])
    // Hide this suggestion going forward
    const key = (s.website || "").toLowerCase()
    setHiddenSuggestions((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    
    // Fetch competitor details from API
    const competitorUrl = s.website.startsWith('http') ? s.website : `https://${s.website}`
    fetchDetailsMutation.mutate(competitorUrl)
    
    toast({ title: "Competitor added", description: `${s.company_name} added to your list and analysis started.` })
    // Close modal after adding
    setShowAddDialog(false)
  }

  // Single-add flow: no toggle for suggestions

  // Single-add flow: remove bulk add handler

  // Reset modal state on close
  useEffect(() => {
    if (!showAddDialog) {
      setWebsiteUrl("")
      setUrlError("")
      setIsAdding(false)
      setActiveTab("url")
    }
  }, [showAddDialog])

  return (
    <section className="py-4 md:py-0">
      <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          
        </div>

        {/* Add Competitor Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full rounded-md overflow-hidden">
          <div className="w-full px-4 md:px-6 py-8 md:py-5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2.5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Competitors Analysis
              </h2>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl font-normal">Boost your market strategy by adding a competitor via URL or explore our tailored suggestions to stay ahead in the game.</p>
              <div className="flex gap-2 pt-1">
                <Button className="gap-1.5 h-7 text-xs bg-white text-slate-900 hover:bg-white/90" onClick={() => { setActiveTab("url"); setShowAddDialog(true) }}>
                  <Plus className="h-3 w-3" /> Add competitor
                </Button>

              </div>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="relative w-full md:w-[220px] h-[140px] rounded-lg overflow-hidden shadow-xl">
                <img alt="Creative workflow" className="object-cover w-full h-full" src="/images/analysis.png" />
              </div>
          </div>
          </div>
        </div>

        {/* Competitors List */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium">All competitors</h2>
            {!isPending && (
              <span className="text-xs text-muted-foreground opacity-80">({competitors.length} total)</span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-2 pb-2 w-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md p-0.5 h-7">
                <Button variant={(view === 'grid' ? 'default' : 'ghost') as 'default' | 'ghost'} size="icon" className="h-6 w-6 rounded-sm" onClick={() => setView('grid')}>
                  <LayoutGrid className="h-3 w-3" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button variant={(view === 'list' ? 'default' : 'ghost') as 'default' | 'ghost'} size="icon" className="h-6 w-6 rounded-sm" onClick={() => setView('list')}>
                  <ListIcon className="h-3 w-3" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 text-xs gap-1 px-2">
                    <Filter className="h-3 w-3" />
                    <span className="whitespace-nowrap">Filtered by</span>
                    <div className="inline-flex items-center rounded-full border py-0.5 border-transparent bg-primary text-primary-foreground text-[10px] h-4 px-1">
                      {statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Archived"}
                    </div>
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                    Archived
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setQuery("")}>
                    Clear name filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 text-xs gap-1 px-2">
                    <SlidersHorizontal className="h-3 w-3" />
                    <span className="whitespace-nowrap">Sort</span>
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortBy("name"); setSortDirection("asc") }}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("name"); setSortDirection("desc") }}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortBy("industry"); setSortDirection("asc") }}>
                    Industry (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy("industry"); setSortDirection("desc") }}>
                    Industry (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search competitors..."
                  className="w-[200px] h-7 text-xs pl-7 pr-2"
                />
            </div>
              <Button className="h-7 text-xs gap-1 px-2.5" onClick={() => { setActiveTab('url'); setShowAddDialog(true) }}>
                <Plus className="h-3 w-3" />
                <span>Add competitor</span>
              </Button>
            </div>
          </div>

          {/* Loading / Error / Empty states */}
          {isPending && (
            <div className="space-y-2 border-t py-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/6" />
            </div>
          )}
          {competitorsQuery.isError && (
            <div className="text-sm text-destructive border-t py-4">Failed to load competitors.</div>
          )}
          {!isPending && !competitorsQuery.isError && filteredAndSorted.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No competitors yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Add a competitor to start analyzing your market position and gain valuable insights.
              </p>
            </div>
          )}

          {/* Only show table/grid when data is loaded and not empty */}
          {!isPending && !competitorsQuery.isError && filteredAndSorted.length > 0 && (
            <>
              {view === 'list' ? (
                <div className="mt-2">
                  <DataTable
                    columns={competitorColumns}
                    data={filteredAndSorted.map<CompetitorRow>((c) => {
                      const apiItem = competitorsQuery.data?.find((apiItem: any) => apiItem.competitor_source_id === c.competitorSourceId)
                      const website = apiItem?.competitor_source_id
                        ? `https://www.${apiItem.competitor_source_id.replace(/_/g, ".").replace(/\.com$/i, ".com")}/`
                        : undefined
                      
                      return {
                        name: c.name,
                        category: c.industry,
                        description: c.headline,
                        website: website,
                        status: c.status,
                        id: apiItem?.id,
                        competitorSourceId: apiItem?.competitor_source_id,
                        ourSourceId: apiItem?.our_source_id,
                        onDelete: handleDelete,
                        onRefresh: handleRefresh,
                        onOpen: handleOpen,
                      }
                    })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {filteredAndSorted.map((c, idx) => {
                    const apiItem = competitorsQuery.data?.find((apiItem: any) => apiItem.competitor_name === c.name)
                    const sourceId = apiItem?.competitor_source_id as string | undefined
                    const compUrl = sourceId
                      ? `https://${sourceId.replace(/_/g, ".").replace(/\.com$/i, ".com")}/`
                      : `https://${c.slug.replace(/-/g, '')}.com/`
                    const q = new URLSearchParams({
                      company: c.slug,
                      ...(sourceId ? { source_id: sourceId } : {}),
                      ...(currentProject?.website_url ? { our_url: currentProject.website_url } : {}),
                      competitor_url: compUrl,
                    })
                    return (
                      <Link key={`${c.slug}-${idx}`} href={`/projects/${projectId}/company-analysis?${q.toString()}`} className="block">
                        <Card className="hover:bg-accent/40 transition">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {c.name}
                      </div>
                              {c.status && (
                                <Badge variant={c.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px]">
                                  {c.status}
                                </Badge>
                              )}
                    </div>
                            <div className="text-sm text-muted-foreground mt-1">{c.industry}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.headline}</div>
                          </CardContent>
                        </Card>
                    </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Competitor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add competitors</DialogTitle>
            <DialogDescription>Paste a website URL or choose from suggestions.</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="text-sm">By URL</TabsTrigger>
              <TabsTrigger value="suggestions" className="text-sm">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="competitor-url">Website URL</Label>
                <div className="relative flex-1">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="competitor-url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="pl-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !urlError && websiteUrl.trim()) {
                        e.preventDefault()
                        handleCreateCompetitor()
                      }
                    }}
                  />
                </div>
                {websiteUrl && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {/* eslint-disable-next-line @next/next/no-img-element */}

                  </div>
                )}
                {urlError && <p className="text-xs text-destructive">{urlError}</p>}
              </div>
              <div className="flex items-center justify-between">

              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-3 mt-3">
              <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                {suggestionsQuery.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between gap-3 border rounded-md p-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Skeleton className="h-4 w-4 mt-0.5" />
                          <div className="min-w-0 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : suggestionsQuery.isError ? (
                  <div className="text-sm text-destructive text-center py-4 space-y-3">
                    <p>Failed to load suggestions.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => suggestionsQuery.refetch()}
                      disabled={suggestionsQuery.isRefetching}
                      className="gap-2"
                    >
                      {suggestionsQuery.isRefetching && <Loader2 className="h-3 w-3 animate-spin" />}
                      Try Again
                    </Button>
                  </div>
                ) : (
                  visibleSuggested.map((s: any) => (
                  <div
                    key={s.website}
                    className="flex items-center justify-between gap-3 rounded-md p-3 border bg-white/70 dark:bg-gray-900/50 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/30"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="min-w-0 space-y-1">
                        <div className="text-sm font-medium flex items-center gap-2 min-w-0">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={s.company_name}>{s.company_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 min-w-0">
                          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate" title={s.website}>{s.website}</span>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 break-words">
                          {s.description}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-3 whitespace-nowrap"
                      onClick={() => handleQuickAddSuggestion(s)}
                      disabled={fetchDetailsMutation.isPending}
                    >
                      {fetchDetailsMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Analyzing
                        </>
                      ) : (
                        <>Add</>
                      )}
                    </Button>
                  </div>
                ))
                )}
              </div>
              {/* Single-add flow: no bulk actions */}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Close</Button>
            <Button onClick={handleCreateCompetitor} disabled={!!urlError || !websiteUrl.trim() || createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

