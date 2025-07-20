"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UpgradeBoxProps {
  isCollapsed: boolean
}

export function UpgradeBox({ isCollapsed }: UpgradeBoxProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const router = useRouter()

  if (isDismissed) {
    return null
  }

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  if (isCollapsed) {
    return (
      <div className="px-1">
        <Button
          onClick={handleUpgrade}
          variant="outline"
          size="sm"
          className="w-full h-10 p-0 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 dark:from-orange-950 dark:to-yellow-950 dark:border-orange-800"
        >
          <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </Button>
      </div>
    )
  }

  return (
    <div className="px-1">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 dark:border-orange-800">
        <CardContent className="p-3 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
          >
            <X className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">Trial Plan</span>
          </div>

          <p className="text-xs text-orange-700 dark:text-orange-300 mb-3 leading-relaxed">
            Unlock unlimited projects and advanced features
          </p>

          <Button
            onClick={handleUpgrade}
            size="sm"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs h-7"
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
