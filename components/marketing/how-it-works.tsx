import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900/80 flex justify-center items-center relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-[5%] w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
          <div className="inline-block rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 text-sm text-center mx-auto mb-4 shadow-sm transform transition-all duration-300 hover:scale-105">
            <span className="font-semibold text-center">HOW IT WORKS</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mx-auto mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Marketing automation made simple
          </h2>

          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium text-center mx-auto mb-16 max-w-[600px]">
            Our AI marketing agent works behind the scenes to optimize your campaigns while you focus on growing your
            business.
          </p>

          <div className="w-full flex flex-col items-center gap-16 mb-16">
            {[
              {
                number: "1",
                title: "Connect your channels",
                description:
                  "Integrate with your existing marketing platforms and social media accounts in just a few clicks.",
              },
              {
                number: "2",
                title: "Define your goals",
                description:
                  "Set your marketing objectives, target audience, and budget parameters for the AI to optimize against.",
              },
              {
                number: "3",
                title: "Let AI do the work",
                description:
                  "Our AI creates content, schedules posts, optimizes ad spend, and continuously improves based on performance.",
              },
              {
                number: "4",
                title: "Monitor and refine",
                description:
                  "Review detailed analytics and insights, then provide feedback to further enhance AI performance.",
              },
            ].map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center max-w-[700px] mx-auto w-full group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4 md:mb-0 mx-auto md:mx-0 shadow-md transition-transform duration-300 group-hover:scale-110 relative">
                  <span className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    {step.number}
                  </span>
                  <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700 scale-110 opacity-50 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500"></div>
                </div>

                <div className="md:ml-6 flex flex-col items-center md:items-start">
                  <h3 className="text-xl font-bold mb-2 text-center md:text-left mx-auto md:mx-0 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-medium text-center md:text-left mx-auto md:mx-0">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-[800px] mx-auto mb-10 flex justify-center items-center">
            <div className="w-full overflow-hidden rounded-xl border bg-background shadow-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              <img
                src="/placeholder.svg?height=500&width=800&query=AI%20marketing%20workflow%20dashboard%20with%20analytics"
                alt="Marketing AI Dashboard"
                className="w-full h-auto object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="flex justify-center items-center mx-auto">
            <Button className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black mx-auto transition-all duration-300 hover:shadow-lg group">
              See it in action
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
