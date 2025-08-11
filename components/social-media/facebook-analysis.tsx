"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Facebook, Users, Heart, MessageCircle, Share } from "lucide-react"
import { PlatformOverview } from "./platform-overview"
import { EngagementAverages } from "./engagement-averages"
import { PerformanceScoring } from "./performance-scoring"
import { ContentThemes } from "./content-themes"
import { PerformanceInsights } from "./performance-insights"
import { ImprovementOpportunities } from "./improvement-opportunities"
import { CommentsIntelligence } from "./comments-intelligence"

type FacebookAnalysisData = {
  success: boolean
  data: {
    id: string
    name: string
    description: string
    followers: number
    likes: number
    total_posts: number
    total_reactions: number
    total_comments: number
    total_shares: number
    avg_reactions: number
    avg_comments: number
    avg_shares: number
  }
  metadata: {
    page: string
    max_posts: number
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
      comments_intelligence?: {
        themes: { name: string; quote: string }[]
        faqs: { q: string; a: string }[]
        notes: string
      }
    }
  }
}

interface FacebookAnalysisProps {
  data?: FacebookAnalysisData
}

export function FacebookAnalysis({ data }: FacebookAnalysisProps) {
  if (!data?.success || !data?.data || !data?.report) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Facebook className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <h3 className="mb-2 font-semibold">No Facebook Data Available</h3>
          <p className="text-sm text-muted-foreground">Facebook analysis data will be displayed here when available.</p>
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
    { icon: Heart, value: formatNumber(data.data.likes), label: "Likes" },
    { icon: MessageCircle, value: formatNumber(data.data.total_comments), label: "Comments" },
    { icon: Share, value: formatNumber(data.data.total_shares), label: "Shares" },
  ]

  const averageMetrics = [
    { value: data.data.avg_reactions, label: "Reactions", color: "text-red-500" },
    { value: data.data.avg_comments, label: "Comments", color: "text-green-600" },
    { value: data.data.avg_shares, label: "Shares", color: "text-purple-600" },
  ]

  return (
    <div className="space-y-4">
      <PlatformOverview icon={Facebook} title={data.data.name} color="text-blue-600" metrics={metrics} />

      <EngagementAverages title="Average per Post" metrics={averageMetrics} />

      <PerformanceScoring scoring={data.report.scoring} />

      <ContentThemes topics={data.report.channel_summary.summary_of_topics} title="Post Topics" />

      {data.report.supporting_insights.comments_intelligence && (
        <CommentsIntelligence data={data.report.supporting_insights.comments_intelligence} />
      )}

      <PerformanceInsights
        topPerformers={data.report.supporting_insights.top_performers}
        bottomPerformers={data.report.supporting_insights.bottom_performers}
        topTitle="Top Posts"
        bottomTitle="Underperforming"
      />

      <ImprovementOpportunities
        opportunities={data.report.opportunities_for_improvement}
        actionPlans={data.report.action_plan}
      />
    </div>
  )
}
