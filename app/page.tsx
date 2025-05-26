import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/marketing/navbar"
import Hero from "@/components/marketing/hero"
import TrustedBy from "@/components/marketing/trusted-by"
import Features from "@/components/marketing/features"
import HowItWorks from "@/components/marketing/how-it-works"
import Testimonials from "@/components/marketing/testimonials"
import Pricing from "@/components/marketing/pricing"
import Faq from "@/components/marketing/faq"
import Cta from "@/components/marketing/cta"
import Footer from "@/components/marketing/footer"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <TrustedBy />
          <Features />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
