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
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useCancelSubscription } from "@/hooks/useCancelSubscription";
import { useResumeSubscription } from "@/hooks/useResumeSubscription";
import { usePaymentMethodChange } from "@/hooks/usePaymentMethodChange";
import { useCustomerPortal } from "@/hooks/useCustomerPortal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import type {
  PaymentMethod,
  Payment,
  PaymentHistoryItem,
  PaymentHistoryResponse
} from '@/types/paymentHistory';


export default function UserBilling() {
  const userInfo = useSelector((state: RootState) => state.user.info);
  const router = useRouter();
  const { cancelSubscription, isCancelling } = useCancelSubscription();
  const { resumeSubscription, isResuming } = useResumeSubscription();
  const { handlePaymentMethodChange } = usePaymentMethodChange();
  const { openCustomerPortal } = useCustomerPortal();
  const { toast } = useToast();
  
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const userId = userInfo?.id ? String(userInfo.id) : '';
  const {
    data: paymentHistoryData,
    isLoading: isLoadingHistory,
    error: paymentHistoryError,
  } = usePaymentHistory({ userId, page, pageSize });
  const paymentHistory = paymentHistoryData?.payment_history || [];
  const pagination = paymentHistoryData?.pagination;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.total_pages || 1;
  const hasNext = pagination?.has_next;
  const hasPrevious = pagination?.has_previous;

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

        {/* Payment Method - Only show if subscription is active */}
        {planInfo.status !== "inactive" && (
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <div className="flex items-center gap-2">
                  {/* <CreditCard className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground text-sm">
                    Visa ending in 4242
                  </span> */}
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
        )}

        {/* Payment History */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
              <h2 className="text-lg font-semibold">Payment History</h2>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={isLoadingHistory}
                >
                  <RefreshCw className={`mr-2 size-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  {isLoadingHistory ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!hasPrevious || isLoadingHistory}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!hasNext || isLoadingHistory}
                >
                  Next
                </Button>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading payment history...</span>
                </div>
              </div>
            ) : paymentHistoryError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="mx-auto size-12 text-destructive mb-2" />
                  <p className="text-sm text-destructive">Failed to load payment history</p>
                </div>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No payment history found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Row */}
                <div className="hidden md:grid md:grid-cols-7 gap-3 pb-2 border-b border-muted text-sm font-medium text-muted-foreground">
                  <div>Event Type</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Origin</div>
                  <div>Plan</div>
                  <div>Payment Method</div>
                  <div className="text-right">Amount</div>
                </div>
                
                {paymentHistory.map((item: PaymentHistoryItem) => {
                  const formatEventType = (eventType: string) => {
                    return eventType.split('.').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                  };

                  const getStatusBadge = (eventType: string, status: string) => {
                    if (eventType.includes('payment_failed')) {
                      return <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="size-3" />
                        Failed
                      </Badge>;
                    }
                    if (eventType.includes('completed')) {
                      return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="size-3" />
                        Completed
                      </Badge>;
                    }
                    if (eventType.includes('past_due')) {
                      return <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="size-3" />
                        Past Due
                      </Badge>;
                    }
                    if (status === 'active') {
                      return <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <CheckCircle className="size-3" />
                        Active
                      </Badge>;
                    }
                    if (status === 'canceled') {
                      return <Badge variant="outline" className="flex items-center gap-1">
                        <XCircle className="size-3" />
                        Canceled
                      </Badge>;
                    }
                    return <Badge variant="outline">{status}</Badge>;
                  };

                  const getPaymentMethodInfo = (payments?: Payment[]) => {
                    if (!payments || payments.length === 0) return null;
                    const payment = payments[0];
                    if (payment.method_details?.card) {
                      const card = payment.method_details.card;
                      return `${card.type.charAt(0).toUpperCase() + card.type.slice(1)} ••••${card.last4}`;
                    }
                    return payment.method_details?.type || 'Unknown';
                  };

                  const getAmount = (item: PaymentHistoryItem) => {
                    if (item.payout_totals?.grand_total) {
                      const amount = parseFloat(item.payout_totals.grand_total) / 100;
                      return `$${amount.toFixed(2)}`;
                    }
                    if (item.list_items?.[0]?.price?.unit_price?.amount) {
                      const amount = parseFloat(item.list_items[0].price.unit_price.amount) / 100;
                      return `$${amount.toFixed(2)}`;
                    }
                    return '-';
                  };

                  const getAttemptCount = (payments?: Payment[]) => {
                    if (!payments) return '-';
                    return payments.length.toString();
                  };

                  const formatDate = (dateString: string) => {
                    return new Date(dateString).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  };

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-7 gap-3 border-b py-4 last:border-0 items-center"
                    >
                      {/* Event Type */}
                      <div className="md:col-span-1">
                        <p className="font-medium text-sm">{formatEventType(item.event_type)}</p>
                      </div>
                      
                      {/* Status */}
                      <div className="md:col-span-1">
                        {getStatusBadge(item.event_type, item.status)}
                      </div>
                      
                      {/* Date */}
                      <div className="md:col-span-1">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.occurred_at || item.created_at)}
                        </p>
                      </div>
                      
                      {/* Origin */}
                      <div className="md:col-span-1">
                        <p className="text-sm text-muted-foreground">
                          {item.origin ? item.origin.replace(/_/g, ' ') : '-'}
                        </p>
                      </div>

                      {/* Plan */}
                      <div className="md:col-span-1">
                        <p className="text-sm text-muted-foreground">
                          {item.list_items?.[0]?.price?.name || '-'}
                        </p>
                      </div>
                      
                      {/* Payment Method & Attempts */}
                      <div className="md:col-span-1">
                        <div className="space-y-1">
                          <p className="text-sm">
                            {getPaymentMethodInfo(item.payments) || '-'}
                          </p>
                          {item.payments && (
                            <p className="text-xs text-muted-foreground">
                              Attempts: {getAttemptCount(item.payments)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount */}
                      <div className="md:col-span-1 text-right">
                        <span className="font-medium">{getAmount(item)}</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Remove old View All History button, as pagination is now handled */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
