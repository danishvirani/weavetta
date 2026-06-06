import type { LLMProvider } from "../types";

// Direct browser -> provider streaming. The user's key rides on the request
// from their own machine; it never touches a network we control. Each provider
// speaks SSE; we normalise the three wire formats into a single delta stream.

export interface ChatRequest {
  provider: LLMProvider;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  signal?: AbortSignal;
}

const ENDPOINTS: Record<LLMProvider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
};

function headersFor(req: ChatRequest): HeadersInit {
  if (req.provider === "anthropic") {
    return {
      "content-type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
      // Opt-in to direct browser access (enables CORS for BYOK clients).
      "anthropic-dangerous-direct-browser-access": "true",
    };
  }
  const h: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${req.apiKey}`,
  };
  if (req.provider === "openrouter") {
    // OpenRouter app-attribution headers (optional, best-effort).
    h["http-referer"] = "https://github.com/danishvirani/weavetta";
    h["x-title"] = "weavetta";
  }
  return h;
}

function bodyFor(req: ChatRequest): string {
  if (req.provider === "anthropic") {
    return JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      stream: true,
      messages: [{ role: "user", content: req.prompt }],
    });
  }
  return JSON.stringify({
    model: req.model,
    temperature: req.temperature,
    max_tokens: req.maxTokens,
    stream: true,
    messages: [{ role: "user", content: req.prompt }],
  });
}

// Yield raw SSE "data:" payloads (already stripped of the prefix), splitting the
// byte stream on newlines. Exported for testing the parser without a network.
export async function* sseData(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line.startsWith("data:")) yield line.slice(5).trim();
      }
    }
    const tail = buf.trim();
    if (tail.startsWith("data:")) yield tail.slice(5).trim();
  } finally {
    reader.releaseLock();
  }
}

// Normalise a provider's SSE payloads into text deltas.
export async function* deltasFrom(
  body: ReadableStream<Uint8Array>,
  provider: LLMProvider,
): AsyncGenerator<string> {
  for await (const data of sseData(body)) {
    if (!data || data === "[DONE]") {
      if (data === "[DONE]") return;
      continue;
    }
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch {
      continue; // ignore comments / keep-alives / partial frames
    }
    if (provider === "anthropic") {
      const ev = json as {
        type?: string;
        delta?: { type?: string; text?: string };
      };
      if (ev.type === "message_stop") return;
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
        if (ev.delta.text) yield ev.delta.text;
      }
    } else {
      const ev = json as {
        choices?: { delta?: { content?: string } }[];
      };
      const text = ev.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
  }
}

// --- Demo mode: a local, no-key, no-network simulated stream. ---
// Lets the whole build→cost→run→stream loop work on stage without touching a
// provider (no key, no CORS risk). The cost preview still shows the real
// estimate for the chosen model — only the execution is simulated.

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildDemoResponse(prompt: string): string {
  const firstLine =
    prompt
      .split("\n")
      .map((s) => s.trim())
      .find(Boolean) ?? "";
  const topic = firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
  return [
    topic ? `Here's a draft for: "${topic}"` : "Here's a draft:",
    "",
    "Lightweight. Fast. Built for the long run.",
    "Step into your best mile yet — breathable comfort, zero break-in,",
    "ready the moment you are.",
    "",
    "→ Ships Friday. Be first out the door.",
  ].join("\n");
}

export async function* simulateStream(
  prompt: string,
  maxTokens: number,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const tokens = buildDemoResponse(prompt).match(/\S+\s*/g) ?? [];
  const cap = Math.max(20, Math.min(maxTokens, 120));
  let count = 0;
  for (const t of tokens) {
    if (signal?.aborted) throw new DOMException("Run cancelled", "AbortError");
    if (count >= cap) break;
    yield t;
    count += 1;
    await sleep(40);
  }
}

// Build the request, validate the response, and stream normalised text deltas.
export async function* streamChat(req: ChatRequest): AsyncGenerator<string> {
  const res = await fetch(ENDPOINTS[req.provider], {
    method: "POST",
    headers: headersFor(req),
    body: bodyFor(req),
    signal: req.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    const snippet = detail.slice(0, 300);
    throw new Error(
      `${req.provider} request failed (${res.status})${snippet ? `: ${snippet}` : ""}`,
    );
  }

  yield* deltasFrom(res.body, req.provider);
}
