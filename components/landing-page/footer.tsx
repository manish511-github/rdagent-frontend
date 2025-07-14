"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Youtube } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container border-x py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Relative Logo"
                  width={32}
                  height={32}
                  className="relative z-10"
                />
                <div className="absolute inset-0 -z-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-md opacity-30" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Relative</span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6 text-sm leading-relaxed">
              Relative is a cutting-edge platform designed to streamline your workflows and boost productivity. We help
              teams achieve more with less effort.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="size-4 text-primary" />
                <span>hello@relative.io</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="size-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary mt-1" />
                <span>123 Relative St, Suite 400, San Francisco, CA 94105</span>
              </div>
            </div>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="size-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </motion.a>
              <motion.a
                href="#"
                className="size-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </motion.a>
              <motion.a
                href="#"
                className="size-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </motion.a>
              <motion.a
                href="#"
                className="size-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="YouTube"
              >
                <Youtube className="size-5" />
              </motion.a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container border-x py-4 text-center text-sm text-muted-foreground lg:py-6">
        <p className="flex flex-col md:flex-row items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Relative. All rights reserved.</span>
          <span className="hidden md:inline-block mx-1">|</span>
          <span>Made with ♥ in San Francisco</span>
        </p>
      </div>
    </footer>
  )
}
