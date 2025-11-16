import { Metadata } from "next"
import { AboutSection } from "@/components/landing-page/about-section"
import { Header } from "@/components/landing-page/header"
import { Footer } from "@/components/landing-page/footer"

export const metadata: Metadata = {
  title: "About Us - Zooptics",
  description: "Stop guessing what works on social media. Learn about our mission to bring AI-powered marketing intelligence to every business.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto">
      <Header />
      <main>
        <AboutSection />
      </main>
      <Footer />
    </div>
    
  )
}

