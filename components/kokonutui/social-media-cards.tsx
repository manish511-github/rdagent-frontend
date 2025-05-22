"use client"

import { useState } from "react"
import { Twitter, Linkedin, Instagram, RefreshCw, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Reddit icon component since it's not available in lucide-react
const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8c2.648 0 5.028.826 6.675 2.14a2.5 2.5 0 0 1 2.326-1.64 2.5 2.5 0 0 1 2.5 2.5c0 1.278-.96 2.33-2.2 2.47A7.664 7.664 0 0 1 12 16a7.664 7.664 0 0 1-9.3-3.53 2.5 2.5 0 0 1-2.2-2.47 2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.325 1.64A12.078 12.078 0 0 1 12 8Z" />
    <path d="M17.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path d="M6.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path d="M10 17a2 2 0 1 0 4 0" />
  </svg>
)

// Mock data for social media platforms
const SOCIAL_MEDIA_DATA = {
  reddit: {
    platform_name: "Reddit",
    health_score: 90,
    metrics: {
      num_agents_active: 1,
      posts_monitored: 85,
      agent_engagements: 15,
      upvotes_on_agent_content: 180,
      clicks_to_hexnode: 25,
    },
  },
  linkedin: {
    platform_name: "LinkedIn",
    health_score: 95,
    metrics: {
      num_agents_active: 2,
      posts_monitored: 120,
      agent_engagements: 350,
      agent_posts_published: 8,
      direct_inmail_leads: 3,
    },
  },
  twitter: {
    platform_name: "Twitter",
    health_score: 88,
    metrics: {
      num_agents_active: 1,
      posts_monitored: 250,
      agent_engagements: 22,
      mentions_handled: 15,
      link_clicks_to_hexnode: 90,
    },
  },
  instagram: {
    platform_name: "Instagram",
    health_score: 75,
    metrics: {
      num_agents_active: 1,
      posts_monitored: 60,
      agent_engagements: 10,
      total_content_interactions: 1500,
      profile_visits_from_content: 80,
    },
  },
}

// Helper function to get health score color
const getHealthScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-500 dark:text-emerald-400"
  if (score >= 80) return "text-green-500 dark:text-green-400"
  if (score >= 70) return "text-yellow-500 dark:text-yellow-400"
  if (score >= 60) return "text-orange-500 dark:text-orange-400"
  return "text-red-500 dark:text-red-400"
}

// Helper function to get health score background color
const getHealthScoreBgColor = (score: number) => {
  if (score >= 90) return "bg-emerald-50 dark:bg-emerald-950/30"
  if (score >= 80) return "bg-green-50 dark:bg-green-950/30"
  if (score >= 70) return "bg-yellow-50 dark:bg-yellow-950/30"
  if (score >= 60) return "bg-orange-50 dark:bg-orange-950/30"
  return "bg-red-50 dark:bg-red-950/30"
}

export default function SocialMediaCards() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [socialData, setSocialData] = useState(SOCIAL_MEDIA_DATA)

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Create slightly modified data to simulate updates
      const updatedData = { ...socialData }

      // Make small random changes to metrics
      Object.keys(updatedData).forEach((platform) => {
        const platformData = updatedData[platform as keyof typeof updatedData]
        platformData.health_score = Math.min(
          100,
          Math.max(60, platformData.health_score + Math.floor(Math.random() * 7) - 3),
        )

        Object.keys(platformData.metrics).forEach((metric) => {
          const currentValue = platformData.metrics[metric as keyof typeof platformData.metrics]
          // Add or subtract a small random amount (up to 10% of current value)
          const change = Math.floor(currentValue * (Math.random() * 0.1)) * (Math.random() > 0.5 ? 1 : -1)
          platformData.metrics[metric as keyof typeof platformData.metrics] = Math.max(0, currentValue + change)
        })
      })

      setSocialData(updatedData)
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
          <h3 className="text-lg font-semibold">Social Media Platforms</h3>
          <p className="text-sm text-muted-foreground">Agent activity across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last updated: {formatLastUpdated()}</span>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing} className="h-8">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reddit Card */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-orange-50/30 via-card to-orange-50/10 dark:from-orange-950/10 dark:via-card dark:to-orange-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <RedditIcon className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Reddit</h4>
              </div>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 ${getHealthScoreBgColor(socialData.reddit.health_score)} ${getHealthScoreColor(socialData.reddit.health_score)}`}
              >
                {socialData.reddit.health_score}% Health
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Agents</span>
                <span className="font-medium">{socialData.reddit.metrics.num_agents_active}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Posts Monitored</span>
                <span className="font-medium">{socialData.reddit.metrics.posts_monitored}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Engagements</span>
                <span className="font-medium">{socialData.reddit.metrics.agent_engagements}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Upvotes</span>
                <span className="font-medium">{socialData.reddit.metrics.upvotes_on_agent_content}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {socialData.reddit.metrics.clicks_to_hexnode} clicks to site
              </span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Card */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-blue-50/30 via-card to-blue-50/10 dark:from-blue-950/10 dark:via-card dark:to-blue-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Linkedin className="h-5 w-5" />
                </div>
                <h4 className="font-medium">LinkedIn</h4>
              </div>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 ${getHealthScoreBgColor(socialData.linkedin.health_score)} ${getHealthScoreColor(socialData.linkedin.health_score)}`}
              >
                {socialData.linkedin.health_score}% Health
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Agents</span>
                <span className="font-medium">{socialData.linkedin.metrics.num_agents_active}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Posts Monitored</span>
                <span className="font-medium">{socialData.linkedin.metrics.posts_monitored}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Engagements</span>
                <span className="font-medium">{socialData.linkedin.metrics.agent_engagements}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Posts Published</span>
                <span className="font-medium">{socialData.linkedin.metrics.agent_posts_published}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {socialData.linkedin.metrics.direct_inmail_leads} direct leads
              </span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Twitter Card */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-sky-50/30 via-card to-sky-50/10 dark:from-sky-950/10 dark:via-card dark:to-sky-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Twitter className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Twitter</h4>
              </div>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 ${getHealthScoreBgColor(socialData.twitter.health_score)} ${getHealthScoreColor(socialData.twitter.health_score)}`}
              >
                {socialData.twitter.health_score}% Health
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Agents</span>
                <span className="font-medium">{socialData.twitter.metrics.num_agents_active}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Posts Monitored</span>
                <span className="font-medium">{socialData.twitter.metrics.posts_monitored}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Engagements</span>
                <span className="font-medium">{socialData.twitter.metrics.agent_engagements}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Mentions Handled</span>
                <span className="font-medium">{socialData.twitter.metrics.mentions_handled}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {socialData.twitter.metrics.link_clicks_to_hexnode} clicks to site
              </span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instagram Card */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-purple-50/30 via-card to-pink-50/10 dark:from-purple-950/10 dark:via-card dark:to-pink-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                  <Instagram className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Instagram</h4>
              </div>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 ${getHealthScoreBgColor(socialData.instagram.health_score)} ${getHealthScoreColor(socialData.instagram.health_score)}`}
              >
                {socialData.instagram.health_score}% Health
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Agents</span>
                <span className="font-medium">{socialData.instagram.metrics.num_agents_active}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Posts Monitored</span>
                <span className="font-medium">{socialData.instagram.metrics.posts_monitored}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Content Published</span>
                <span className="font-medium">{socialData.instagram.metrics.agent_engagements}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Interactions</span>
                <span className="font-medium">
                  {socialData.instagram.metrics.total_content_interactions.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {socialData.instagram.metrics.profile_visits_from_content} profile visits
              </span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
