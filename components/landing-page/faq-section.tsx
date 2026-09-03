"use client"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Zooptics find companies and people?",
    answer:
      "Agent Chat converts your request into a search plan, selects available structured or web-research services, and stores the resulting records in a workspace table with source data and execution status.",
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
    question: "Can I review results before using them?",
    answer:
      "Yes. Results remain visible in the workspace with matched, uncertain, no-match, and failed outcomes so you can review the evidence instead of treating missing data as a valid match.",
  },
  {
    question: "Which data sources does Zooptics use?",
    answer:
      "Zooptics can combine company and people datasets, search providers, public web research, local-business sources, job data, and configured enrichment services. Availability depends on the providers enabled in your workspace.",
  },
  {
    question: "How accurate is the sentiment analysis?",
    answer:
      "Our AI uses advanced natural language processing to accurately assess the tone and sentiment of conversations about your brand. The system continuously learns and improves to provide more precise insights over time.",
  },
  {
    question: "How do I get started with Zooptics?",
    answer:
      "Sign up, open Agent Chat, and describe the companies, people, or signals you want. Zooptics will clarify material criteria, present a plan, and build the first reviewable table sample.",
  },
]

export function FAQSection() {
  return (
    <section>
      <div className="container border-x">
        <section className="mx-auto max-w-7xl space-y-10 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-sm font-medium w-fit">
              Frequently Asked Questions
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tighter md:text-5xl">
              Everything You Need to Know
            </h1>
            <p className="mt-2 text-balance text-lg text-muted-foreground">
              Looking for quick answers? Check out our FAQ section.
            </p>
          </div>

          <Accordion type="single" collapsible className="mx-auto w-full max-w-2xl text-base">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index + 1}`} className="border-b last:border-b-0">
                <AccordionTrigger className="flex items-start justify-between gap-4 rounded-md py-6 text-left text-base font-medium hover:underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center">
            <Link href="#" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90">
              View all FAQs →
            </Link>
          </div>
        </section>
      </div>
      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x" />
      </div>
    </section>
  )
}
