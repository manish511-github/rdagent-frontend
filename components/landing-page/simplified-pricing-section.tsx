"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BadgeDollarSign, Rocket, Briefcase, Building, BadgeCheck } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

const plans = [
  {
    name: "Basic plan",
    icon: Rocket,
    price: 19,
    yearlyPrice: 199,
    features: [
      "Basic task management tools",
      "Calendar sync with limited integrations",
      "Access to 1 dashboard for tracking tasks",
      "Limited AI suggestions and insights",
      "Basic support and community access",
    ],
    buttonVariant: "secondary" as const,
    popular: false,
  },
  {
    name: "Business plan",
    icon: Briefcase,
    price: 29,
    yearlyPrice: 299,
    features: [
      "All Free Plan features, plus:",
      "Unlimited task lists",
      "Advanced calendar sync",
      "AI-driven insights",
      "Access to custom dashboards",
      "Priority email support",
    ],
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise plan",
    icon: Building,
    price: 49,
    yearlyPrice: 499,
    features: [
      "All Pro Plan features, plus:",
      "Dedicated account manager",
      "Custom integrations",
      "Real-time collaboration",
      "Role-based permissions",
      "24/7 priority support",
    ],
    buttonVariant: "secondary" as const,
    popular: false,
  },
]

export function SimplifiedPricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-14 md:py-20 lg:py-px">
      <div className="border-b">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x border-none lg:items-center lg:text-center lg:py-0 px-2.5">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-xl">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <BadgeDollarSign className="size-5" />
                </motion.div>
                <span>Spenders Lounge</span>
              </Badge>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-medium">Pricing for everyone</h2>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light">
              Choose the Plan that Fits Your Productivity Needs
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container mt-10 lg:mt-11">
        <StaggerContainer className="grid border max-lg:divide-y lg:grid-cols-3 lg:divide-x" staggerDelay={0.2}>
          {plans.map((plan, index) => (
            <StaggerItem key={index}>
              <motion.div
                className={`flex flex-col justify-between p-6 relative ${plan.popular ? "bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20" : ""}`}
                whileHover={{
                  y: plan.popular ? 0 : -5,
                  scale: plan.popular ? 1.02 : 1.01,
                  boxShadow: plan.popular
                    ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                    : "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </motion.div>
                )}

                <div className="space-y-2 border-b pb-6">
                  <div className="text-muted-foreground flex items-center gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <plan.icon className="size-4" />
                    </motion.div>
                    <h3 className="text-xl tracking-[-0.8px]">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline font-medium">
                    <motion.span
                      className="text-[3.5rem] leading-[120%] tracking-[-3.92px]"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 300 }}
                    >
                      ${isYearly ? plan.yearlyPrice : plan.price}
                    </motion.span>
                    <span className="text-muted-foreground-subtle text-2xl tracking-[-0.96px]">
                      {isYearly ? "/year" : "/mo"}
                    </span>
                  </div>
                  {!isYearly && <p className="text-muted-foreground">or ${plan.yearlyPrice} yearly</p>}
                </div>

                <div className="pt-6">
                  <h4 className="text-muted-foreground-subtle">Features Included</h4>
                  <ul className="mt-4 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.05 + 0.5 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <BadgeCheck className="text-muted-foreground size-6" />
                        </motion.div>
                        <span className="text-muted-foreground tracking-[-0.32px]">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="mt-12"
                >
                  <Button
                    variant={plan.buttonVariant}
                    className={`w-full relative overflow-hidden group ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : ""
                    }`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <span className="relative z-10">Get started</span>
                  </Button>
                </motion.div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex gap-[2px] rounded-md border p-[2px]">
            <Button
              variant={!isYearly ? "default" : "outline"}
              size="sm"
              onClick={() => setIsYearly(false)}
              className="transition-colors"
            >
              Monthly
            </Button>
            <Button
              variant={isYearly ? "default" : "outline"}
              size="sm"
              onClick={() => setIsYearly(true)}
              className="transition-colors"
            >
              Yearly
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
