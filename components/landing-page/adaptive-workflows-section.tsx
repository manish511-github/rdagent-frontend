import Link from "next/link";
import { ArrowUpRight, FileText, ShieldCheck, Table2, Store, Users, Layers, UserRound } from "lucide-react";

const capabilities = [
  {
    title: "Live sources first",
    description: "Use current web, maps, jobs, store, technology, company, and people data instead of relying on one stale database.",
  },
  {
    title: "Evidence on every answer",
    description: "Keep source URLs, confidence, reasoning, and match status attached to each enrichment for fast review.",
  },
  {
    title: "Tables that keep working",
    description: "Save a useful workflow, rerun it later, and preserve row state without rebuilding the research from chat history.",
  },
];

const useCases = [
  { title: "Local businesses", description: "Find clinics, plumbers, agencies, or restaurants by location, reviews, website, and technology." },
  { title: "Hiring signals", description: "Find companies hiring for a role and group relevant jobs into one row per employer." },
  { title: "Tech-stack lists", description: "Discover companies using Shopify, HubSpot, Klaviyo, Recharge, or a custom technology." },
  { title: "People enrichment", description: "Find founders, CEOs, and hiring contacts with transparent verification outcomes." },
];

export function AdaptiveWorkflowsSection() {
  const capabilityIcons = [FileText, ShieldCheck, Table2];
  const useCaseIcons = [Store, Users, Layers, UserRound];
  return (
    <>
      <section id="sources" className="py-12 sm:py-16">
        <h2 className="text-center font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Research you can inspect.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {capabilities.map((capability, index) => {
            const Icon = capabilityIcons[index];
            return <article key={capability.title} className="flex gap-4 md:border-r md:border-zinc-200 md:px-6 md:last:border-0 dark:md:border-zinc-800">
              <Icon className="size-9 shrink-0" strokeWidth={1.4} aria-hidden="true" />
              <div><h3 className="font-serif text-xl tracking-tight">{capability.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{capability.description}</p></div>
            </article>;
          })}
        </div>
      </section>
      <section id="use-cases" className="py-12 sm:py-16">
        <h2 className="mx-auto max-w-3xl text-center font-serif text-3xl tracking-[-0.04em] sm:text-4xl">One workspace for the markets you care about.</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {useCases.map((useCase, index) => {
            const Icon = useCaseIcons[index];
            return <article key={useCase.title} className="px-5 text-center lg:border-r lg:border-zinc-200 lg:last:border-0 dark:lg:border-zinc-800">
              <Icon className="mx-auto size-9" strokeWidth={1.4} aria-hidden="true" /><h3 className="mt-4 font-serif text-xl">{useCase.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{useCase.description}</p>
            </article>;
          })}
        </div>
      </section>
      <section id="pricing" className="pb-20 pt-12 text-center">
        <h2 className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Start with one qualified lead list.</h2>
        <Link href="/signup" className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">Try Zooptics<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </section>
    </>
  );
}
