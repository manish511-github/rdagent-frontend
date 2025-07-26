import { useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/slices/userSlice";

export function useCancelSubscription() {
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const cancelSubscription = async (userId: number) => {
    setIsCancelling(true);
    try {
      const accessToken = Cookies.get("access_token");
      const response = await fetch("http://localhost:8000/subscription/cancel-subscription", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
        variant: "default",
      });
      setTimeout(() => {
        (dispatch as any)(fetchUser());
      }, 1500);
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast({
        title: "Cancel Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return { cancelSubscription, isCancelling };
}
