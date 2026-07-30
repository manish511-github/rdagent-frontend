/** SSE helpers for Agent Chat turn streams. */

import type { AgentTurnEvent } from "./types";

export async function* iterateSseJson(
  response: Response
): AsyncGenerator<AgentTurnEvent, void, unknown> {
  if (!response.body) {
    throw new Error("Turn response did not include a stream body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let splitAt = buffer.indexOf("\n\n");
    while (splitAt >= 0) {
      const rawEvent = buffer.slice(0, splitAt);
      buffer = buffer.slice(splitAt + 2);
      const parsed = parseSseEvent(rawEvent);
      if (parsed) yield parsed;
      splitAt = buffer.indexOf("\n\n");
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseEvent(buffer);
    if (parsed) yield parsed;
  }
}

function parseSseEvent(rawEvent: string): AgentTurnEvent | null {
  const lines = rawEvent.split(/\r?\n/);
  const dataLines: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (!dataLines.length) return null;
  const payload = dataLines.join("\n");
  try {
    return JSON.parse(payload) as AgentTurnEvent;
  } catch {
    return null;
  }
}
