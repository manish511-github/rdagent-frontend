"use client";

import { AuthLoading } from "@/components/auth/auth-loading";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { AutomationsLibrary } from "@/components/automations/automations-library";
import Layout from "@/components/kokonutui/layout";
import { useAutomations } from "@/hooks/useAutomations";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AutomationsPage() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    showRedirectMessage,
  } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to manage automations.",
    requireAuth: true,
  });
  // Do not contact the owner-scoped API until the auth guard has restored a
  // valid session. This avoids a noisy unauthenticated request during page
  // hydration and keeps the library's first response owner-scoped.
  const automations = useAutomations({ enabled: isAuthenticated === true });

  if (isAuthLoading) {
    return <AuthLoading message="Checking authentication..." />;
  }
  if (showRedirectMessage) {
    return (
      <AuthRedirect
        title="Authentication Required"
        description="You need to be signed in to manage automations."
        redirectMessage="Redirecting to sign-in..."
      />
    );
  }
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <AutomationsLibrary
        items={automations.items}
        isLoading={automations.isLoading}
        error={automations.error}
        actionSlug={automations.actionSlug}
        onRefresh={automations.refresh}
        onPause={automations.pause}
        onConfirm={automations.confirm}
        onSave={automations.save}
      />
    </Layout>
  );
}
