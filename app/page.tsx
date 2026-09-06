"use client";

import { AdaptiveWorkflowsSection } from "@/components/landing-page/adaptive-workflows-section";
import { FeaturesSection } from "@/components/landing-page/features-section";
import { Footer } from "@/components/landing-page/footer";
import { Header } from "@/components/landing-page/header";
import { HeroSection } from "@/components/landing-page/hero-section";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function HomePage() {
  const { isAuthenticated } = useAuthGuard({
    redirectTo: "/agent-chat",
    requireAuth: false,
    toastTitle: "Welcome back!",
    toastDescription: "Opening your workspace…",
    redirectDelay: 1,
  });

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#18181b] selection:bg-zinc-200 dark:bg-[#09090a] dark:text-white dark:selection:bg-white/20">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <AdaptiveWorkflowsSection />
        </main>
      </div>
      <Footer />
    </div>
  );
}
