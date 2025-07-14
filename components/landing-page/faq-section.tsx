"use client"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle } from "lucide-react" // Changed MessageCircleQuestion to MessageCircle
import { motion } from "framer-motion" // Added motion import for animations
import { FadeIn } from "@/components/animations/fade-in" // Added FadeIn import

const faqs = [
  {
    question: "How does Market-Agent find posts related to my company and products?",
    answer:
      "Our AI agents use advanced algorithms to scan social media platforms, forums, and online discussions for mentions of your brand, products, and relevant keywords. The system continuously monitors conversations and automatically identifies posts that are relevant to your business.",
  },
  {
    question: "Can I customize what the AI agents look for?",
    answer:
      "Yes! You can easily tailor the agents to focus on specific keywords, product names, industry terms, or competitor mentions. This ensures you get the most relevant and actionable insights for your business.",
  },
  {
    question: "How does the lead generation feature work?",
    answer:
      "Our AI agents analyze online conversations to identify users who are actively discussing topics related to your products or showing interest in your industry. These qualified leads are then delivered to your dashboard for follow-up.",
  },
  {
    question: "Can I review and approve posts before they go live?",
    answer:
      "While our AI agents can automatically engage, you have full control. You can review, edit, or approve any automated responses before they’re posted, ensuring your brand voice remains authentic.",
  },
  {
    question: "Which platforms does Market-Agent work with?",
    answer:
      "Market-Agent currently supports Reddit, Twitter, and Hacker News, with plans to expand to additional platforms. Each platform is optimized for its unique features and audience.",
  },
  {
    question: "How accurate is the sentiment analysis?",
    answer:
      "Our AI uses advanced natural language processing to accurately assess the tone and sentiment of conversations about your brand. The system continuously learns and improves to provide more precise insights over time.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Yes! Market-Agent includes smart post scheduling features that let you plan and schedule content across multiple platforms, ensuring your posts reach your audience at the optimal time.",
  },
  {
    question: "How do I get started with Market-Agent?",
    answer:
      "Simply sign up, connect your social media accounts, and configure your AI agents with your specific keywords and goals. Our intuitive dashboard makes it easy to get up and running in minutes.",
  },
]

export function FAQSection() {
  return (
    <section>
      <div className="container border-x">
        <div className="mx-auto max-w-3xl flex flex-col gap-6 py-8 md:py-12 lg:py-16">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 font-normal tracking-tight shadow-sm text-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                >
                  <MessageCircle className="size-6" /> {/* Changed to MessageCircle */}
                </motion.div>
                <span>FAQ</span>
              </Badge>
            </motion.div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl font-medium">
              Everything You Need to Know
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light text-lg">
              Looking for quick answers? Check out our <span className="underline">FAQ section</span>.
            </p>
          </FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.8, duration: 0.5 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="text-primary rounded-[7px] border px-6 data-[state=open]:pb-2 transition-all duration-300"
                  >
                    <AccordionTrigger className="tracking-[-0.32px] hover:no-underline py-2.5 text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base tracking-[-0.32px]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
