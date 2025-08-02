"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Download, Home, LayoutDashboard, Calendar, CreditCard, Hash, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
// import { ReceiptGenerator } from "@/components/payment/receipt-generator"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { getApiUrl } from "../../../lib/config";

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
        <div className="animate-pulse space-y-4 w-full max-w-2xl mx-auto p-6">
          <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded flex-1"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!transactionDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find the transaction details.</p>
          <Button onClick={() => router.push("/pricing")}>Return to Pricing</Button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Payment Successful!</h1>
            <p className="text-sm text-muted-foreground">
              Thank you for your subscription. Your payment has been processed successfully.
            </p>
          </div>

          {/* Transaction Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Transaction Details
              </CardTitle>
              <CardDescription className="text-xs">Here are the details of your successful payment transaction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Transaction ID</p>
                      <p className="text-xs text-muted-foreground font-mono">{transactionId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Amount Paid</p>
                      <p className="text-base font-bold">
                        ${amountPaid} {currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">Date & Time</p>
                      <p className="text-xs text-muted-foreground">{billedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4" /> {/* Spacer */}
                    <div>
                      <p className="text-xs font-medium">Status</p>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Plan Details */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-1">Subscription Plan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{planName}</p>
                    <p className="text-sm text-muted-foreground">Billed {billingInterval}</p>
                  </div>
                  <Badge variant="outline">{billingInterval === "yearly" ? "Annual" : "Monthly"}</Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold mb-1">Customer Information</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Name: {customerName}</p>
                  <p>Email: {customerEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>

            <Button onClick={handleViewDashboard} className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              View Dashboard
            </Button>

            <Button onClick={handleReturnHome} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </div>

          {/* Email Confirmation Message */}
          <div className="text-center p-4 mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We have emailed you the details of your transaction. Please check your inbox.
            </p>
          </div>

          {/* Support Section */}
          <div className="text-center mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-semibold mb-1">Need Help?</h3>
            <p className="text-xs text-muted-foreground mb-3">
              If you have any questions about your subscription or need assistance, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                View FAQ
              </Button>
            </div>
          </div>
        </div>
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
