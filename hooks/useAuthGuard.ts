import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

interface UseAuthGuardOptions {
  redirectTo?: string
  redirectDelay?: number
  toastTitle?: string
  toastDescription?: string
  requireAuth?: boolean // true = redirect if not authenticated, false = redirect if authenticated
}

interface UseAuthGuardReturn {
  isAuthenticated: boolean | null
  isLoading: boolean
  showRedirectMessage: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const {
    redirectTo = "/login",
    redirectDelay = 1,
    toastTitle = "Authentication Required",
    toastDescription = "Please sign in to continue.",
    requireAuth = true
  } = options

  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRedirectMessage, setShowRedirectMessage] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = Cookies.get("access_token")
      const isAuth = !!accessToken
      
      setIsAuthenticated(isAuth)
      setIsLoading(false)
      
      // Determine if we should redirect based on auth state and requirements
      const shouldRedirect = requireAuth ? !isAuth : isAuth
      
      if (shouldRedirect) {
        // Show redirect message first
        setShowRedirectMessage(true)
        
        // Show toast after a brief delay to ensure component is mounted
        setTimeout(() => {
          toast({
            title: toastTitle,
            description: toastDescription,
            variant: "destructive",
          })
        }, 100)
        
        // Redirect after showing the message
        setTimeout(() => {
          router.push(redirectTo)
        }, redirectDelay)
      }
    }

    checkAuth()
  }, [router, toast, redirectTo, redirectDelay, toastTitle, toastDescription, requireAuth])

  return {
    isAuthenticated,
    isLoading,
    showRedirectMessage: showRedirectMessage && ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated))
  }
}