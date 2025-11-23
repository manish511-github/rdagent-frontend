import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { fetchUser } from "@/store/slices/userSlice";
import Cookies from "js-cookie";
import { getApiUrl } from "../lib/config";
import { useState } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { toast } from "sonner";


export function usePayment() {
  const user = useSelector((state: RootState) => state.user.info);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { openCheckout } = usePaddleCheckout();


  const handlePayment = async (planId: number, emailOverride?: string) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("access_token");
      const email = emailOverride || user?.email || "user@example.com";
      const status = user?.subscription?.status;
      const tier = user?.subscription?.tier;
      const body = JSON.stringify({
        plan_id: planId,
        email,
      });

      // Routing logic
      if (status === "active" && tier !== "trial") {
        // Make a POST request to /update-subscription
        const response = await fetch(getApiUrl(`subscription/update-subscription`), {
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
          toast.success("Subscription updated", {
            description: data.message || "Your subscription has been updated.",
          });
          setTimeout(() => {
            (dispatch as any)(fetchUser());
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to update subscription');
        }
      } else {
        // Route to /create-transaction
        const response = await fetch(getApiUrl(`subscription/create-transaction`), {
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
      console.error("Payment error:", error);
      toast.error("Payment error", {
        description: "Failed to process payment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePayment, isLoading };
} 