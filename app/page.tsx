"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { AuthLoading } from "@/components/auth/auth-loading"
import { Header } from "@/components/landing-page/header"
import { HeroSection } from "@/components/landing-page/hero-section"
// import { PartnersSection } from "@/components/partners-section"
import { FeaturesSection } from "@/components/landing-page/features-section"
import { AdaptiveWorkflowsSection } from "@/components/landing-page/adaptive-workflows-section"
import { OptimizedSchedulingSection } from "@/components/landing-page/optimized-scheduling-section"
import { AcceleratePlanningSection } from "@/components/landing-page/accelerate-planning-section"
// import { TestimonialsSection } from "@/components/testimonials-section"
import { SimplifiedPricingSection } from "@/components/landing-page/simplified-pricing-section"
import { FAQSection } from "@/components/landing-page/faq-section" // This import is still here
import { Footer } from "@/components/landing-page/footer"
import UpgradePlan from "@/components/upgrade_plan/upgrade_plan"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthGuard({
    redirectTo: "/projects",
    requireAuth: false, // Redirect if authenticated
    toastTitle: "Welcome Back!",
    toastDescription: "Redirecting to your dashboard...",
    redirectDelay: 1
  })

  // Show loading state while checking authentication
  // if (isLoading) {
  //   return <AuthLoading message="Checking authentication..." />
  // }

  // If authenticated, don't render the landing page (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto">
        <Header />
        <main>
          <HeroSection />
          {/* <PartnersSection /> */}
          <FeaturesSection />
          <AdaptiveWorkflowsSection />
          <OptimizedSchedulingSection />
          <AcceleratePlanningSection />
          {/* <TestimonialsSection /> */}
          {/* <SimplifiedPricingSection /> */}
        <div className="border-x [&>*:last-child]:pb-20 [&>div>div:first-child]:!pt-20 lg:pt-0 pb-0">
            <UpgradePlan />
          </div>
          <FAQSection /> {/* This component is still rendered here */}
        </main>
      <Footer />
    </div>
  )
}
