import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";


export function usePayment() {
  const user = useSelector((state: RootState) => state.user.info);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { openCheckout } = usePaddleCheckout();


  const handlePayment = async (planId: number) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get("access_token");
      const email = user?.email || "user@example.com";
      const userId = user?.id;
      const body = JSON.stringify({
        plan_id: planId,
        email,
        user_id: userId || ""
      });
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
      if (data.txn) {
        openCheckout(data.txn);
      } else {
        throw new Error('No transaction ID received');
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
