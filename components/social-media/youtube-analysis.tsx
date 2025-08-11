"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Youtube, Users, Eye, ThumbsUp, Video } from "lucide-react"
import { PlatformOverview } from "./platform-overview"
import { PerformanceScoring } from "./performance-scoring"
import { ContentThemes } from "./content-themes"
import { PerformanceInsights } from "./performance-insights"
import { ImprovementOpportunities } from "./improvement-opportunities"

type YouTubeAnalysisData = {
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
    max_videos: number
    days: number
    include_comments: boolean
    max_comments_per_video: number
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
      sample_titles?: string[]
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
    }
  }
}

interface YouTubeAnalysisProps {
  data?: YouTubeAnalysisData
}

export function YouTubeAnalysis({ data }: YouTubeAnalysisProps) {
  if (!data?.success || !data?.data || !data?.report) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Youtube className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <h3 className="mb-2 font-semibold">No YouTube Data Available</h3>
          <p className="text-sm text-muted-foreground">YouTube analysis data will be displayed here when available.</p>
        </CardContent>
      </Card>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const metrics = [
    { icon: Users, value: formatNumber(data.data.subscribers), label: "Subscribers" },
    { icon: Eye, value: formatNumber(data.data.total_views), label: "Views" },
    { icon: Video, value: data.data.total_videos, label: "Videos" },
    { icon: ThumbsUp, value: formatNumber(data.data.total_likes), label: "Likes" },
  ]

  return (
    <div className="space-y-4">
      <PlatformOverview icon={Youtube} title={data.data.title} color="text-red-500" metrics={metrics} />

      <PerformanceScoring scoring={data.report.scoring} />

      <ContentThemes topics={data.report.channel_summary.summary_of_topics} />

      <PerformanceInsights
        topPerformers={data.report.supporting_insights.top_performers}
        bottomPerformers={data.report.supporting_insights.bottom_performers}
        topTitle="Top Performers"
        bottomTitle="Areas to Improve"
      />

      <ImprovementOpportunities
        opportunities={data.report.opportunities_for_improvement}
        actionPlans={data.report.action_plan}
      />
    </div>
  )
}
