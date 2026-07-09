import type { AgentRunResponse } from "./types";

export function inferSkillFromPrompt(prompt: string) {
  if (
    /\b(track|tracking|monitor|watch|mentions?|social listening|keyword tracking|brand monitoring)\b/i.test(
      prompt
    )
  ) {
    return "mention-tracking";
  }
  if (/\b(hacker news|hackernews|hn)\b/i.test(prompt)) {
    return "hackernews-lead-discovery";
  }
  if (/\b(twitter|x\.com|x)\b/i.test(prompt)) {
    return "x-lead-discovery";
  }
  return "reddit-lead-discovery";
}

export function isMentionTrackingResult(data: AgentRunResponse) {
  return (
    data.skill_used === "mention-tracking" ||
    data.tool_calls.some((call) => call.name === "mention_tracking")
  );
}

export function normalizeKeywords(values: string[]) {
  const out: string[] = [];
  for (const value of values) {
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    if (out.some((item) => item.toLowerCase() === cleaned.toLowerCase()))
      continue;
    out.push(cleaned);
  }
  return out;
}
