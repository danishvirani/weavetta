import type { LLMProvider } from "./types";

// USD per 1,000,000 tokens. Public list rates, mid-2026.
// Verify against the providers' live pricing pages before each release.
export interface ModelPrice {
  provider: LLMProvider;
  model: string;
  label: string;
  inputPerM: number;
  outputPerM: number;
}

export const MODELS: ModelPrice[] = [
  { provider: "openai", model: "gpt-4o", label: "GPT-4o", inputPerM: 2.5, outputPerM: 10 },
  { provider: "openai", model: "gpt-4o-mini", label: "GPT-4o mini", inputPerM: 0.15, outputPerM: 0.6 },
  { provider: "anthropic", model: "claude-sonnet-4.5", label: "Claude Sonnet 4.5", inputPerM: 3, outputPerM: 15 },
  { provider: "anthropic", model: "claude-haiku-4.5", label: "Claude Haiku 4.5", inputPerM: 1, outputPerM: 5 },
  { provider: "anthropic", model: "claude-opus-4.1", label: "Claude Opus 4.1", inputPerM: 15, outputPerM: 75 },
];

export const DEFAULT_MODEL = MODELS[1].model; // gpt-4o-mini — cheapest default

export function getModelPrice(model: string): ModelPrice | undefined {
  const exact = MODELS.find((m) => m.model === model);
  if (exact) return exact;
  // OpenRouter slugs are "vendor/model" (e.g. "anthropic/claude-sonnet-4.5").
  // Fall back to the part after the last slash so a slug that names a model we
  // do know still gets priced instead of silently dropping out of the estimate.
  if (model.includes("/")) {
    const suffix = model.slice(model.lastIndexOf("/") + 1);
    return MODELS.find((m) => m.model === suffix);
  }
  return undefined;
}

export function modelsForProvider(provider: LLMProvider): ModelPrice[] {
  return MODELS.filter((m) => m.provider === provider);
}
