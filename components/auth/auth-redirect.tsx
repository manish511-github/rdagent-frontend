import { Loader2, AlertCircle } from "lucide-react"

interface AuthRedirectProps {
  title?: string
  description?: string
  redirectMessage?: string
}

export function AuthRedirect({ 
  title = "Authentication Required",
  description = "You need to be signed in to access this page.",
  redirectMessage = "Redirecting to sign-in..."
}: AuthRedirectProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">{redirectMessage}</p>
        </div>
      </div>
    </div>
  )
}