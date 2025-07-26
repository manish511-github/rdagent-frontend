import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Download,
  FileText,
  Package,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useCancelSubscription } from "@/hooks/useCancelSubscription";
import { useResumeSubscription } from "@/hooks/useResumeSubscription";
import { usePaymentMethodChange } from "@/hooks/usePaymentMethodChange";
import { useCustomerPortal } from "@/hooks/useCustomerPortal";

const invoices = [
  {
    id: "INV-001",
    date: "Mar 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    date: "Feb 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "Jan 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
];


export default function UserBilling() {
  const userInfo = useSelector((state: RootState) => state.user.info);
  const router = useRouter();
  const { cancelSubscription, isCancelling } = useCancelSubscription();
  const { resumeSubscription, isResuming } = useResumeSubscription();
  const { handlePaymentMethodChange } = usePaymentMethodChange();
  const { openCustomerPortal } = useCustomerPortal();

  // Group all plan-related variables
  const planInfo = {
    name: userInfo?.plan?.name,
    displayName: userInfo?.plan?.name ? `${userInfo.plan.name} Plan` : "Current Plan",
    price: userInfo?.plan?.price,
    currency: userInfo?.plan?.currency,
    features: userInfo?.plan?.features,
    description: userInfo?.plan?.description,
    planId: userInfo?.plan?.plan_id,
    billingCycle: userInfo?.subscription?.billing_cycle === 'month' ? 'monthly' : 'yearly',
    isTrial: userInfo?.subscription?.tier === "trial",
    isBasic: userInfo?.subscription?.tier === "basic",
    isPro: userInfo?.subscription?.tier === "pro",
    isEnterprise: userInfo?.subscription?.tier === "enterprise",
    isScheduledForCancellation: userInfo?.subscription?.is_scheduled_for_cancellation,
    endsAt: userInfo?.subscription?.ends_at,
    status: userInfo?.subscription?.status,
    pastDue: userInfo?.subscription?.past_due,
    renewalOrEndDate: (() => {
      const endsAt = userInfo?.subscription?.ends_at;
      if (!endsAt) return "";
      const date = new Date(endsAt);
      const formatted = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      if (userInfo?.subscription?.tier === "trial") {
        return `Ends on ${formatted}`;
      } else {
        return `Renews on ${formatted}`;
      }
    })(),
    planPrice: userInfo?.plan && userInfo.plan.price !== undefined ? `$${userInfo.plan.price}/${userInfo?.subscription?.billing_cycle === 'month' ? 'monthly' : 'yearly'}` : "",
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
            <p className="text-muted-foreground text-sm">
              Manage your subscription and billing details
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              if (userInfo?.id) {
                openCustomerPortal(userInfo.id);
              }
            }}
          >
            Manage Subscription
          </Button>
        </div>

        {/* Current Plan */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
              <div>
                {planInfo.status === "inactive" && planInfo.pastDue ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Package className="text-primary size-5" />
                      <h2 className="text-lg font-semibold">
                        {planInfo.name}
                      </h2>
                      <Badge variant="destructive">Payment Failed</Badge>
                    </div>
                    {planInfo.planPrice && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">{planInfo.planPrice.split('/')[0]}</span>
                        <span className="text-sm text-muted-foreground font-medium">/{planInfo.planPrice.split('/')[1]}</span>
                      </div>
                    )}
                    <div className="mt-4 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-sm text-destructive/80">
                            Payment Method declined. Please update your payment information to continue your subscription.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : planInfo.status === "inactive" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Package className="text-primary size-5" />
                      <h2 className="text-lg font-semibold">
                        {planInfo.name}
                      </h2>
                      <Badge variant="destructive">Plan Expired</Badge>
                    </div>
                    {planInfo.planPrice && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">{planInfo.planPrice.split('/')[0]}</span>
                        <span className="text-sm text-muted-foreground font-medium">/{planInfo.planPrice.split('/')[1]}</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Your subscription has expired. Renew your plan to continue accessing all features and benefits.
                    </p>
                  </>
                ) : planInfo.isScheduledForCancellation ? (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <Package className="text-primary size-5" />
                      <h2 className="text-lg font-semibold">
                        {planInfo.name}
                      </h2>
                      <span className="text-xs text-destructive font-semibold">• Cancellation scheduled for {planInfo.endsAt ? new Date(planInfo.endsAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                    </div>
                    {planInfo.planPrice && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">{planInfo.planPrice.split('/')[0]}</span>
                        <span className="text-sm text-muted-foreground font-medium">/{planInfo.planPrice.split('/')[1]}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Package className="text-primary size-5" />
                      <h2 className="text-lg font-semibold">
                        {planInfo.displayName}
                      </h2>
                      <Badge>Current Plan</Badge>
                    </div>
                    {(!planInfo.isTrial && planInfo.planPrice) && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">{planInfo.planPrice.split('/')[0]}</span>
                        <span className="text-sm text-muted-foreground font-medium">/{planInfo.planPrice.split('/')[1]}</span>
                        {planInfo.renewalOrEndDate && (
                          <span className="text-xs text-muted-foreground ml-3">{planInfo.renewalOrEndDate}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {planInfo.status === "inactive" && planInfo.pastDue ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => router.push("/upgrade")}
                    >
                      View all Plans
                    </Button>
                  </>
                ) : planInfo.status === "inactive" ? (
                  <Button 
                    variant="default" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => router.push("/upgrade")}
                  >
                    Subscribe
                  </Button>
                ) : planInfo.isScheduledForCancellation ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/upgrade')}
                    >
                      View all Plans
                    </Button>
                    <Button 
                      variant="default"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isResuming}
                      onClick={() => {
                        if (userInfo?.id) {
                          resumeSubscription(userInfo.id);
                        }
                      }}
                    >
                      {isResuming ? "Resuming..." : "Resume"}
                    </Button>
                  </>
                ) : (
                  planInfo.isTrial ? (
                    <Button 
                      variant="default" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => router.push("/upgrade")}
                    >
                      Upgrade
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="default" 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => router.push("/upgrade")}
                      >
                        Change Plan
                      </Button>
                      <Button 
                        variant="destructive"
                        disabled={isCancelling}
                        onClick={() => {
                          if (userInfo?.id) {
                            cancelSubscription(userInfo.id);
                          }
                        }}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Plan"}
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <div className="flex items-center gap-2">
                  <CreditCard className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground text-sm">
                    Visa ending in 4242
                  </span>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  if (userInfo?.id) {
                    handlePaymentMethodChange(userInfo.id);
                  }
                }}
              >
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
              <h2 className="text-lg font-semibold">Billing History</h2>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Download All
              </Button>
            </div>

            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col items-start justify-between gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-md p-2">
                      <FileText className="text-muted-foreground size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-muted-foreground text-sm">
                        {invoice.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{invoice.status}</Badge>
                    <span className="font-medium">{invoice.amount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
