"use client"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Download } from "lucide-react"
import type { RootState } from "@/store/store"
import { useRouter } from "next/navigation"

interface Invoice {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed"
  downloadUrl: string
}

export function BillingSettings() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Get user data from Redux
  const { info: userInfo } = useSelector((state: RootState) => state.user)
  const subscription = userInfo?.subscription

  useEffect(() => {
    // TODO: Fetch invoices from API
    const mockInvoices: Invoice[] = [
      {
        id: "inv_001",
        date: "2025-01-20",
        amount: 29.99,
        status: "paid",
        downloadUrl: "#",
      },
      {
        id: "inv_002",
        date: "2024-12-20",
        amount: 29.99,
        status: "paid",
        downloadUrl: "#",
      },
    ]

    setTimeout(() => {
      setInvoices(mockInvoices)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  const handleManageBilling = () => {
    // TODO: Redirect to billing portal
    console.log("Redirect to billing portal")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">{subscription?.tier || "Free"} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription?.tier === "trial"
                    ? `Trial ends ${subscription.ends_at ? formatDate(subscription.ends_at) : "soon"}`
                    : subscription?.tier === "free"
                      ? "Basic features included"
                      : "Full access to all features"}
                </p>
              </div>

              <div className="flex gap-2">
                {subscription?.tier === "trial" || subscription?.tier === "free" ? (
                  <Button onClick={handleUpgrade}>Upgrade Plan</Button>
                ) : (
                  <Button variant="outline" onClick={handleManageBilling}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>

            {subscription?.ends_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {subscription.tier === "trial" ? "Trial ends" : "Next billing date"}:{" "}
                  {formatDate(subscription.ends_at)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your previous invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">${invoice.amount}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(invoice.status)}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No billing history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Update your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription?.tier !== "trial" && subscription?.tier !== "free" ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No payment method on file</p>
                <Button className="mt-2" onClick={handleUpgrade}>
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
