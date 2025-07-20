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
          className="w-full h-10 p-0 border-border bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <Crown className="h-4 w-4 text-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <div className="px-1">
      <Card className="border-border bg-card">
        <CardContent className="p-3 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-foreground" />
            <span className="text-sm font-semibold text-foreground">Trial Plan</span>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Unlock unlimited projects and advanced features
          </p>

          <Button
            onClick={handleUpgrade}
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-7"
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
