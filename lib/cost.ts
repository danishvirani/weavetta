import { getModelPrice } from "./pricing";

export interface CostEstimate {
  usd: number;
  inputTokens: number;
  outputTokens: number;
}

export const ZERO_COST: CostEstimate = { usd: 0, inputTokens: 0, outputTokens: 0 };

// v0.0 stub. The real estimator (the wedge) lands in feat(cost-preview):
// tokenize each LLM node's resolved prompt, multiply by per-model rates,
// sum across the graph, and surface live next to Run.
export function estimateModelCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): CostEstimate {
  const price = getModelPrice(model);
  if (!price) return ZERO_COST;
  const usd =
    (inputTokens / 1_000_000) * price.inputPerM +
    (outputTokens / 1_000_000) * price.outputPerM;
  return { usd, inputTokens, outputTokens };
}

export function formatUsd(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}
