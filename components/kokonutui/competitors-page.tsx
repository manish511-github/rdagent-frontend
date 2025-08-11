"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Building2, Globe, Star } from "lucide-react"

type Competitor = {
  name: string
  slug: string
  founded: string
  industry: string
  headline: string
  website?: string
  imageUrl?: string
  metrics?: { score?: number }
}

const FEATURED_COMPETITOR: Competitor = {
  name: "Acme Corp",
  slug: "acme",
  founded: "2014",
  industry: "B2B SaaS",
  headline: "Leading platform for enterprise customer engagement",
  website: "https://example.com",
  imageUrl: "/placeholder.jpg",
  metrics: { score: 92 },
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

export default function CompetitorsPage({ projectId }: { projectId: string }) {
  return (
    <section className="py-4 md:py-6">
      <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Competitors</h1>
            <p className="text-muted-foreground text-sm">Explore competitors and dive into detailed company analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Project</Badge>
            <Badge variant="outline" className="text-xs">{projectId.slice(0, 8)}</Badge>
          </div>
        </div>

        {/* Featured Competitor */}
        <div className="bg-muted/60 border border-blue-100 dark:border-border rounded-2xl p-5 md:p-7 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background">Featured</Badge>
              {FEATURED_COMPETITOR.metrics?.score != null && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" /> Score {FEATURED_COMPETITOR.metrics.score}
                </Badge>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">{FEATURED_COMPETITOR.name}</h2>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {FEATURED_COMPETITOR.industry}</span>
              <span className="inline-flex items-center gap-1">Founded {FEATURED_COMPETITOR.founded}</span>
              {FEATURED_COMPETITOR.website && (
                <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> {new URL(FEATURED_COMPETITOR.website).hostname}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{FEATURED_COMPETITOR.headline}</p>
            <div>
              <Button asChild className="group relative mt-1 px-4 h-9">
                <Link href={`/projects/${projectId}/company-analysis?company=${FEATURED_COMPETITOR.slug}`}>
                  View analysis
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Card className="h-full">
              <CardContent className="h-full p-0 overflow-hidden rounded-xl">
                {/* Placeholder image area */}
                <div className="h-full min-h-[180px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/10 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Logo / Preview</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Competitors List */}
        <div className="mt-8">
          <h2 className="text-base font-semibold mb-2 text-foreground">All competitors</h2>
          <div className="border-t">
            {COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                href={`/projects/${projectId}/company-analysis?company=${c.slug}`}
                className="block hover:bg-accent/40"
              >
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-2 py-4 border-b last:border-b-0">
                  <div className="basis-1/4 font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </div>
                  <div className="basis-1/4 text-sm text-muted-foreground">{c.industry}</div>
                  <div className="basis-1/2 text-sm text-muted-foreground line-clamp-1">{c.headline}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

