import { Header } from "@/components/landing-page/header"
import { ContactSection } from "@/components/landing-page/contact-section"
import { Footer } from "@/components/landing-page/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch | Relative",
  description: "Have questions or need support? Contact our team and we'll get back to you within 24 hours.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
