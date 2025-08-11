"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Twitter, Users, Heart, Repeat, MessageCircle, Quote } from "lucide-react"
import { PlatformOverview } from "./platform-overview"
import { EngagementAverages } from "./engagement-averages"
import { PerformanceScoring } from "./performance-scoring"
import { ContentThemes } from "./content-themes"
import { PerformanceInsights } from "./performance-insights"
import { ImprovementOpportunities } from "./improvement-opportunities"

type TwitterAnalysisData = {
  success: boolean
  data: {
    id: string
    name: string
    screen_name: string
    description: string
    followers: number
    following: number
    total_tweets: number
    total_likes: number
    total_retweets: number
    total_replies: number
    total_quotes: number
    avg_likes: number
    avg_retweets: number
    avg_replies: number
    avg_quotes: number
  }
  metadata: {
    user: string
    max_tweets: number
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

interface TwitterAnalysisProps {
  data?: TwitterAnalysisData
}

export function TwitterAnalysis({ data }: TwitterAnalysisProps) {
  if (!data?.success || !data?.data || !data?.report) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Twitter className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <h3 className="mb-2 font-semibold">No Twitter Data Available</h3>
          <p className="text-sm text-muted-foreground">Twitter analysis data will be displayed here when available.</p>
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
    { icon: Users, value: formatNumber(data.data.followers), label: "Followers" },
    { icon: Heart, value: formatNumber(data.data.total_likes), label: "Likes" },
    { icon: Repeat, value: formatNumber(data.data.total_retweets), label: "Retweets" },
    { icon: MessageCircle, value: formatNumber(data.data.total_replies), label: "Replies" },
    { icon: Quote, value: formatNumber(data.data.total_quotes), label: "Quotes" },
  ]

  const averageMetrics = [
    { value: Math.round(data.data.avg_likes), label: "Likes", color: "text-red-500" },
    { value: Math.round(data.data.avg_retweets), label: "Retweets", color: "text-green-600" },
    { value: Math.round(data.data.avg_replies), label: "Replies", color: "text-purple-600" },
    { value: Math.round(data.data.avg_quotes), label: "Quotes", color: "text-orange-600" },
  ]

  return (
    <div className="space-y-4">
      <PlatformOverview icon={Twitter} title={`@${data.data.screen_name}`} color="text-blue-500" metrics={metrics} />

      <EngagementAverages title="Average per Tweet" metrics={averageMetrics} />

      <PerformanceScoring scoring={data.report.scoring} />

      <ContentThemes topics={data.report.channel_summary.summary_of_topics} title="Tweet Topics" />

      <PerformanceInsights
        topPerformers={data.report.supporting_insights.top_performers}
        bottomPerformers={data.report.supporting_insights.bottom_performers}
        topTitle="Top Tweets"
        bottomTitle="Underperforming"
      />

      <ImprovementOpportunities
        opportunities={data.report.opportunities_for_improvement}
        actionPlans={data.report.action_plan}
      />
    </div>
  )
}
