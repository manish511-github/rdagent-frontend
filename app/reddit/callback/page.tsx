"use client";

import { useEffect } from "react";

export default function RedditCallback() {
  useEffect(() => {
    // Notify parent tab (if opened as a popup)
    if (window.opener) {
      window.opener.postMessage({ type: "REDDIT_AUTH_SUCCESS" }, "*");
      window.close();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-lg font-medium gap-4">
      <span>Reddit account connected!</span>
      <span>You can close this window.</span>
    </div>
  );
} 