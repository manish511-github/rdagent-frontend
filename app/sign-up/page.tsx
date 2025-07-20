import SignUpForm from "@/components/sign-up-form"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-full flex flex-col items-center justify-center p-4 md:p-6 bg-white dark:bg-gray-950 relative">
          <div className="absolute top-4 left-4">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
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
              <span className="text-base font-semibold tracking-tight">MarketingAI</span>
            </Link>
          </div>

          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            <div className="mb-4">
              <div className="flex justify-start mb-4">
                <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-white"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create your account</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <SignUpForm />

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-gray-900 dark:text-gray-300 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-900 dark:text-gray-300 hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Right panel - Preview */}
        <div className="hidden lg:block relative bg-gradient-to-br from-blue-700 to-blue-900 dark:from-blue-900 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10"></div>

          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl mx-auto">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div className="p-3 bg-gray-900/90 backdrop-blur-sm text-white flex items-center space-x-2 border-b border-gray-700">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-medium flex-1 text-center">MarketingAI Dashboard</div>
                </div>
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=600&width=800&query=marketing dashboard with analytics and campaign performance metrics"
                    alt="Application Preview"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Welcome to MarketingAI</h3>
                    <p className="text-sm opacity-90 max-w-md">
                      Streamline your marketing workflows, analyze campaign performance, and create compelling content
                      with our AI-powered tools.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-white/90">
                <h3 className="text-lg font-medium mb-4">Trusted by teams at</h3>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-8 bg-white/10 rounded-md animate-pulse-slow"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}
