import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director, TechCorp",
      image: "/placeholder.svg?height=100&width=100&query=professional%20headshot%20marketing%20director",
      quote:
        "MarketingAI has revolutionized our approach to digital marketing. We've seen a 43% increase in conversion rates and saved countless hours on campaign management.",
    },
    {
      name: "Michael Chen",
      role: "Founder, StyleHub",
      image: "/placeholder.svg?height=100&width=100&query=professional%20headshot%20ecommerce%20founder",
      quote:
        "As a small e-commerce business, we couldn't afford a full marketing team. MarketingAI gives us enterprise-level marketing capabilities at a fraction of the cost.",
    },
    {
      name: "Jessica Rodriguez",
      role: "CEO, Digital Spark Agency",
      image: "/placeholder.svg?height=100&width=100&query=professional%20headshot%20agency%20CEO",
      quote:
        "We've integrated MarketingAI into our agency workflow and now deliver better results to clients in half the time. It's been a game-changer for our business.",
    },
  ]

  return (
    <section
      id="testimonials"
      className="w-full py-20 md:py-28 lg:py-32 flex justify-center items-center relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute top-40 right-[5%] w-72 h-72 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-[5%] w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center mb-16">
          <div className="inline-block rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 text-sm text-center mx-auto mb-4 shadow-sm transform transition-all duration-300 hover:scale-105">
            <span className="font-medium uppercase tracking-wider text-center">SUCCESS STORIES</span>
          </div>

          <h2 className="font-inter font-semibold tracking-tight text-3xl sm:text-4xl text-center mx-auto mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Trusted by marketers worldwide
          </h2>

          <p className="text-muted-foreground font-medium md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center mx-auto max-w-[600px]">
            See how businesses are transforming their marketing with our AI-powered platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1000px] mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800/60 backdrop-blur-sm border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col items-center mx-auto w-full transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-8 flex flex-col items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4 mx-auto shadow-md transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="text-center mb-4 mx-auto">
                  <h3 className="font-semibold text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                    {testimonial.name}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center">{testimonial.role}</p>
                </div>

                <div className="relative w-full">
                  <Quote className="absolute -left-1 -top-1 h-6 w-6 text-gray-300 dark:text-gray-600 transition-transform duration-300 group-hover:scale-125" />
                  <blockquote className="pl-6 italic text-muted-foreground font-medium text-center mx-auto">
                    {testimonial.quote}
                  </blockquote>
                </div>

                <div className="mt-4 flex justify-center mx-auto">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`h-5 w-5 text-yellow-500 transition-transform duration-300 ${i % 2 === 0 ? "group-hover:scale-110" : "group-hover:scale-90"}`}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center mx-auto">
          <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 backdrop-blur-sm px-6 py-3 mx-auto shadow-md transition-all duration-300 hover:shadow-lg group">
            <div className="flex -space-x-2 mr-3 transition-transform duration-300 group-hover:scale-105">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={`/placeholder.svg?height=100&width=100&query=professional%20headshot%20${i}`}
                  alt={`User ${i + 1}`}
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-center">
              Join <span className="font-semibold">2,500+</span> marketers already using MarketingAI
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
