import Link from "next/link"

export default function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "How It Works", href: "#how-it-works" },
      { name: "Pricing", href: "#pricing" },
      { name: "Integrations", href: "#" },
      { name: "Roadmap", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Customers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "Guides", href: "#" },
      { name: "FAQ", href: "#faq" },
      { name: "Support", href: "#" },
      { name: "API", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  }

  return (
    <footer className="w-full border-t border-border/40 bg-background flex justify-center items-center">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-16 lg:py-20 flex flex-col items-center">
        <div className="w-full max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 place-items-center md:place-items-start">
            <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mx-auto md:mx-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="text-xl font-semibold tracking-tight">MarketingAI</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground font-light text-center md:text-left mx-auto md:mx-0">
                Transform your marketing strategy with AI-powered automation and insights that drive real results.
              </p>
              <div className="mt-6 flex space-x-4 mx-auto md:mx-0">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm font-medium text-center md:text-left mx-auto md:mx-0">Product</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.product.map((link, index) => (
                  <li key={index} className="text-center md:text-left mx-auto md:mx-0">
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm font-medium text-center md:text-left mx-auto md:mx-0">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.company.map((link, index) => (
                  <li key={index} className="text-center md:text-left mx-auto md:mx-0">
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-sm font-medium text-center md:text-left mx-auto md:mx-0">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.resources.map((link, index) => (
                  <li key={index} className="text-center md:text-left mx-auto md:mx-0">
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 flex flex-col items-center md:flex-row md:justify-between">
            <p className="text-xs text-muted-foreground font-light text-center mx-auto md:mx-0 md:text-left">
              © 2025 MarketingAI. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-4 mx-auto md:mx-0">
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
