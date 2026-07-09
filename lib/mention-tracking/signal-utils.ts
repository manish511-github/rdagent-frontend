import type { AgentRunResponse, AgentSignal } from "./types";

export function signalPlatform(signal: AgentSignal) {
  const url = signal.url || "";
  if (signal.platform === "x" || signal.source === "x") return "X/Twitter";
  if (signal.platform === "reddit") return "Reddit";
  if (signal.platform === "hackernews") return "Hacker News";
  if (signal.platform === "youtube") return "YouTube";
  if (signal.platform === "github") return "GitHub";
  if (signal.platform === "linkedin") return "LinkedIn";
  if (signal.platform === "devto") return "Dev.to";
  if (signal.platform === "producthunt") return "Product Hunt";
  if (signal.platform === "indiehackers") return "Indie Hackers";
  if (signal.platform === "newsletter") return "Newsletter";
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
  const count = data.signals.length;
  const platform = topPlatform(data.signals);
  return {
    count,
    skill: formatSkillLabel(data.skill_used),
    platform,
  };
}

export function formatPlatformLabel(platform?: string, tool?: string) {
  const value = platform || tool || "";
  const labels: Record<string, string> = {
    x: "X / Twitter",
    reddit: "Reddit",
    hackernews: "Hacker News",
    youtube: "YouTube",
    github: "GitHub",
    linkedin: "LinkedIn",
    devto: "Dev.to",
    producthunt: "Product Hunt",
    indiehackers: "Indie Hackers",
    newsletter: "Newsletters",
  };
  return labels[value.toLowerCase()] || value.replaceAll("_", " ") || "platform";
}
