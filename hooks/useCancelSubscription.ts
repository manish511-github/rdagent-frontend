import { useState } from "react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/slices/userSlice";
import { getApiUrl } from "../lib/config";
import { toast } from "sonner";

export function useCancelSubscription() {
  const [isCancelling, setIsCancelling] = useState(false);
  const dispatch = useDispatch();

  const cancelSubscription = async (userId: number) => {
    setIsCancelling(true);
    try {
      const accessToken = Cookies.get("access_token");
      const response = await fetch(getApiUrl("subscription/cancel-subscription"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // Backend derives user from access token; no need to send user_id
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      toast.success("Subscription cancelled", {
        description: "Your subscription has been cancelled successfully.",
      });
      setTimeout(() => {
        (dispatch as any)(fetchUser());
      }, 1500);
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Cancel error", {
        description: "Failed to cancel subscription. Please try again.",
      });
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return { cancelSubscription, isCancelling };
}
