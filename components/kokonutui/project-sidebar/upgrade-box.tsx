"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UpgradeBoxProps {
  isCollapsed: boolean
  onDismiss?: () => void
}

export function UpgradeBox({ isCollapsed, onDismiss }: UpgradeBoxProps) {
  const router = useRouter()
  const [isDismissed, setIsDismissed] = useState(false)

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  if (isCollapsed) {
    return (
      <div className="px-2 py-2">
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
        >
          <Crown className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="px-3 py-2">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Upgrade to Pro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300 mb-3 leading-relaxed">
            Unlock unlimited projects, advanced analytics, and premium features.
          </p>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-xs"
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
