"use client"
export const dynamic = "force-dynamic"

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircleIcon } from "lucide-react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresIn = searchParams.get("expires_in");

    if (accessToken && refreshToken) {
      // expiresIn is in seconds, convert to days for js-cookie
      const expiresDays = Number(expiresIn) / 3600 / 24;
      Cookies.set("access_token", accessToken, { expires: expiresDays });
      Cookies.set("refresh_token", refreshToken, { expires: 7 });

      // Dispatch fetchUser to update Redux store immediately after Google login
      import("@/store/slices/userSlice").then(({ fetchUser }) => {
        import("@/store/store").then(({ store }) => {
          store.dispatch(fetchUser());
        });
      });

      toast({
        title: "Sign-in successful",
        description: "You have been signed in with Google.",
        variant: "default",
      });
      router.push("/projects");
    } else {
      toast({
        title: "Sign-in failed",
        description: "Could not sign you in. Please try again.",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [router, searchParams, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-lg font-medium gap-4">
      <LoaderCircleIcon className="h-10 w-10 animate-spin text-blue-600" />
      <span>Signing you in...</span>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen text-lg font-medium gap-4"><LoaderCircleIcon className="h-10 w-10 animate-spin text-blue-600" /><span>Signing you in...</span></div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
