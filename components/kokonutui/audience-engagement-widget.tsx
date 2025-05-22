"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AudienceEngagementWidgetProps {
  className?: string
  projectId?: string
}

// Sample data for audience engagement metrics
const engagementData = {
  overview: {
    totalAudience: "12,450",
    growth: "+8.5%",
    engagementRate: "4.2%",
    averageSessionTime: "3m 24s",
    bounceRate: "32%",
    conversionRate: "2.8%",
  },
  demographics: {
    ageGroups: [
      { group: "18-24", percentage: 22 },
      { group: "25-34", percentage: 38 },
      { group: "35-44", percentage: 25 },
      { group: "45-54", percentage: 10 },
      { group: "55+", percentage: 5 },
    ],
    genderSplit: [
      { gender: "Female", percentage: 58 },
      { gender: "Male", percentage: 41 },
      { gender: "Other", percentage: 1 },
    ],
    topLocations: [
      { location: "United States", percentage: 45 },
      { location: "United Kingdom", percentage: 15 },
      { location: "Canada", percentage: 12 },
      { location: "Australia", percentage: 8 },
      { location: "Germany", percentage: 5 },
    ],
  },
  interests: [
    { category: "Technology", percentage: 68, trend: "up" },
    { category: "Sustainability", percentage: 54, trend: "up" },
    { category: "Health & Wellness", percentage: 47, trend: "stable" },
    { category: "Finance", percentage: 35, trend: "down" },
    { category: "Travel", percentage: 32, trend: "up" },
    { category: "Fashion", percentage: 28, trend: "stable" },
  ],
  channels: [
    { name: "Social Media", engagement: 42, conversion: 3.2 },
    { name: "Email", engagement: 38, conversion: 4.5 },
    { name: "Website", engagement: 35, conversion: 2.8 },
    { name: "Paid Ads", engagement: 28, conversion: 1.9 },
    { name: "Content Marketing", engagement: 25, conversion: 2.2 },
  ],
}

export default function AudienceEngagementWidget({ className, projectId }: AudienceEngagementWidgetProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Audience Engagement</CardTitle>
            <CardDescription>Analytics about your target audience</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            Last 30 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs">
              Demographics
            </TabsTrigger>
            <TabsTrigger value="interests" className="text-xs">
              Interests
            </TabsTrigger>
            <TabsTrigger value="channels" className="text-xs">
              Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Total Audience</div>
                <div className="text-xl font-semibold">{engagementData.overview.totalAudience}</div>
                <div className="flex items-center mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {engagementData.overview.growth}
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Engagement Rate</div>
                <div className="text-xl font-semibold">{engagementData.overview.engagementRate}</div>
                <div className="flex items-center mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.8% vs last month
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Avg. Session Time</div>
                <div className="text-xl font-semibold">{engagementData.overview.averageSessionTime}</div>
                <div className="flex items-center mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12s vs last month
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Bounce Rate</div>
                <div className="text-xl font-semibold">{engagementData.overview.bounceRate}</div>
                <div className="flex items-center mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.5% vs last month
                </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
                <div className="text-xl font-semibold">{engagementData.overview.conversionRate}</div>
                <div className="flex items-center mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3% vs last month
                </div>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-lg border border-border/40 h-[200px] flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium mb-1">Audience Growth Trend</div>
                <div className="text-xs text-muted-foreground">Showing audience growth over the last 30 days</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Age Distribution</div>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {engagementData.demographics.ageGroups.map((item) => (
                    <div key={item.group} className="flex items-center justify-between">
                      <div className="text-xs">{item.group}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <div className="text-xs font-medium w-8 text-right">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Gender Distribution</div>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {engagementData.demographics.genderSplit.map((item) => (
                    <div key={item.gender} className="flex items-center justify-between">
                      <div className="text-xs">{item.gender}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <div className="text-xs font-medium w-8 text-right">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-muted/40 p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Top Locations</div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {engagementData.demographics.topLocations.map((item) => (
                    <div key={item.location} className="flex items-center justify-between">
                      <div className="text-xs">{item.location}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <div className="text-xs font-medium w-8 text-right">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interests" className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Interest Categories</div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {engagementData.interests.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="text-xs">{item.category}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs font-medium">{item.percentage}%</div>
                        {item.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {item.trend === "down" && <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-lg border border-border/40 h-[180px] flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium mb-1">Interest Overlap Analysis</div>
                <div className="text-xs text-muted-foreground">
                  Visualization showing how audience interests overlap
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Channel Performance</div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {engagementData.channels.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Engagement: {item.engagement}% | Conversion: {item.conversion}%
                      </div>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="bg-primary rounded-l-full" style={{ width: `${item.engagement}%` }} />
                      <div className="bg-emerald-500 rounded-r-full" style={{ width: `${item.conversion * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-sm" />
                  <span>Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span>Conversion</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-lg border border-border/40 h-[180px] flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium mb-1">Channel Engagement Trends</div>
                <div className="text-xs text-muted-foreground">Showing engagement trends across channels over time</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button variant="outline" className="w-full justify-center gap-1.5">
          <span>View Detailed Analytics</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
