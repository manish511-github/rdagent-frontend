import { useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/slices/userSlice";
import { getApiUrl } from "../lib/config";

export function useResumeSubscription() {
  const [isResuming, setIsResuming] = useState(false);
  const { toast } = useToast();
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
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to resume subscription");
      }
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Subscription Resumed",
          description: data.message || "Your subscription cancellation has been removed.",
          variant: "default",
        });
      setTimeout(() => {
        (dispatch as any)(fetchUser());
      }, 1500);
      } else {
        throw new Error(data.message || "Failed to resume subscription");
      }
    } catch (error) {
      console.error("Resume subscription error:", error);
      toast({
        title: "Resume Error",
        description: "Failed to resume subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResuming(false);
    }
  };

  return { resumeSubscription, isResuming };
}
