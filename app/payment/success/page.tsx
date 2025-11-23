"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Download, LayoutDashboard, Calendar, CreditCard, Hash, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
// import { ReceiptGenerator } from "@/components/payment/receipt-generator"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { getApiUrl } from "../../../lib/config";
import { useTheme } from "next-themes"
import Cookies from "js-cookie"

interface TransactionDetails {
  transaction_id: string
  amount_paid: number
  currency: string
  plan_info: {
    plan_name: string
    plan_description: string
    billing_cycle: {
      interval: string
      frequency: number
    }
  }
  billing_period: {
    starts_at: string
    ends_at: string
  }
  billed_at: string
  status: string
  invoice_link: string
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const user = useSelector((state: RootState) => state.user.info)
  const { theme } = useTheme()

  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const txnId = searchParams.get("txn_id")

    const fetchTransactionDetails = async () => {
      if (txnId) {
        setIsLoading(true)
        try {
          const response = await fetch(getApiUrl("subscription/transaction-detail"), {
            method: "POST", // Assuming you need to POST the transaction ID
            headers: {
              "Content-Type": "application/json",
              // Backend derives user from access token; include it here
              ...(Cookies.get("access_token")
                ? { Authorization: `Bearer ${Cookies.get("access_token")}` }
                : {}),
            },
            body: JSON.stringify({ transaction_id: txnId }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.success) {
            setTransactionDetails(data.transaction_detail)
          } else {
            toast({
              title: "Transaction Fetch Failed",
              description: data.message || "Failed to fetch transaction details.",
              variant: "destructive",
            })
            setTimeout(() => router.push("/pricing"), 2000)
          }
        } catch (error: any) {
          console.error("Error fetching transaction details:", error)
          toast({
            title: "Transaction Fetch Error",
            description: error.message || "Failed to fetch transaction details.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/pricing"), 2000)
        } finally {
          setIsLoading(false)
        }
      } else {
        toast({
          title: "No Transaction Found",
          description: "Redirecting to pricing page...",
          variant: "destructive",
        })
        setTimeout(() => router.push("/pricing"), 2000)
        setIsLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [searchParams, user, router, toast])

  const handleDownloadReceipt = () => {
    if (transactionDetails) {
      // Open the invoice link in a new tab/window
      window.open(transactionDetails.invoice_link, "_blank")

      toast({
        title: "Opening Receipt",
        description: "Your receipt will open in a new tab.",
        variant: "default",
      })
    }
  }

  const handleViewDashboard = () => {
    router.push("/projects")
  }

  const handleReturnHome = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full">
            <CreditCard className="w-6 h-6 text-muted-foreground animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!transactionDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Payment status
            </CardTitle>
            <CardDescription className="text-xs">
              We couldn't find the transaction details for this payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground">
              This can happen if the link is expired or already used.
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/pricing")}
              >
                Back to pricing
              </Button>
        </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const billedAt = transactionDetails?.billed_at ? new Date(transactionDetails.billed_at).toLocaleDateString() : "N/A"
  const amountPaid = transactionDetails?.amount_paid || 0
  const currency = transactionDetails?.currency || "USD"
  const planName = transactionDetails?.plan_info?.plan_name || "N/A"
  const billingInterval = transactionDetails?.plan_info?.billing_cycle?.interval || "N/A"
  const customerName = user?.username || "User"
  const customerEmail = user?.email || "user@example.com"
  const transactionId = transactionDetails?.transaction_id || "N/A"
  const status = transactionDetails?.status || "N/A"

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Brand logo and name on left, similar to sign-in page */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"}
            alt="Zooptics logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-medium font-montserrat bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            zooptics
          </span>
        </Link>
          </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                    <div>
                <CardTitle className="text-lg">Payment successful</CardTitle>
                <CardDescription className="text-sm">
                  Your subscription is now active.
                </CardDescription>
                    </div>
                  </div>
                      <Badge
                        variant="default"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-0.5"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 pb-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Amount paid</p>
              <p className="text-2xl font-semibold">
                ${amountPaid}{" "}
                <span className="text-sm text-muted-foreground">{currency}</span>
              </p>
                  </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-0.5">Plan</p>
              <p className="text-base font-medium truncate max-w-[140px]">
                {planName}
              </p>
              <p className="text-xs text-muted-foreground">
                Billed {billingInterval}
              </p>
                </div>
              </div>

              <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-xs break-all">
                {transactionId}
              </p>
                  </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground">Billed on</p>
              <p className="text-sm">{billedAt}</p>
                </div>
              </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{customerName}</p>
            <p>{customerEmail}</p>
              </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-8">
            <Button
              onClick={handleViewDashboard}
              className="flex-1 flex items-center justify-center gap-2"
              size="sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to dashboard
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zooptics. All rights reserved.
      </div>
    </div>
  )
}

function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading payment details...</h2>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}

