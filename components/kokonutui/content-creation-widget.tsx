"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, Twitter, Linkedin, Instagram, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface ContentItem {
  id: string
  platform: "twitter" | "linkedin" | "instagram" | "blog"
  content: string
  status: "draft" | "scheduled" | "published"
  scheduledFor?: string
}

interface ContentCreationWidgetProps {
  className?: string
}

const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "1",
    platform: "twitter",
    content: "Excited to announce our new AI-powered marketing features! #MarketingAutomation #AI",
    status: "scheduled",
    scheduledFor: "Today, 3:30 PM",
  },
  {
    id: "2",
    platform: "linkedin",
    content:
      "Our team has been working hard to bring you the most advanced marketing automation tools powered by artificial intelligence...",
    status: "draft",
  },
  {
    id: "3",
    platform: "blog",
    content: "5 Ways AI is Transforming Digital Marketing in 2025",
    status: "published",
  },
]

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  blog: FileText,
}

const platformStyles = {
  twitter: "text-blue-500 dark:text-blue-400",
  linkedin: "text-blue-700 dark:text-blue-500",
  instagram: "text-purple-600 dark:text-purple-400",
  blog: "text-gray-700 dark:text-gray-300",
}

export default function ContentCreationWidget({ className }: ContentCreationWidgetProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setPrompt("")
    }, 2000)
  }

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "bg-white dark:bg-[#0A0A0C]",
        "border border-zinc-100 dark:border-zinc-800/80",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">AI Content Assistant</p>
        </div>
        <Textarea
          placeholder="Describe the content you want to create (e.g., 'Write a Twitter thread about AI marketing trends')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[70px] text-sm"
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-100 dark:text-zinc-900"
          >
            {isGenerating ? "Generating..." : "Generate Content"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">Recent Content</h2>
        </div>

        <div className="space-y-2">
          {CONTENT_ITEMS.map((item) => {
            const Icon = platformIcons[item.platform]
            return (
              <div
                key={item.id}
                className={cn(
                  "group flex items-start gap-3",
                  "p-2.5 rounded-lg",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                  "transition-all duration-200",
                  "border border-zinc-100 dark:border-zinc-800/80",
                )}
              >
                <div className={cn("p-1.5 rounded-lg", platformStyles[item.platform])}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-900 dark:text-zinc-100 line-clamp-2">{item.content}</p>
                  <div className="flex items-center mt-1 gap-2">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        item.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : item.status === "scheduled"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                      )}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {item.scheduledFor && (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.scheduledFor}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "py-2 px-3 rounded-lg",
            "text-xs font-medium",
            "bg-gradient-to-r from-zinc-900 to-zinc-800",
            "dark:from-zinc-50 dark:to-zinc-200",
            "text-zinc-50 dark:text-zinc-900",
            "hover:from-zinc-800 hover:to-zinc-700",
            "dark:hover:from-zinc-200 dark:hover:to-zinc-300",
            "shadow-sm hover:shadow",
            "transform transition-all duration-200",
            "hover:-translate-y-0.5",
            "active:translate-y-0",
          )}
        >
          <span>View Content Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
