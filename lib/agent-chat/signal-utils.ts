import type { AgentRunResponse, AgentSignal } from "./types";

export function signalPlatform(signal: AgentSignal) {
  const url = signal.url || "";
  const sources = [signal.platform, signal.source]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  if (sources.some((source) => source === "x" || source === "twitter")) return "X/Twitter";
  if (sources.includes("reddit")) return "Reddit";
  if (sources.some((source) => ["hackernews", "hacker_news", "hn"].includes(source))) {
    return "Hacker News";
  }
  if (sources.includes("youtube")) return "YouTube";
  if (sources.includes("github")) return "GitHub";
  if (sources.includes("linkedin")) return "LinkedIn";
  if (sources.includes("devto")) return "Dev.to";
  if (sources.includes("producthunt")) return "Product Hunt";
  if (sources.includes("indiehackers")) return "Indie Hackers";
  if (sources.includes("newsletter")) return "Newsletter";
  if (signal.subreddit || /reddit\.com/i.test(url)) return "Reddit";
  if (signal.subx || /\b(?:x|twitter)\.com\//i.test(url)) return "X/Twitter";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/github\.com/i.test(url)) return "GitHub";
  if (/linkedin\.com/i.test(url)) return "LinkedIn";
  if (/dev\.to/i.test(url)) return "Dev.to";
  if (/producthunt\.com/i.test(url)) return "Product Hunt";
  if (/indiehackers\.com/i.test(url)) return "Indie Hackers";
  return "Hacker News";
}

export function formatSkillLabel(skill: string) {
  return skill.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function topPlatform(signals: AgentSignal[]) {
  const counts = new Map<string, number>();
  for (const signal of signals) {
    const platform = signalPlatform(signal);
    counts.set(platform, (counts.get(platform) || 0) + 1);
  }
  let top = "";
  let max = 0;
  for (const [platform, count] of counts) {
    if (count > max) {
      max = count;
      top = platform;
    }
  }
  return top;
}

export function summarizeRun(data: AgentRunResponse) {
  const count = resultDisplayCount(data);
  const platform = topPlatform(data.signals);
  return {
    count,
    skill: formatSkillLabel(data.skill_used),
    platform,
  };
}

export function resultDisplayCount(data?: AgentRunResponse | null) {
  if (!data) return 0;
  return data.workspace?.rows?.length || data.signals.length;
}

export function formatPlatformLabel(platform?: string, tool?: string) {
  const rawValue = platform || tool || "";
  const value = rawValue
    .toLowerCase()
    .replace(/_(fetch|search|discovery)$/, "");
  const compactValue = value.replace(/[\s_/-]+/g, "");
  const labels: Record<string, string> = {
    x: "X / Twitter",
    twitter: "X / Twitter",
    xtwitter: "X / Twitter",
    reddit: "Reddit",
    hackernews: "Hacker News",
    hackernew: "Hacker News",
    hn: "Hacker News",
    youtube: "YouTube",
    github: "GitHub",
    linkedin: "LinkedIn",
    devto: "Dev.to",
    producthunt: "Product Hunt",
    indiehackers: "Indie Hackers",
    newsletter: "Newsletters",
  };
  const existingLabel = Object.values(labels).find(
    (label) => label.toLowerCase() === value
  );
  return labels[value] || labels[compactValue] || existingLabel || rawValue || "Source";
}

/** Map display labels / source keys to `PlatformIcon` ids. */
export function platformIconKey(platform?: string, tool?: string) {
  const rawValue = platform || tool || "";
  const value = rawValue
    .toLowerCase()
    .replace(/_(fetch|search|discovery)$/, "")
    .replace(/[\s_/-]+/g, "");
  const keys: Record<string, string> = {
    x: "twitter",
    twitter: "twitter",
    xtwitter: "twitter",
    reddit: "reddit",
    hackernews: "hackernews",
    hackernew: "hackernews",
    hn: "hackernews",
    youtube: "youtube",
    linkedin: "linkedin",
    discord: "discord",
    slack: "slack",
    tiktok: "tiktok",
    instagram: "instagram",
    email: "email",
  };
  return keys[value] || value || "hackernews";
}
