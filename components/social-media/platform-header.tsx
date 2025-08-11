import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface PlatformHeaderProps {
  icon: LucideIcon
  title: string
  color: string
}

export function PlatformHeader({ icon: Icon, title, color }: PlatformHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
