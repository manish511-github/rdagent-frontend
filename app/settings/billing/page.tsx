"use client"

import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download } from "lucide-react"
import type { RootState } from "@/store/store"
import Layout from "@/components/kokonutui/layout"

export default function BillingSettings() {
  const { info: userInfo } = useSelector((state: RootState) => state.user)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing Settings</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your current subscription details and usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">{userInfo?.subscription?.tier || "Free"} Plan</h3>
                  <Badge variant={userInfo?.subscription?.tier === "trial" ? "secondary" : "default"}>
                    {userInfo?.subscription?.status || "Active"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userInfo?.subscription?.tier === "trial"
                    ? `Trial ends ${new Date(userInfo.subscription.ends_at).toLocaleDateString()}`
                    : "Unlimited access to all features"}
                </p>
              </div>
              {userInfo?.subscription?.tier === "trial" && <Button>Upgrade Plan</Button>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods and billing information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userInfo?.subscription?.tier === "trial" ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No payment method on file</p>
                <Button>Add Payment Method</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/24</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Download your previous invoices and billing statements.</CardDescription>
          </CardHeader>
          <CardContent>
            {userInfo?.subscription?.tier === "trial" ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No billing history available</p>
                <p className="text-sm text-muted-foreground mt-1">Upgrade to a paid plan to see your billing history</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Invoice #001</p>
                    <p className="text-sm text-muted-foreground">January 2024 • $29.00</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Invoice #002</p>
                    <p className="text-sm text-muted-foreground">December 2023 • $29.00</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
