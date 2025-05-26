import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for individuals and small businesses just getting started with AI marketing.",
      features: [
        "5 AI-generated campaigns",
        "3 marketing channels",
        "Basic analytics dashboard",
        "24-hour support response",
        "1 team member",
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline",
      gradientBorder: "from-blue-400/0 via-blue-400/20 to-blue-400/0",
    },
    {
      name: "Professional",
      price: "$99",
      description: "Ideal for growing businesses needing advanced marketing automation.",
      features: [
        "15 AI-generated campaigns",
        "All marketing channels",
        "Advanced analytics & reporting",
        "Priority 12-hour support",
        "5 team members",
        "A/B testing capabilities",
        "Custom audience targeting",
      ],
      popular: true,
      buttonText: "Get Started",
      buttonVariant: "default",
      gradientBorder: "from-purple-400/0 via-purple-400/20 to-purple-400/0",
    },
    {
      name: "Enterprise",
      price: "$249",
      description: "Complete solution for agencies and large businesses with complex marketing needs.",
      features: [
        "Unlimited AI-generated campaigns",
        "All marketing channels",
        "Premium analytics suite",
        "6-hour express support",
        "Unlimited team members",
        "Advanced A/B testing",
        "Custom integrations",
        "Dedicated account manager",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      gradientBorder: "from-green-400/0 via-green-400/20 to-green-400/0",
    },
  ]

  return (
    <section
      id="pricing"
      className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900/80 flex justify-center items-center relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <div className="absolute top-40 left-[5%] w-72 h-72 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-[5%] w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center mb-16">
          <div className="inline-block rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 text-sm text-center mx-auto mb-4 shadow-sm transform transition-all duration-300 hover:scale-105">
            <span className="font-medium uppercase tracking-wider text-center">PRICING</span>
          </div>

          <h2 className="font-inter font-semibold tracking-tight text-3xl sm:text-4xl text-center mx-auto mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Simple, transparent pricing
          </h2>

          <p className="text-muted-foreground font-medium md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center mx-auto max-w-[600px]">
            Choose the perfect plan for your marketing needs.
          </p>
        </div>

        <div className="flex justify-center items-center mx-auto mb-12">
          <div className="inline-flex items-center p-1 bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 mx-auto shadow-sm">
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-black text-white dark:bg-white dark:text-black">
              Monthly
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground transition-colors duration-300 hover:text-gray-900 dark:hover:text-white">
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1000px] mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col items-center text-center mx-auto w-full bg-white dark:bg-gray-800/60 backdrop-blur-sm border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl relative group ${
                plan.popular ? "md:scale-105 shadow-lg" : ""
              }`}
            >
              {/* Animated gradient border effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${plan.gradientBorder} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}
              ></div>

              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 px-3 py-1 text-xs font-medium text-white dark:text-black text-center shadow-md">
                  Most Popular
                </div>
              )}

              <CardHeader className={`flex flex-col items-center w-full ${plan.popular ? "pt-8" : ""}`}>
                <CardTitle className="font-semibold text-xl text-center mx-auto group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 mt-2 mx-auto">
                  <span className="text-4xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground font-light text-center">/month</span>
                </div>
                <CardDescription className="pt-1.5 font-medium text-center mx-auto">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-3 w-full">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center gap-2 justify-center w-full mx-auto group-hover:translate-x-1 transition-transform duration-300 ease-in-out"
                  >
                    <Check className="h-4 w-4 flex-shrink-0 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-sm font-medium text-center">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="w-full flex justify-center items-center">
                <Button
                  className={`w-full mx-auto transition-all duration-300 group-hover:shadow-md ${
                    plan.buttonVariant === "default"
                      ? "bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                      : ""
                  }`}
                  variant={plan.buttonVariant === "default" ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
