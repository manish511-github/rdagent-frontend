import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 flex justify-center items-center relative bg-white dark:bg-gray-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOGY4ZjgiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50 dark:opacity-30"></div>

      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
          {/* Tag line */}
          <div className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-5 py-2 mb-10 shadow-sm">
            <span className="font-medium uppercase tracking-widest text-sm text-gray-800 dark:text-gray-200 text-center">
              AI-POWERED MARKETING
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-inter tracking-tight text-center mx-auto mb-8">
            <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-2">
              Your Marketing Team,
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 dark:text-gray-100">
              Powered by AI
            </span>
          </h1>

          {/* Description with enhanced typography */}
          <div className="text-center mx-auto mb-12 max-w-[650px]">
            <p className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-light">
              <span className="block mb-6">
                <span className="font-semibold text-gray-900 dark:text-white">Automate</span> your marketing strategy
                with our AI agent that <span className="font-semibold text-gray-900 dark:text-white">creates</span>,
                <span className="font-semibold text-gray-900 dark:text-white"> optimizes</span>, and
                <span className="font-semibold text-gray-900 dark:text-white"> manages</span> campaigns across all
                channels.
              </span>
              <span className="block pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="inline-block px-4 py-1 font-medium text-base md:text-lg tracking-wide text-gray-900 dark:text-white">
                  Save time • Reduce costs • Drive better results
                </span>
              </span>
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full mx-auto mb-16">
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 font-medium text-base h-14 px-8 w-full sm:w-auto transition-all duration-300 hover:shadow-lg rounded-full"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 font-medium text-base h-14 px-8 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto transition-all duration-300 rounded-full"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center mx-auto">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Visual element */}
        <div className="w-full max-w-[900px] mx-auto mt-16 flex justify-center items-center">
          <div className="w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
            <img
              src="/placeholder.svg?height=600&width=1000&query=Minimal%20white%20AI%20marketing%20dashboard%20with%20clean%20interface"
              alt="AI Marketing Dashboard"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
