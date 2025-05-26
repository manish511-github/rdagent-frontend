import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Faq() {
  const faqs = [
    {
      question: "How does the AI marketing agent work?",
      answer:
        "Our AI marketing agent uses advanced machine learning algorithms to analyze your business goals, target audience, and industry trends. It then creates, optimizes, and manages marketing campaigns across multiple channels, continuously learning and improving based on performance data.",
    },
    {
      question: "Do I need technical skills to use the platform?",
      answer:
        "Not at all! Our platform is designed with a user-friendly interface that requires no coding or technical expertise. You can easily set up campaigns, review analytics, and make adjustments with simple, intuitive controls.",
    },
    {
      question: "Can I integrate with my existing marketing tools?",
      answer:
        "Yes, our platform integrates seamlessly with popular marketing tools and platforms including Google Analytics, Facebook Ads, Mailchimp, HubSpot, Shopify, and many more. We also offer API access for custom integrations on our Professional and Enterprise plans.",
    },
    {
      question: "How long does it take to see results?",
      answer:
        "Most customers start seeing improvements in their marketing performance within the first 2-4 weeks. The AI continuously learns and optimizes based on results, so performance typically improves over time. For best results, we recommend running the platform for at least 3 months.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Absolutely. We take data security and privacy very seriously. All data is encrypted both in transit and at rest. We are GDPR compliant and never share your data with third parties. You retain full ownership of all your data and can export or delete it at any time.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Yes, you can cancel your subscription at any time with no cancellation fees. We offer a 14-day money-back guarantee for new customers, so you can try our platform risk-free.",
    },
  ]

  return (
    <section
      id="faq"
      className="w-full py-20 md:py-28 lg:py-32 flex justify-center items-center relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-40 right-[5%] w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-[5%] w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center mb-16">
          <div className="inline-block rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 text-sm text-center mx-auto mb-4 shadow-sm transform transition-all duration-300 hover:scale-105">
            <span className="font-medium uppercase tracking-wider text-center">SUPPORT</span>
          </div>

          <h2 className="font-inter font-semibold tracking-tight text-3xl sm:text-4xl text-center mx-auto mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Frequently asked questions
          </h2>

          <p className="text-muted-foreground font-medium md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center mx-auto max-w-[600px]">
            Everything you need to know about our AI marketing platform.
          </p>
        </div>

        <div className="w-full max-w-[800px] mx-auto bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
          <Accordion type="single" collapsible className="w-full mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className="mx-auto border-b border-gray-100 dark:border-gray-700 last:border-0 group"
              >
                <AccordionTrigger className="font-medium text-left py-5 transition-colors duration-300 hover:text-gray-900 dark:hover:text-white px-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-medium text-muted-foreground pb-5 px-6 transition-all duration-300 data-[state=open]:animate-accordion-down">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Extra Help CTA */}
        <div className="mt-12 w-full max-w-[800px] mx-auto bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground font-medium mb-4">
            Our team is ready to help you with any other questions you might have.
          </p>
          <Button className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black transition-all duration-300 hover:shadow-md">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  )
}
