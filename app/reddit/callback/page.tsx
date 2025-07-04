"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

function RedditCallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthAccountId = searchParams.get("oauth_account_id");
    if (window.opener) {
      window.opener.postMessage(
        { type: "REDDIT_AUTH_SUCCESS", oauth_account_id: oauthAccountId },
        "*"
      );
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-lg font-medium gap-4">
      <span>Reddit account connected!</span>
      <span>You can close this window.</span>
    </div>
  );
}

export default function RedditCallback() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen text-lg font-medium gap-4">
        <span>Connecting Reddit...</span>
      </div>
    }>
      <RedditCallbackInner />
    </Suspense>
  );
} 