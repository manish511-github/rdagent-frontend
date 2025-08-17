"use client"

import type React from "react"
import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { PlatformOverview } from "@/components/social-media/platform-overview"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Globe, TrendingUp, Timer, MousePointer2, ArrowDownUp, BarChart2 } from "lucide-react"

type TopCountryShare = {
  Country: number
  CountryCode: string
  Value: number
}

type Engagements = {
  BounceRate: string
  Month: string
  Year: string
  PagePerVisit: string
  Visits: string
  TimeOnSite: string
}

type RankInfo = {
  Rank: number | string
}

type CountryRank = {
  Country: number
  CountryCode: string
  Rank: number
}

type TrafficSources = {
  [k: string]: number
}

type TopKeyword = {
  Name: string
  EstimatedValue: number
  Volume: number
  Cpc: number | null
}

export type SeoTrafficData = {
  Version: number
  SiteName: string
  Title: string
  Description: string
  LargeScreenshot?: string
  TopCountryShares: TopCountryShare[]
  Engagments: Engagements
  EstimatedMonthlyVisits: Record<string, number>
  GlobalRank: RankInfo
  CountryRank: CountryRank
  CategoryRank: { Rank: string | number; Category: string }
  TrafficSources: TrafficSources
  TopKeywords?: TopKeyword[]
}

function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`
}

function formatNumber(n: number) {
  return n.toLocaleString()
}

function formatSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function SeoTraffic({ data }: { data: SeoTrafficData | null | undefined }) {
  // Handle null/undefined data
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 rounded-none">
          <div className="flex flex-col items-center justify-center text-center">
            <Globe className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No SEO Data Available</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              SEO traffic data is not available for this competitor. This could be due to insufficient data or the analysis is still in progress.
            </p>
          </div>
        </div>
      </div>
    )
  }
  const visitsSeries = useMemo(() => {
    const entries = Object.entries(data.EstimatedMonthlyVisits)
    entries.sort(([a], [b]) => a.localeCompare(b))
    return entries.map(([date, value]) => ({ date: date.slice(0, 7), visits: value }))
  }, [data])

  const trafficSources = useMemo(() => {
    return Object.entries(data.TrafficSources).map(([name, value]) => ({ name, value }))
  }, [data])

  const countryShares = useMemo(() => {
    return (data.TopCountryShares || []).slice(0, 5).map((c) => ({
      code: c.CountryCode,
      value: c.Value,
    }))
  }, [data])

  const mom = useMemo(() => {
    if (visitsSeries.length < 2) return null
    const prev = visitsSeries[visitsSeries.length - 2].visits
    const curr = visitsSeries[visitsSeries.length - 1].visits
    if (!prev) return null
    const delta = curr - prev
    const pct = (delta / prev) * 100
    return { prev, curr, delta, pct }
  }, [visitsSeries])

  const channelMix = useMemo(() => {
    const organic = data.TrafficSources["Search"] ?? 0
    const paid = data.TrafficSources["Paid Referrals"] ?? 0
    const nonSearch = Math.max(0, 1 - organic)
    return { organic, paid, nonSearch }
  }, [data])

  const top5Concentration = useMemo(() => {
    return countryShares.reduce((sum, c) => sum + c.value, 0)
  }, [countryShares])

  const keywordInsights = useMemo(() => {
    const list = data.TopKeywords || []
    if (!list.length) return null
    const count = list.length
    const totalVolume = list.reduce((s, k) => s + (k.Volume || 0), 0)
    const cpcs = list.map((k) => k.Cpc).filter((v): v is number => typeof v === "number")
    const avgCpc = cpcs.length ? cpcs.reduce((s, v) => s + v, 0) / cpcs.length : null
    const maxCpc = cpcs.length ? Math.max(...cpcs) : null
    const maxCpcKeyword = maxCpc !== null ? list.find((k) => k.Cpc === maxCpc)?.Name : null
    const topVolume = list.reduce((max, k) => (k.Volume > (max?.Volume || 0) ? k : max), list[0])
    const totalEstimatedValue = list.reduce((s, k) => s + (k.EstimatedValue || 0), 0)
    return {
      count,
      totalVolume,
      avgCpc,
      maxCpc,
      maxCpcKeyword,
      topVolumeKeyword: topVolume?.Name,
      topVolume: topVolume?.Volume,
      totalEstimatedValue,
    }
  }, [data])

  const chartConfig = {
    visits: {
      label: "Estimated Monthly Visits",
      color: "hsl(220, 90%, 56%)",
    },
  } as const

  const pieColors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Amber
    "#ec4899", // Pink
  ]

  const engagements = data.Engagments

  const overviewMetrics = [
    { icon: MousePointer2, value: formatNumber(Number(engagements.Visits)), label: "Visits" },
    { icon: ArrowDownUp, value: `${(Number(engagements.BounceRate) * 100).toFixed(1)}%`, label: "Bounce Rate" },
    { icon: BarChart2, value: Number(engagements.PagePerVisit).toFixed(2), label: "Pages/Visit" },
    { icon: Timer, value: formatSeconds(Number(engagements.TimeOnSite)), label: "Avg Time" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlatformOverview icon={Globe} title={data.SiteName} subtitle="SEO Traffic" color="text-blue-600" metrics={overviewMetrics} />
        </div>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Global Rank</div>
              <div className="text-lg font-semibold">{formatNumber(Number(data.GlobalRank.Rank))}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Country Rank ({data.CountryRank.CountryCode})</div>
              <div className="text-lg font-semibold">{formatNumber(Number(data.CountryRank.Rank))}</div>
            </div>
                         <div className="col-span-2">
               <div className="text-xs text-gray-500">Category Rank</div>
               <div className="flex items-center gap-2">
                 <div className="text-sm font-medium text-gray-900 dark:text-gray-100">#{String(data.CategoryRank.Rank)}</div>
                 <div className="text-xs text-gray-500 truncate" title={data.CategoryRank.Category}>• {data.CategoryRank.Category.replaceAll("_", " ")}</div>
               </div>
             </div>
          </div>
        </Card>
      </div>

      

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Estimated Monthly Visits</h3>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={visitsSeries} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickMargin={12} 
                fontSize={12} 
                stroke="#6b7280"
                tickLine={false}
              />
              <YAxis 
                width={50} 
                fontSize={12} 
                stroke="#6b7280"
                tickLine={false}
                tickFormatter={(v) => `${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2, fill: "#ffffff" }}
              />
            </LineChart>
          </ChartContainer>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Traffic Sources</h3>
            <div className="text-[11px] text-gray-500">Top source: {trafficSources.slice().sort((a,b)=>b.value-a.value)[0]?.name}</div>
          </div>
          <div className="flex items-center gap-6">
            <ChartContainer config={{}} className="h-56 w-56">
              <PieChart>
                <Pie data={trafficSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                  {trafficSources.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid gap-2 text-sm">
              {trafficSources.map((s, idx) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="w-32 capitalize text-gray-700 dark:text-gray-300">{s.name}</span>
                  <span className="text-gray-900 dark:text-gray-100 text-base">{formatPercent(s.value, 1)}</span>
                </div>
              ))}
            </div>
          </div>

        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Top Countries</h3>
            <div className="text-[11px] text-gray-500">Top 5 concentration: {formatPercent(top5Concentration, 1)}</div>
          </div>
          <div className="space-y-2">
            {countryShares.map((c) => (
              <div key={c.code} className="flex items-center gap-2">
                <span className="w-10 text-xs text-gray-500">{c.code}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800">
                  <div className="h-2 bg-gray-900 dark:bg-gray-100" style={{ width: formatPercent(c.value, 0) }} />
                </div>
                <span className="w-12 text-right text-xs">{formatPercent(c.value, 1)}</span>
              </div>
            ))}
          </div>
        </Card>

        {data.TopKeywords && data.TopKeywords.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 rounded-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Top Keywords</h3>
              {keywordInsights && (
                <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                  <span>Count: <span className="font-medium text-gray-900 dark:text-gray-100">{keywordInsights.count}</span></span>
                  <span>Total Vol: <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(keywordInsights.totalVolume)}</span></span>
                  <span>Avg CPC: <span className="font-medium text-gray-900 dark:text-gray-100">{keywordInsights.avgCpc === null ? "—" : `$${keywordInsights.avgCpc.toFixed(2)}`}</span></span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 text-[11px] text-gray-500 mb-1">
              <div className="col-span-2">Keyword</div>
              <div>Volume</div>
              <div>Est. Value</div>
              <div>CPC</div>
            </div>
            <div className="space-y-1">
              {data.TopKeywords.slice(0, 5).map((k) => (
                <div key={k.Name} className="grid grid-cols-5 items-center text-xs">
                  <div className="col-span-2 text-gray-900 dark:text-gray-100 truncate">{k.Name}</div>
                  <div className="text-gray-900 dark:text-gray-100">{formatNumber(k.Volume)}</div>
                  <div className="text-gray-900 dark:text-gray-100">{formatNumber(k.EstimatedValue)}</div>
                  <div className="text-gray-900 dark:text-gray-100">{k.Cpc === null ? "—" : `$${k.Cpc.toFixed(2)}`}</div>
                </div>
              ))}
            </div>
            {keywordInsights && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                <div>Top Vol: <span className="font-medium text-gray-900 dark:text-gray-100">{keywordInsights.topVolumeKeyword} ({formatNumber(keywordInsights.topVolume || 0)})</span></div>
                <div>Max CPC: <span className="font-medium text-gray-900 dark:text-gray-100">{keywordInsights.maxCpc === null ? "—" : `$${keywordInsights.maxCpc.toFixed(2)}`} {keywordInsights.maxCpcKeyword ? `(${keywordInsights.maxCpcKeyword})` : ""}</span></div>
                <div>Total Est. Value: <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(keywordInsights.totalEstimatedValue)}</span></div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default SeoTraffic


