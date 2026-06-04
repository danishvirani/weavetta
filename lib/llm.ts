import type { LLMProvider } from "./types";
import { DEFAULT_MODEL, modelsForProvider } from "./pricing";

// Shared shape + defaults for the LLM node. The runner (later commit) reads the
// same params off node.data, so defaults must live in one place.
export interface LLMParams {
  provider: LLMProvider;
  model: string;
  prompt: string;
  temperature: number;
}

export const PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openrouter", label: "OpenRouter" },
];

// OpenRouter has 300+ models, priced dynamically — so we take a model slug
// rather than a fixed dropdown, and default to a sensible one.
export const OPENROUTER_DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";

export const DEFAULT_LLM_PARAMS: LLMParams = {
  provider: "openai",
  model: DEFAULT_MODEL,
  prompt: "{{input}}",
  temperature: 0.7,
};

export function readLLMParams(params?: Record<string, unknown>): LLMParams {
  return {
    provider: (params?.provider as LLMProvider) ?? DEFAULT_LLM_PARAMS.provider,
    model: (params?.model as string) ?? DEFAULT_LLM_PARAMS.model,
    prompt: (params?.prompt as string) ?? DEFAULT_LLM_PARAMS.prompt,
    temperature:
      typeof params?.temperature === "number"
        ? params.temperature
        : DEFAULT_LLM_PARAMS.temperature,
  };
}

// The default model to select when switching to a given provider.
export function defaultModelFor(provider: LLMProvider): string {
  if (provider === "openrouter") return OPENROUTER_DEFAULT_MODEL;
  return modelsForProvider(provider)[0]?.model ?? DEFAULT_MODEL;
}
