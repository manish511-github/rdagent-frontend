import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { fetchUser } from "@/store/slices/userSlice";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";


export function usePayment() {
  const user = useSelector((state: RootState) => state.user.info);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { openCheckout } = usePaddleCheckout();


  const handlePayment = async (planId: number, emailOverride?: string) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("access_token");
      const email = emailOverride || user?.email || "user@example.com";
      const userId = user?.id;
      const status = user?.subscription?.status;
      const tier = user?.subscription?.tier;
      const body = JSON.stringify({
        plan_id: planId,
        email,
        user_id: userId || ""
      });

      // Routing logic
      if (status === "active" && tier !== "trial") {
        // Make a POST request to /update-subscription
        const response = await fetch(`http://localhost:8000/subscription/update-subscription`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body,
        });

        if (!response.ok) {
          throw new Error('Failed to update subscription');
        }

        const data = await response.json();
        if (data.success) {
          toast({
            title: "Subscription Updated",
            description: data.message || "Your subscription has been updated.",
            variant: "default",
          });
          setTimeout(() => {
            (dispatch as any)(fetchUser());
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to update subscription');
        }
      } else {
        // Route to /create-transaction
        const response = await fetch(`http://localhost:8000/subscription/create-transaction`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body,
        });

        if (!response.ok) {
          throw new Error('Failed to create transaction');
        }

        const data = await response.json();
        if (data) {
          openCheckout(data, email);
        } else {
          throw new Error('No transaction ID received');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePayment, isLoading };
} 