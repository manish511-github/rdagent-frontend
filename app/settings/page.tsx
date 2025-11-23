"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import Layout from "@/components/kokonutui/layout"
import AccountSettings from "@/components/settings-components/account-settings"
import BillingSettings from "@/components/settings-components/billing-settings"

function SettingsContent() {
  const { isAuthenticated, isLoading, showRedirectMessage } = useAuthGuard({
    redirectTo: "/login",
    toastTitle: "Authentication Required",
    toastDescription: "Please sign in to access your settings.",
    requireAuth: true,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoading message="Checking authentication..." />;
  }

  // Show redirect message if not authenticated
  if (showRedirectMessage) {
    return (
      <AuthRedirect
        title="Authentication Required"
        description="You need to be signed in to access your settings."
        redirectMessage="Redirecting to sign-in..."
      />
    );
  }

  // Only render the main content if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <AccountSettings />
        <BillingSettings />
      </div>
    </Layout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<AuthLoading message="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  );
}
