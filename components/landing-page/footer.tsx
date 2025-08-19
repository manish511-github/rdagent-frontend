"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github } from "lucide-react";
import { useTheme } from "next-themes";

export function Footer() {
  const { theme } = useTheme();
  return (
    <footer className="border-t bg-background text-foreground text-xs">
      <div className="container border-x px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-shrink-0">
              <Link
                aria-label="zooptics"
                href="/"
                className="inline-flex items-center gap-2"
              >
                <Image
                  src={theme === "dark" ? "/logo-light.svg" : "/logo-dark.svg"}
                  alt="zooptics logo"
                  width={28}
                  height={28}
                />
                <span className="sr-only">zooptics</span>
                <span className="text-xl font-medium font-montserrat bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  zooptics
                </span>
              </Link>
              <div className="mt-5 flex space-x-4">
                <a
                  className="text-muted-foreground hover:text-foreground"
                  href="#"
                  aria-label="Twitter"
                >
                  <Twitter className="size-5" />
                </a>
                <a
                  className="text-muted-foreground hover:text-foreground"
                  href="#"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </a>
                <a
                  className="text-muted-foreground hover:text-foreground"
                  href="#"
                  aria-label="GitHub"
                >
                  <Github className="size-5" />
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                Empowering teams to achieve project success through effective
                management and collaboration.
              </p>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Zooptics. All rights reserved.
              </p>
            </div>
            {/* 
            <div>
              <h3 className="mb-4 font-semibold uppercase tracking-wide">
                Features
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link className="text-sm hover:underline" href="#">
                    Task Management
                  </Link>
                </li>
                <li>
                  <Link className="text-sm hover:underline" href="#">
                    Gantt Charts{" "}
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      Pro
                    </span>
                  </Link>
                </li>
                <li>
                  <Link className="text-sm hover:underline" href="#">
                    Time Tracking
                  </Link>
                </li>
                <li>
                  <Link className="text-sm hover:underline" href="#">
                    Resource Allocation
                  </Link>
                </li>
              </ul>
            </div> */}
            <div className="flex-shrink-0 flex flex-row gap-6">
              <div>
                <h3 className="mb-4 font-semibold uppercase tracking-wide">
                  Company
                </h3>
                <ul className="space-y-2">
                  {/* <li>
                    <Link className="text-sm hover:underline" href="#">
                      Blog
                    </Link>
                  </li> */}
                  <li>
                    {/* <Link className="text-sm hover:underline" href="#">
                      Webinars{" "}
                      <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        New
                      </span>
                    </Link> */}
                  </li>
                  <li>
                    <Link className="text-sm hover:underline" href="/about">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm hover:underline" href="/contact">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-shrink-0">
                <h3 className="mb-4 font-semibold uppercase tracking-wide">
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link className="text-sm hover:underline" href="/privacy">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm hover:underline" href="/tnc">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm hover:underline" href="/refund">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
