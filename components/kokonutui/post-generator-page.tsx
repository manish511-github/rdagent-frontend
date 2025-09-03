"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, PenSquare, Plus, Loader2 } from "lucide-react"
import { PlatformIcon } from "@/components/kokonutui/platform-icons"

export default function PostGeneratorPage({ projectId }: { projectId: string }) {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("Professional")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Placeholder: integrate API later
      await new Promise((r) => setTimeout(r, 800))
      setResult(
        `Sample post about "${topic}" with a ${tone.toLowerCase()} tone. Replace with API output.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="py-4 md:py-0">
      <div className="px-4 md:px-6 2xl:max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full rounded-md overflow-hidden">
          <div className="w-full px-4 md:px-6 py-8 md:py-5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2.5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                <PenSquare className="h-6 w-6" />
                Post Generator
              </h2>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl font-normal">
                Create on-brand social posts instantly. Provide a topic and tone to generate ready-to-use content.
              </p>
              <div className="flex gap-2 pt-1">
                <Badge variant="secondary" className="bg-white/10 text-white">AI Powered</Badge>
                <Badge variant="secondary" className="bg-white/10 text-white">Project-aware</Badge>
              </div>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="relative w-full md:w-[220px] h-[140px] rounded-lg overflow-hidden shadow-xl">
                <img alt="Creative writing" className="object-cover w-full h-full" src="/images/analysis.png" />
              </div>
            </div>
          </div>
        </div>

        {/* Generator Tiles */}
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-3">Choose a generator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/projects/${projectId}/post-generator/reddit`} className="group">
              <Card className="p-4 h-full transition-all hover:shadow-md bg-white/70 dark:bg-gray-900/50 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/30 border">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-200/60 dark:ring-orange-900/50">
                    <PlatformIcon platform="reddit" className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate">Reddit Post Generator</div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Beta</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">Craft engaging Reddit posts with the right tone and structure.</div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
