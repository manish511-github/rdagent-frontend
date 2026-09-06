"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const examplePrompts = [
  {
    label: "Shopify brands",
    prompt: "Find Shopify fitness supplement brands using Klaviyo with 1,000+ customer reviews.",
  },
  {
    label: "Backend hiring",
    prompt: "Find companies hiring backend engineers globally in the last 60 days.",
  },
  {
    label: "Funded AI startups",
    prompt: "Find AI startups in San Francisco that recently raised Seed or Series A funding.",
  },
];

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    window.localStorage.setItem("zooptics:pending-research-prompt", value);
    router.push(`/signup?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <section className="px-1 pb-8 pt-14 text-center sm:pt-20">
      <h1 className="mx-auto max-w-[880px] text-balance font-serif text-[clamp(2.7rem,5.7vw,5.2rem)] font-normal leading-[1.06] tracking-[-0.055em]">
        Turn any market into a qualified lead list.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-zinc-500 dark:text-zinc-400 sm:text-lg">
        Describe the companies you want. Research the sources. Review the evidence.
      </p>
      <form onSubmit={submitPrompt} className="mx-auto mt-8 max-w-[760px]">
        <label htmlFor="research-prompt" className="sr-only">Describe your ideal customer</label>
        <textarea id="research-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe your ideal customer…" rows={3}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-5 text-base leading-7 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {examplePrompts.map((example) => <button key={example.label} type="button" onClick={() => setPrompt(example.prompt)} className="min-h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800">{example.label}</button>)}
        </div>
        <button type="submit" disabled={!prompt.trim()} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-7 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950">
          Build my list <ArrowUpRight className="size-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
