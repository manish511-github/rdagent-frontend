import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import Cookies from "js-cookie";
import { getApiUrl } from "../lib/config";

export function usePaymentMethodChange() {
  const { openCheckout } = usePaddleCheckout();

  const handlePaymentMethodChange = async (userId: number) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await fetch(getApiUrl("subscription/get-payment-method-change-transaction"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get payment method change transaction");
      }

      const data = await response.json();
      
      if (data.success && data.transaction_id) {
        openCheckout({
          txn_id: data.transaction_id,
          auth_token: data.auth_token,
        });
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (error) {
      console.error("Payment method change error:", error);
      alert("Failed to update payment method. Please try again.");
    }
  };

  return { handlePaymentMethodChange };
} 