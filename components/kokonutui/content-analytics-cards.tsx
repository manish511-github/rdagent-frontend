"use client"

import { useState } from "react"
import {
  FileText,
  Eye,
  ThumbsUp,
  Share2,
  MessageSquare,
  BarChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for content analytics
const CONTENT_DATA = {
  topPerforming: [
    {
      id: "1",
      title: "10 Ways AI is Transforming Marketing in 2025",
      type: "Blog Post",
      views: 3245,
      engagement: 8.7,
      shares: 142,
      comments: 38,
      trend: "up",
    },
    {
      id: "2",
      title: "Case Study: How We Increased Conversion by 45%",
      type: "Case Study",
      views: 1876,
      engagement: 6.2,
      shares: 87,
      comments: 24,
      trend: "up",
    },
    {
      id: "3",
      title: "The Future of Social Media Marketing",
      type: "Whitepaper",
      views: 1543,
      engagement: 5.8,
      shares: 65,
      comments: 19,
      trend: "stable",
    },
    {
      id: "4",
      title: "Product Demo: New Features Explained",
      type: "Video",
      views: 982,
      engagement: 4.3,
      shares: 34,
      comments: 12,
      trend: "down",
    },
  ],
  contentMetrics: {
    totalContent: 87,
    avgEngagement: "5.4%",
    avgTimeOnPage: "3m 12s",
    conversionRate: "2.8%",
  },
  contentTypes: {
    blogPosts: 42,
    videos: 18,
    infographics: 15,
    whitepapers: 7,
    caseStudies: 5,
  },
}

// Helper function to get trend icon
const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  return <BarChart className="h-3.5 w-3.5 text-amber-500" />
}

// Helper function to get content type icon
const getContentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "blog post":
      return <FileText className="h-3.5 w-3.5" />
    case "video":
      return <Eye className="h-3.5 w-3.5" />
    case "whitepaper":
      return <FileText className="h-3.5 w-3.5" />
    case "case study":
      return <FileText className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

export default function ContentAnalyticsCards() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [contentData, setContentData] = useState(CONTENT_DATA)

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Create slightly modified data to simulate updates
      const updatedData = { ...contentData }

      // Make small random changes to metrics
      updatedData.topPerforming.forEach((content) => {
        content.views += Math.floor(Math.random() * 50) - 10
        content.engagement = Number.parseFloat((content.engagement + (Math.random() * 0.6 - 0.3)).toFixed(1))
        content.shares += Math.floor(Math.random() * 10) - 3
        content.comments += Math.floor(Math.random() * 5) - 2
      })

      setContentData(updatedData)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1200)
  }

  // Format time for last updated
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Analytics</h3>
          <p className="text-sm text-muted-foreground">Performance metrics for your content</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last updated: {formatLastUpdated()}</span>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing} className="h-8">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content Metrics Summary */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-blue-50/30 via-card to-blue-50/10 dark:from-blue-950/10 dark:via-card dark:to-blue-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BarChart className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Content Metrics</h4>
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                Summary
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Content</span>
                <span className="font-medium text-lg">{contentData.contentMetrics.totalContent}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Avg. Engagement</span>
                <span className="font-medium text-lg">{contentData.contentMetrics.avgEngagement}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Avg. Time on Page</span>
                <span className="font-medium text-lg">{contentData.contentMetrics.avgTimeOnPage}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Conversion Rate</span>
                <span className="font-medium text-lg">{contentData.contentMetrics.conversionRate}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40">
              <h5 className="text-xs font-medium mb-2">Content Distribution</h5>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(contentData.contentTypes).map(([type, count], index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="h-16 w-full bg-muted/50 rounded-md relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-600"
                        style={{
                          height: `${((count as number) / contentData.contentMetrics.totalContent) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                      {type.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-emerald-50/30 via-card to-emerald-50/10 dark:from-emerald-950/10 dark:via-card dark:to-emerald-950/5 shadow-sm lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Top Performing Content</h4>
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                Last 30 Days
              </Badge>
            </div>

            <div className="space-y-3">
              {contentData.topPerforming.map((content) => (
                <div
                  key={content.id}
                  className="p-2.5 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-md bg-muted/70 text-foreground mt-0.5">
                        {getContentTypeIcon(content.type)}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm line-clamp-1">{content.title}</h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {content.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {content.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {getTrendIcon(content.trend)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{content.engagement}% engagement</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Share2 className="h-3 w-3" />
                      <span>{content.shares} shares</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{content.comments} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
