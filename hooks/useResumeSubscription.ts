import { useState } from "react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/slices/userSlice";
import { getApiUrl } from "../lib/config";
import { toast } from "sonner";

export function useResumeSubscription() {
  const [isResuming, setIsResuming] = useState(false);
  const dispatch = useDispatch();

  const resumeSubscription = async (userId: number) => {
    setIsResuming(true);
    try {
      const accessToken = Cookies.get("access_token");
      const response = await fetch(getApiUrl("subscription/remove-scheduled-cancellation"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // Backend derives user from access token; no need to send user_id
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to resume subscription");
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Subscription resumed", {
          description: data.message || "Your subscription cancellation has been removed.",
        });
      setTimeout(() => {
        (dispatch as any)(fetchUser());
      }, 1500);
      } else {
        throw new Error(data.message || "Failed to resume subscription");
      }
    } catch (error) {
      console.error("Resume subscription error:", error);
      toast.error("Resume error", {
        description: "Failed to resume subscription. Please try again.",
      });
    } finally {
      setIsResuming(false);
    }
  };

  return { resumeSubscription, isResuming };
}
