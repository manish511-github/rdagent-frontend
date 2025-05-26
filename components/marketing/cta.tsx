import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Cta() {
  return (
    <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80 flex justify-center items-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute top-20 left-[5%] w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-[5%] w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-[20%] left-[15%] w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[15%] w-8 h-8 bg-purple-500/10 dark:bg-purple-500/20 rounded-full animate-pulse-slower"></div>
      <div className="absolute top-[60%] right-[10%] w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-full animate-pulse-slow"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
          <h2 className="font-inter font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl text-center mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Ready to transform your marketing?
          </h2>

          <p className="text-muted-foreground font-medium md:text-xl/relaxed text-center mx-auto mb-10 max-w-[600px]">
            Join thousands of marketers who are saving time, reducing costs, and driving better results with
            MarketingAI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mx-auto mb-6">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium w-full sm:w-auto mx-auto transition-all duration-300 hover:shadow-lg group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-medium w-full sm:w-auto mx-auto transition-all duration-300 hover:shadow-md border-2"
            >
              Schedule Demo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground font-medium text-center mx-auto">
            No credit card required • 14-day free trial • Cancel anytime
          </p>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span className="text-sm font-medium">Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span className="text-sm font-medium">Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
