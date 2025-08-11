"use client"

import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  className?: string
}

export function MetricCard({ icon: Icon, value, label, className = "" }: MetricCardProps) {
  return (
    <div className={`text-center p-2 bg-muted/50 rounded ${className}`}>
      <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
