"use client";

import { useParams } from "next/navigation";

import { AuthLoading } from "@/components/auth/auth-loading";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { AutomationDetailView } from "@/components/automations/automation-detail";
import Layout from "@/components/kokonutui/layout";
import { useAutomationDetail } from "@/hooks/useAutomationDetail";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AutomationDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");
  const { isAuthenticated, isLoading: isAuthLoading, showRedirectMessage } =
    useAuthGuard({
      redirectTo: "/login",
      toastTitle: "Authentication Required",
      toastDescription: "Please sign in to inspect automations.",
      requireAuth: true,
    });
  const automation = useAutomationDetail(slug, { enabled: isAuthenticated === true });

  if (isAuthLoading) return <AuthLoading message="Checking authentication..." />;
  if (showRedirectMessage) {
    return (
      <AuthRedirect
        title="Authentication Required"
        description="You need to be signed in to inspect automations."
        redirectMessage="Redirecting to sign-in..."
      />
    );
  }
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <AutomationDetailView {...automation} />
    </Layout>
  );
}
