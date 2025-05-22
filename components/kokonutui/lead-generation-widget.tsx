"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, User, Building, Check, X, MessageSquare, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  score: number
  status: "new" | "contacted" | "qualified" | "unqualified"
}

interface LeadGenerationWidgetProps {
  className?: string
}

const LEADS: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "TechInnovate Inc.",
    email: "sarah.j@techinnovate.com",
    phone: "+1 (555) 123-4567",
    source: "LinkedIn",
    score: 85,
    status: "new",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Growth Solutions",
    email: "m.chen@growthsolutions.co",
    phone: "+1 (555) 987-6543",
    source: "Twitter",
    score: 72,
    status: "contacted",
  },
  {
    id: "3",
    name: "Jessica Williams",
    company: "Digital First Agency",
    email: "j.williams@digitalfirst.io",
    phone: "+1 (555) 456-7890",
    source: "Website Form",
    score: 91,
    status: "qualified",
  },
  {
    id: "4",
    name: "Robert Garcia",
    company: "Startup Ventures",
    email: "r.garcia@startupventures.com",
    phone: "+1 (555) 234-5678",
    source: "LinkedIn",
    score: 65,
    status: "unqualified",
  },
]

const statusStyles = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  qualified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  unqualified: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export default function LeadGenerationWidget({ className }: LeadGenerationWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateLeads = () => {
    setIsGenerating(true)
    // Simulate AI lead generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const filteredLeads = LEADS.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      className={cn(
        "w-full",
        "bg-white dark:bg-[#0A0A0C]",
        "border border-zinc-100 dark:border-zinc-800/80",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">AI Lead Generation</p>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Potential Customers</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateLeads}
              disabled={isGenerating}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-100 dark:text-zinc-900 text-[11px] h-8"
            >
              {isGenerating ? "Generating..." : "Find New Leads"}
              <Sparkles className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Name</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Company
              </th>
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Source</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Score</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <User className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{lead.company}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{lead.source}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-amber-500" : "bg-red-500",
                        )}
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{lead.score}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", statusStyles[lead.status])}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <MessageSquare className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          <span>View All Leads</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
