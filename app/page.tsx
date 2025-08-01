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
