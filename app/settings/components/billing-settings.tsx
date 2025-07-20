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
  const isTrial = userInfo?.subscription?.tier === "trial";
  const isBasic = userInfo?.subscription?.tier === "basic";
  const isPro = userInfo?.subscription?.tier === "pro";
  const isEnterprise = userInfo?.subscription?.tier === "enterprise";
  const plan = userInfo?.plan;
  const router = useRouter();

  // Plan display name fallback
  const planDisplayName = plan?.name ? `${plan.name} Plan` : "Current Plan";
  const planDescription = plan?.description || "";
  const planPrice = plan && plan.price !== undefined ? `$${plan.price}${plan.currency ? `/${plan.currency}` : ""}` : "";
  // Subscription end/renewal date
  let renewalOrEndDate = "";
  const endsAt = userInfo?.subscription?.ends_at;
  if (endsAt) {
    const date = new Date(endsAt);
    const formatted = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (isTrial) {
      renewalOrEndDate = `Ends on ${formatted}`;
    } else {
      renewalOrEndDate = `Renews on ${formatted}`;
    }
  }

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
          <Button variant="outline">
            <Settings className="mr-2 size-4" />
            Billing Settings
          </Button>
        </div>

        {/* Current Plan */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="text-primary size-5" />
                  <h2 className="text-lg font-semibold">
                    {planDisplayName}
                  </h2>
                  <Badge>Current Plan</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {planDescription}
                  {(!isTrial && planPrice) ? ` • ${planPrice}` : ""}
                  {renewalOrEndDate ? ` • ${renewalOrEndDate}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isTrial ? (
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
                    <Button variant="destructive">Cancel Plan</Button>
                  </>
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
              <Button variant="outline">Update Payment Method</Button>
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
