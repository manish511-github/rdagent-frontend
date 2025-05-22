"use client"

import { useState } from "react"
import {
  Users,
  Target,
  TrendingUp,
  Map,
  Briefcase,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCheck,
  UserX,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for potential customer analytics
const CUSTOMER_DATA = {
  leadMetrics: {
    totalLeads: 342,
    newLeadsThisMonth: 78,
    conversionRate: "3.2%",
    avgQualificationTime: "2.5 days",
    leadGrowth: "+18%",
  },
  leadsBySource: [
    { source: "Organic Search", count: 124, percentage: 36, trend: "up" },
    { source: "Social Media", count: 87, percentage: 25, trend: "up" },
    { source: "Email Campaigns", count: 65, percentage: 19, trend: "stable" },
    { source: "Referrals", count: 42, percentage: 12, trend: "down" },
    { source: "Paid Ads", count: 24, percentage: 7, trend: "up" },
  ],
  leadsByStage: {
    new: 112,
    qualified: 86,
    negotiation: 54,
    won: 38,
    lost: 52,
  },
  leadsByRegion: [
    { region: "North America", percentage: 42 },
    { region: "Europe", percentage: 28 },
    { region: "Asia Pacific", percentage: 18 },
    { region: "Latin America", percentage: 8 },
    { region: "Middle East & Africa", percentage: 4 },
  ],
  leadsByIndustry: [
    { industry: "Technology", percentage: 35 },
    { industry: "Finance", percentage: 22 },
    { industry: "Healthcare", percentage: 18 },
    { industry: "Education", percentage: 15 },
    { industry: "Manufacturing", percentage: 10 },
  ],
}

export default function PotentialCustomerAnalytics() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [customerData, setCustomerData] = useState(CUSTOMER_DATA)

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Create slightly modified data to simulate updates
      const updatedData = { ...customerData }

      // Make small random changes to metrics
      updatedData.leadMetrics.totalLeads += Math.floor(Math.random() * 10) - 2
      updatedData.leadMetrics.newLeadsThisMonth += Math.floor(Math.random() * 5) - 1

      // Update lead sources
      updatedData.leadsBySource.forEach((source) => {
        source.count += Math.floor(Math.random() * 5) - 2
      })

      // Recalculate percentages
      const totalLeads = updatedData.leadsBySource.reduce((sum, source) => sum + source.count, 0)
      updatedData.leadsBySource.forEach((source) => {
        source.percentage = Math.round((source.count / totalLeads) * 100)
      })

      setCustomerData(updatedData)
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
          <h3 className="text-lg font-semibold">Potential Customer Analytics</h3>
          <p className="text-sm text-muted-foreground">Lead generation and conversion metrics</p>
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
        {/* Lead Metrics Summary */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-purple-50/30 via-card to-purple-50/10 dark:from-purple-950/10 dark:via-card dark:to-purple-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Lead Metrics</h4>
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              >
                Summary
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Leads</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-lg">{customerData.leadMetrics.totalLeads}</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    {customerData.leadMetrics.leadGrowth}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">New This Month</span>
                <span className="font-medium text-lg">{customerData.leadMetrics.newLeadsThisMonth}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Conversion Rate</span>
                <span className="font-medium text-lg">{customerData.leadMetrics.conversionRate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Avg. Qualification</span>
                <span className="font-medium text-lg">{customerData.leadMetrics.avgQualificationTime}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40">
              <h5 className="text-xs font-medium mb-2">Lead Pipeline</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UserPlus className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs">New</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(customerData.leadsByStage.new / customerData.leadMetrics.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{customerData.leadsByStage.new}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs">Qualified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${(customerData.leadsByStage.qualified / customerData.leadMetrics.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{customerData.leadsByStage.qualified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs">Negotiation</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{
                            width: `${(customerData.leadsByStage.negotiation / customerData.leadMetrics.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{customerData.leadsByStage.negotiation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs">Won</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${(customerData.leadsByStage.won / customerData.leadMetrics.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{customerData.leadsByStage.won}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <UserX className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs">Lost</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${(customerData.leadsByStage.lost / customerData.leadMetrics.totalLeads) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{customerData.leadsByStage.lost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-green-50/30 via-card to-green-50/10 dark:from-green-950/10 dark:via-card dark:to-green-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Target className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Lead Sources</h4>
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                By Channel
              </Badge>
            </div>

            <div className="space-y-3">
              {customerData.leadsBySource.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{source.source}</span>
                    {source.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                    {source.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${source.percentage}%` }}></div>
                    </div>
                    <div className="flex items-center gap-1 min-w-[60px] justify-end">
                      <span className="text-xs font-medium">{source.count}</span>
                      <span className="text-xs text-muted-foreground">({source.percentage}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/40">
              <h5 className="text-xs font-medium mb-2">Geographic Distribution</h5>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Map className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs">Top Regions</span>
              </div>

              <div className="space-y-2">
                {customerData.leadsByRegion.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs">{region.region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${region.percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{region.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Breakdown */}
        <Card className="overflow-hidden border-muted/60 bg-gradient-to-br from-amber-50/30 via-card to-amber-50/10 dark:from-amber-950/10 dark:via-card dark:to-amber-950/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="font-medium">Industry Breakdown</h4>
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                By Sector
              </Badge>
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative w-40 h-40">
                {/* Simplified donut chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {customerData.leadsByIndustry.map((industry, index) => {
                    // Calculate the start angle for this segment
                    const previousTotal = customerData.leadsByIndustry
                      .slice(0, index)
                      .reduce((sum, item) => sum + item.percentage, 0)

                    const startAngle = (previousTotal / 100) * 360
                    const endAngle = ((previousTotal + industry.percentage) / 100) * 360

                    // Convert angles to radians and calculate coordinates
                    const startRad = (startAngle - 90) * (Math.PI / 180)
                    const endRad = (endAngle - 90) * (Math.PI / 180)

                    const x1 = 50 + 40 * Math.cos(startRad)
                    const y1 = 50 + 40 * Math.sin(startRad)
                    const x2 = 50 + 40 * Math.cos(endRad)
                    const y2 = 50 + 40 * Math.sin(endRad)

                    // Determine if the arc should be drawn as a large arc
                    const largeArcFlag = industry.percentage > 50 ? 1 : 0

                    // Generate a color based on the index
                    const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"]
                    const color = colors[index % colors.length]

                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={color}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    )
                  })}
                  {/* Inner circle to create donut */}
                  <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-[#0A0A0C]" />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">{customerData.leadMetrics.totalLeads}</span>
                  <span className="text-xs text-muted-foreground">Leads</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {customerData.leadsByIndustry.map((industry, index) => {
                // Generate a color based on the index
                const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"]
                const color = colors[index % colors.length]

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                      <span className="text-xs">{industry.industry}</span>
                    </div>
                    <span className="text-xs font-medium">{industry.percentage}%</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-medium">Conversion by Industry</h5>
                <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-2 h-24 flex items-end justify-between gap-1">
                {customerData.leadsByIndustry.map((industry, index) => {
                  // Generate random conversion rates for visualization
                  const conversionRate = 2 + Math.random() * 5
                  const height = `${conversionRate * 10}%`

                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-amber-200 dark:bg-amber-900/50 rounded-t-sm" style={{ height }}></div>
                      <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                        {industry.industry.substring(0, 4)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
