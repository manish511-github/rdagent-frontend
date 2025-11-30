"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Youtube, Twitter, Facebook } from "lucide-react"
import { YouTubeAnalysis } from "./youtube-analysis"
import { TwitterAnalysis } from "./twitter-analysis"
import { FacebookAnalysis } from "./facebook-analysis"

// Sample data - replace with actual data props
const SAMPLE_YOUTUBE_DATA = {
  success: true,
  data: {
    channel_id: "UCsJ0VeziRFiiVABMKNRaFBw",
    title: "Hexnode",
    description:
      "Hexnode UEM is an industry-leading endpoint management solution that offers a rich set of features aimed at securing, managing, and remotely monitoring devices within the enterprise.",
    subscribers: 12800,
    total_views: 1476,
    total_likes: 11,
    total_comments: 0,
    total_videos: 259,
    avg_views: 134.18,
    avg_engagement: 0.0079,
  },
  metadata: {
    channel_url: "https://www.youtube.com/c/hexnode",
    days: 180,
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
      ],
    },
    scoring: {
      number_of_videos: { score: 3, reason: "13 videos in the last 180 days is a low volume of content." },
      activity: {
        score: 2,
        reason: "The posting schedule is irregular, with videos uploaded in bursts rather than consistently over time.",
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
          "The channel lacks content directly addressing specific pain points and frequently asked questions related to UEM implementation and troubleshooting.",
        sample_titles: [
          "Top 5 UEM Challenges and How to Overcome Them with Hexnode",
          "Hexnode FAQ: Troubleshooting Common Device Enrollment Issues",
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
        ],
      },
    ],
    supporting_insights: {
      formats_and_length: ["Videos 1-5m: Most videos fall into this category. Performance is mixed."],
      top_performers: [
        {
          title: "Empowering POS Systems: Joe & the Juice's Global Device Management Strategy | Hexnode Success Story",
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
      trends: ["The last 5 videos have slightly lower mean views compared to the prior 5."],
    },
  },
}

const SAMPLE_TWITTER_DATA = {
  success: true,
  data: {
    id: "2922760149",
    name: "Hexnode",
    screen_name: "thehexnode",
    description: "Automating Everywhere Workplace by unifying and managing the endpoints from a single console.",
    followers: 17982,
    following: 987,
    total_tweets: 15,
    total_likes: 10890,
    total_retweets: 2876,
    total_replies: 1034,
    total_quotes: 218,
    avg_likes: 726,
    avg_retweets: 191.73,
    avg_replies: 68.93,
    avg_quotes: 14.53,
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
      ],
      examples: [
        {
          title: "Digital Employee Experience",
          description:
            "Posts discussing the importance of DEX in boosting productivity and focus, and announcing related webinars.",
        },
      ],
    },
    scoring: {
      number_of_videos: { score: 1, reason: "No videos were present in the provided data." },
      activity: {
        score: 7,
        reason: "Posting cadence is roughly consistent, with posts occurring approximately every 3-4 days.",
      },
      engagement: {
        score: 3,
        reason: "Low engagement across most posts. The mean and median total engagement are low.",
      },
      relevancy: {
        score: 8,
        reason: "Content is highly relevant to Hexnode's endpoint management and security solutions.",
      },
      total_channel_score: 4.75,
    },
    opportunities_for_improvement: [
      {
        category: "engagement",
        title: "Increase Audience Engagement",
        rationale: "Low engagement rates suggest content isn't resonating strongly with the target audience.",
        sample_titles: ["Run polls on endpoint management challenges", "Ask questions related to DEX in posts"],
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
        ],
      },
    ],
    supporting_insights: {
      formats_and_length: ["Primarily text-based updates with links to external resources."],
      top_performers: [
        {
          title: "Generate videos in just a few seconds. Try Grok Imagine, free for a limited time.",
          reason:
            "This tweet from Grok (not Hexnode) gained significant traction due to its broad appeal and the novelty of AI-powered video generation.",
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
      trends: ["The last 10 tweets have a slightly higher mean engagement compared to the prior tweets."],
    },
  },
}

const SAMPLE_FACEBOOK_DATA = {
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
    avg_reactions: 0.57,
    avg_comments: 0.24,
    avg_shares: 0.19,
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
      ],
      examples: [
        {
          title: "Hexnode Live - Digital Employee Experience",
          description:
            "Promotion of a LinkedIn Live event discussing Digital Employee Experience (DEX) and how to build a seamless digital workplace.",
        },
      ],
    },
    scoring: {
      number_of_videos: { score: 1, reason: "No video content detected in the provided data." },
      activity: {
        score: 10,
        reason:
          "Posts are consistently published, almost daily or every other day, indicating a highly consistent activity level.",
      },
      engagement: { score: 3, reason: "Low average engagement (reactions, comments, shares) per post." },
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
          "Current engagement levels (reactions, comments, shares) are low. Focus on content that encourages interaction and discussion.",
        sample_titles: [
          "Ask questions related to endpoint management challenges.",
          "Run polls on device preferences and security practices.",
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
        ],
      },
    ],
    supporting_insights: {
      formats_and_length: ["Posts are primarily text-based with embedded links."],
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
      trends: ["Engagement is generally low across all posts."],
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
        ],
        notes:
          "Limited comments available for deeper analysis. Users express general interest in product features and integrations.",
      },
    },
  },
}

interface SocialMediaDashboardProps {
  youtubeData?: any
  twitterData?: any
  facebookData?: any
}

export function SocialMediaDashboard({ youtubeData, twitterData, facebookData }: SocialMediaDashboardProps) {
  const [activeTab, setActiveTab] = useState("youtube")

  // Use provided data or fall back to sample data
  const youtube = youtubeData  
  const twitter = twitterData
  const facebook = facebookData

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="mt-6">
          {youtube ? (
            <YouTubeAnalysis data={youtube} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Youtube className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No YouTube Data</h3>
                <p className="text-gray-600 dark:text-gray-400">YouTube analysis data is not available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="twitter" className="mt-6">
          {twitter ? (
            <TwitterAnalysis data={twitter} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Twitter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No Twitter Data</h3>
                <p className="text-gray-600 dark:text-gray-400">Twitter analysis data is not available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="facebook" className="mt-6">
          {facebook ? (
            <FacebookAnalysis data={facebook} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Facebook className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No Facebook Data</h3>
                <p className="text-gray-600 dark:text-gray-400">Facebook analysis data is not available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
