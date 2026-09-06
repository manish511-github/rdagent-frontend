"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Home,
  Layers3,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Table2,
  Users,
} from "lucide-react";

type DemoPanel = {
  tab: string;
  tableLabel: string;
  title: string;
  chatLabel: string;
  prompt: string;
  searching: string;
  resultNoun: string;
  response: string;
  followUpResponse: string;
  tags: string[];
  columns: Array<{ label: string; width: number }>;
  rows: string[][];
  completeLabel: string;
  pendingLabel: string;
};

const panels: DemoPanel[] = [
  {
    tab: "Find companies",
    tableLabel: "Companies",
    title: "Notable US companies funded over $500M",
    chatLabel: "Companies · Funding search",
    prompt: "Give me notable companies from US with funding greater than 500M.",
    searching: "Searching company records…",
    resultNoun: "company",
    response: "Results are appearing as Zooptics verifies funding, HQ, and notability.",
    followUpResponse: "Added to the company criteria. New matches will continue appearing in the table.",
    tags: ["United States HQ", "Total funding > $500M", "Sample data"],
    columns: [
      { label: "Company", width: 150 },
      { label: "Domain", width: 128 },
      { label: "HQ", width: 150 },
      { label: "Funding", width: 104 },
      { label: "Stage", width: 92 },
      { label: "Investors", width: 160 },
      { label: "Notable fit", width: 150 },
    ],
    rows: [
      ["Affirm", "affirm.com", "San Francisco, CA", "$920M", "Series D", "Founders Fund, Khosla", "High-profile fintech"],
      ["Airbnb", "airbnb.com", "San Francisco, CA", "$4.64B", "Series E", "Sequoia, a16z", "Global marketplace"],
      ["Cox Communications", "cox.com", "Atlanta, GA", "$500.8M", "Growth", "Dataset verified", "Major telecom brand"],
      ["DraftKings", "draftkings.com", "Boston, MA", "$855M", "Series D", "Raizlabs, Accomplice", "Public consumer brand"],
      ["Faraday Future", "ff.com", "Gardena, CA", "$2.0B", "Series J", "Strategic backers", "EV manufacturer"],
      ["Genesys", "genesys.com", "Daly City, CA", "$900M", "Series I", "Permira, Hellman", "Enterprise CX leader"],
      ["Hilton", "hilton.com", "McLean, VA", "$6.5B", "Series J", "Blackstone", "Global hospitality brand"],
      ["Hulu", "hulu.com", "Santa Monica, CA", "$1.27B", "Series J", "Disney, NBCU", "Streaming platform"],
      ["IO", "io.com", "Phoenix, AZ", "$1.25B", "Venture", "Data center investors", "Large infra provider"],
      ["Legendary", "legendary.com", "Burbank, CA", "$1.13B", "Series I", "Wanda, strategic", "Major media studio"],
      ["LivingSocial", "livingsocial.com", "Washington, DC", "$934M", "Series J", "Amazon, Grotech", "Known marketplace"],
      ["AvidXchange", "avidxchange.com", "Charlotte, NC", "$550M", "Series I", "Bain, TPG", "B2B payments platform"],
    ],
    completeLabel: "Verified",
    pendingLabel: "Verifying",
  },
  {
    tab: "Find conversations",
    tableLabel: "Conversations",
    title: "Salesforce complaints · Last 30 days",
    chatLabel: "Social listening · Salesforce",
    prompt: "Find users complaining about Salesforce across Reddit, LinkedIn, and X from the last 30 days.",
    searching: "Scanning social conversations…",
    resultNoun: "conversation",
    response: "Posts are appearing as Zooptics checks relevance, sentiment, and buying intent.",
    followUpResponse: "Added to the social search. New conversations will use the updated criteria.",
    tags: ["Reddit + LinkedIn + X", "Past 30 days", "Complaint intent"],
    columns: [
      { label: "Source", width: 86 },
      { label: "Author", width: 130 },
      { label: "Conversation", width: 270 },
      { label: "Community", width: 142 },
      { label: "Engagement", width: 98 },
      { label: "Sentiment", width: 100 },
      { label: "Matched term", width: 150 },
    ],
    rows: [
      ["Reddit", "revops_builder", "Salesforce reporting takes longer than the analysis", "r/salesforce", "84", "Negative", "reporting pain"],
      ["LinkedIn", "Maya R.", "Our CRM cleanup has become a full-time project", "RevOps", "126", "Frustrated", "admin overhead"],
      ["X", "@pipelinepat", "Another Salesforce sync failed without an alert", "Sales Ops", "61", "Negative", "broken sync"],
      ["Reddit", "cloudadmin22", "Why does a simple workflow need three consultants?", "r/CRM", "47", "Negative", "implementation cost"],
      ["LinkedIn", "Jordan Lee", "Teams avoid the CRM when every update takes five clicks", "B2B SaaS", "203", "Frustrated", "low adoption"],
      ["X", "@sdrsystems", "Duplicate accounts are back after yesterday's import", "Revenue Tech", "39", "Negative", "duplicate data"],
      ["Reddit", "ops_nomad", "Looking for a simpler Salesforce alternative for 25 reps", "r/salesops", "112", "High intent", "switching CRM"],
      ["LinkedIn", "Priya S.", "Enterprise CRM pricing should not be this hard to forecast", "Fintech", "94", "Negative", "pricing"],
      ["X", "@growthstack", "We spend more time maintaining fields than talking to leads", "Growth", "73", "Frustrated", "manual work"],
      ["Reddit", "founder_mode_on", "Is Salesforce too much for a Series A startup?", "r/startups", "156", "High intent", "too complex"],
      ["LinkedIn", "Daniel K.", "CRM adoption dropped after our latest customization", "Operations", "68", "Negative", "poor adoption"],
      ["X", "@revenueamy", "Evaluating lighter CRMs before our renewal date", "SaaS", "91", "High intent", "renewal risk"],
    ],
    completeLabel: "Matched",
    pendingLabel: "Checking",
  },
  {
    tab: "Review leads",
    tableLabel: "Qualified leads",
    title: "Salesforce replacement opportunities",
    chatLabel: "Lead review · Priority accounts",
    prompt: "Prioritize the strongest Salesforce replacement opportunities and assign the next action.",
    searching: "Scoring matched accounts…",
    resultNoun: "qualified lead",
    response: "Accounts are appearing as Zooptics combines company fit, intent, and timing signals.",
    followUpResponse: "Added to the qualification rules. Lead scores and next actions will update.",
    tags: ["Strong intent", "ICP matched", "Demo values"],
    columns: [
      { label: "Company", width: 138 },
      { label: "Contact", width: 126 },
      { label: "Role", width: 150 },
      { label: "Buying signal", width: 245 },
      { label: "Score", width: 76 },
      { label: "Owner", width: 104 },
      { label: "Next action", width: 150 },
    ],
    rows: [
      ["Northstar Labs", "Maya Reed", "VP Revenue Ops", "Asked for simpler CRM options", "96", "Alex", "Send comparison"],
      ["Brightlane", "Jordan Lee", "Head of Sales", "Renewal due in 45 days", "94", "Sam", "Book discovery"],
      ["Arcwell", "Priya Shah", "COO", "Posted about high admin cost", "92", "Mina", "Share ROI brief"],
      ["CloudHarbor", "Daniel Kim", "RevOps Director", "Hiring CRM migration lead", "90", "Alex", "Personalized email"],
      ["MetricFox", "Elena Cruz", "Sales Ops Lead", "Evaluating lighter CRM tools", "89", "Jo", "Connect on LinkedIn"],
      ["VantaWorks", "Owen Park", "VP Sales", "Team adoption dropped", "87", "Sam", "Send workflow demo"],
      ["Aster Health", "Nina Patel", "Systems Director", "Complained about duplicate data", "85", "Mina", "Offer data audit"],
      ["RelayStack", "Chris Morgan", "Founder", "Series A team outgrew setup", "84", "Jo", "Founder outreach"],
      ["ForgePoint", "Amir Khan", "Revenue Systems", "Integration failures mentioned", "82", "Alex", "Share integration guide"],
      ["Pinecone Media", "Sara Chen", "Growth Director", "Comparing CRM pricing", "80", "Sam", "Send pricing sheet"],
      ["OrbitPay", "Leo Grant", "Sales Director", "Manual reporting pain", "78", "Jo", "Invite to demo"],
      ["Daylight AI", "Emma Brooks", "Operations Lead", "Requested peer recommendations", "76", "Mina", "Send customer story"],
    ],
    completeLabel: "Ready",
    pendingLabel: "Scoring",
  },
];

const DEMO_ROW_COUNT = 12;
const TICK_MS = 360;
const LAST_TICK = DEMO_ROW_COUNT + 1;

function ResearchRail() {
  const items = [Home, Layers3, ShieldCheck, Table2, Users];
  return (
    <nav aria-label="Workspace tools" className="hidden border-r border-zinc-200 bg-zinc-50/70 py-3 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex sm:flex-col sm:items-center sm:gap-2">
      {items.map((Icon, index) => (
        <button key={index} type="button" aria-label={["Home", "Sources", "Verification", "Tables", "People"][index]} className={`grid size-8 place-items-center rounded-md ${index === 0 ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"}`}>
          <Icon className="size-3.5" strokeWidth={1.7} />
        </button>
      ))}
    </nav>
  );
}

function ResearchChat({ panel, found }: { panel: DemoPanel; found: number }) {
  const [followUp, setFollowUp] = useState("");
  const [submittedFollowUp, setSubmittedFollowUp] = useState("");

  const submitFollowUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = followUp.trim();
    if (!value) return;
    setSubmittedFollowUp(value);
    setFollowUp("");
  };

  return (
    <div className="grid min-h-[430px] grid-cols-1 sm:grid-cols-[42px_minmax(0,1fr)] lg:min-h-[610px]">
      <ResearchRail />
      <div className="flex min-h-0 flex-col">
        <div className="flex h-11 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
          <span className="text-xs font-medium">{panel.chatLabel}</span>
          <button type="button" aria-label="More chat options" className="grid size-7 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><MoreHorizontal className="size-4" /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 text-xs leading-5">
          <div className="rounded-md bg-zinc-100 px-3 py-2.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{panel.prompt}</div>
          <div className="text-zinc-600 dark:text-zinc-300">
            {found === 0 ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="size-3.5 animate-spin" /> {panel.searching}</span>
            ) : (
              <>Found <strong className="font-semibold text-zinc-900 dark:text-white">{found} matching {panel.resultNoun}{found === 1 ? "" : "s"}</strong>. {panel.response}</>
            )}
          </div>
          {submittedFollowUp ? (
            <>
              <div className="ml-6 rounded-md bg-zinc-100 px-3 py-2.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{submittedFollowUp}</div>
              <div className="text-zinc-600 dark:text-zinc-300">{panel.followUpResponse}</div>
            </>
          ) : null}
        </div>
        <form onSubmit={submitFollowUp} className="m-3 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <label htmlFor="lead-demo-follow-up" className="sr-only">Ask a follow-up</label>
          <input id="lead-demo-follow-up" value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder="Ask a follow-up…" className="h-9 w-full bg-transparent px-2 text-xs outline-none placeholder:text-zinc-400" />
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Add context" className="grid size-7 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Plus className="size-3.5" /></button>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500"><Sparkles className="size-3 text-blue-500" /> Deep research</span>
            </div>
            <button type="submit" disabled={!followUp.trim()} aria-label="Send follow-up" className="grid size-7 place-items-center rounded-md bg-zinc-900 text-white disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-white dark:text-zinc-900 dark:disabled:bg-zinc-700"><ArrowUp className="size-3.5" /></button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResultsTable({ panel, found, verified }: { panel: DemoPanel; found: number; verified: number }) {
  return (
    <div className="flex min-h-[610px] min-w-0 flex-col border-t border-zinc-200 dark:border-zinc-800 lg:border-l lg:border-t-0">
      <div className="flex h-11 items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">{panel.tableLabel} <ChevronDown className="size-3" /></button>
        <button type="button" aria-label="Add table" className="grid size-7 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Plus className="size-3.5" /></button>
      </div>
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">{panel.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
            {panel.tags.map((tag, index) => <span key={tag} className={index === panel.tags.length - 1 ? "rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300" : "rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700"}>{tag}</span>)}
          </div>
        </div>
        <div className="flex gap-6 text-[10px] text-zinc-500">
          <span>Results <strong className="mt-0.5 block text-base font-semibold tabular-nums text-zinc-900 dark:text-white">{found}</strong></span>
          <span>{panel.completeLabel} <strong className="mt-0.5 block text-base font-semibold tabular-nums text-emerald-600">{verified}</strong></span>
        </div>
      </div>
      <div className="h-[456px] min-h-0 overflow-auto">
        <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur dark:bg-zinc-900/95">
            <tr>
              <th className="w-8 border-b border-zinc-200 px-2 py-2 font-medium text-zinc-400 dark:border-zinc-800">#</th>
              {panel.columns.map((column) => <th key={column.label} style={{ width: column.width }} className="border-b border-zinc-200 px-2 py-2 font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">{column.label}</th>)}
              <th className="sticky right-0 w-[94px] border-b border-l border-zinc-200 bg-zinc-50 px-2 py-2 font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {panel.rows.slice(0, found).map((row, rowIndex) => {
              const isVerified = rowIndex < verified;
              return (
                <tr key={`${panel.tab}-${rowIndex}`} data-demo-row={rowIndex} className="h-[32px] animate-in fade-in slide-in-from-bottom-1 border-b border-zinc-100 duration-300 dark:border-zinc-800/80">
                  <td className="px-2 py-1.5 tabular-nums text-zinc-400">{rowIndex + 1}</td>
                  {row.map((cell, cellIndex) => <td key={cellIndex} className={`truncate px-2 py-1.5 ${cellIndex === 0 ? "font-medium text-zinc-900 dark:text-white" : cellIndex === 1 && panel.tableLabel === "Companies" ? "text-blue-600 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`} title={cell}>{cell}</td>)}
                  <td className="sticky right-0 border-l border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                    {isVerified ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="size-3" /> {panel.completeLabel}</span> : <span className="inline-flex items-center gap-1 text-zinc-400"><Loader2 className="size-3 animate-spin" /> {panel.pendingLabel}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex h-9 shrink-0 items-center justify-between border-t border-zinc-200 px-3 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>Showing {found} of {DEMO_ROW_COUNT}</span>
        <span className="text-emerald-600">{verified === DEMO_ROW_COUNT ? `All results ${panel.completeLabel.toLowerCase()}` : `${verified} ${panel.completeLabel.toLowerCase()}`}</span>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const panel = panels[activeStage];
  const complete = tick >= LAST_TICK;
  const found = Math.min(DEMO_ROW_COUNT, tick);
  const verified = Math.min(DEMO_ROW_COUNT, Math.max(0, tick - 1));

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || complete) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setTick((value) => Math.min(value + 1, LAST_TICK));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [complete, paused, visible]);

  const selectStage = (index: number) => {
    setActiveStage(index);
    setTick(0);
    setPaused(false);
  };

  const togglePlayback = () => {
    if (complete) {
      setTick(0);
      setPaused(false);
      return;
    }
    setPaused((value) => !value);
  };

  return (
    <section ref={sectionRef} id="workflow" aria-labelledby="workspace-demo-title" className="pb-14 pt-8 sm:pt-12">
      <h2 id="workspace-demo-title" className="sr-only">Dynamic research workspace demonstrations</h2>
      <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-800">
        {panels.map((item, index) => (
          <button key={item.tab} type="button" onClick={() => selectStage(index)} className={`relative h-14 text-sm transition-colors ${activeStage === index ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"}`}>
            {item.tab}
            {activeStage === index ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-zinc-900 dark:bg-white" /> : null}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <div className="grid lg:grid-cols-[34%_66%]">
          <ResearchChat key={`chat-${activeStage}`} panel={panel} found={found} />
          <ResultsTable key={`table-${activeStage}`} panel={panel} found={found} verified={verified} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={togglePlayback} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          {complete ? <><RotateCcw className="size-3.5" /> Replay demo</> : paused ? <><Play className="size-3.5" /> Resume</> : <><Pause className="size-3.5" /> Pause</>}
        </button>
      </div>
    </section>
  );
}
