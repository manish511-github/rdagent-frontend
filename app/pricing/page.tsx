import { Header } from "@/components/landing-page/header"
import { PricingSection } from "@/components/landing-page/pricing-section"
import { Footer } from "@/components/landing-page/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing - Plans for Everyone | Relative",
  description: "Choose the perfect plan for your productivity needs with our flexible pricing options.",
}

export default function PricingPage() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-14 md:py-20 lg:py-24">
          {/* The PricingSection is now only rendered once */}
          <PricingSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
