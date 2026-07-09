"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedditDiscoveryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/agent-chat");
  }, [router]);

  return null;
}
