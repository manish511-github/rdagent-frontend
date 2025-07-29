"use client"
export const dynamic = "force-dynamic"

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircleIcon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "../../../lib/config";

function AccountVerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyAccount = async () => {
      try {
        const response = await fetch(getApiUrl("users/verify"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            email: email,
          }),
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.detail || "Verification failed.");
        }
        setStatus("success");
        setMessage("Your account has been verified! You can now sign in.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      }
    };
    verifyAccount();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-2">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Verifying your account...</span>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2Icon className="h-8 w-8 text-green-600" />
          <span className="text-lg font-medium text-green-700 dark:text-green-400">{message}</span>
          <Button className="mt-4" onClick={() => router.push("/login")}>Go to Sign In</Button>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2">
          <AlertCircleIcon className="h-8 w-8 text-red-600" />
          <span className="text-lg font-medium text-red-700 dark:text-red-400">{message}</span>
        </div>
      )}
    </div>
  );
}

export default function AccountVerifyPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[60vh] px-4"><LoaderCircleIcon className="h-8 w-8 animate-spin text-blue-600" /><span className="text-lg font-medium">Verifying your account...</span></div>}>
      <AccountVerifyInner />
    </Suspense>
  );
} 