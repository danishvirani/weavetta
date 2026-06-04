import { encode } from "gpt-tokenizer";
import type { Edge } from "@xyflow/react";
import type { FlowNode } from "./store";
import { readLLMParams } from "./llm";
import { getModelPrice } from "./pricing";
import { resolveUpstreamText } from "./graph";

// The cost wedge: walk the graph, tokenize each LLM node's resolved prompt,
// price input + (capped) output against the per-model rate table, and sum.
// This runs live as the user edits — the whole point is to see the number
// before clicking Run, not after the bill arrives.

// gpt-tokenizer is a GPT (cl100k) tokenizer. For Anthropic models it's an
// approximation, but token counts land within ~10–15% across these vocabs —
// fine for a pre-run estimate, and we label the number as one.
export function countTokens(text: string): number {
  if (!text) return 0;
  try {
    return encode(text).length;
  } catch {
    // Defensive fallback: ~4 chars/token is the usual rule of thumb.
    return Math.ceil(text.length / 4);
  }
}

// Substitute the {{input}} placeholder with upstream text. Tolerates inner
// whitespace ({{ input }}). The runner uses the same substitution later.
export function resolvePrompt(prompt: string, upstreamText: string): string {
  return prompt.replace(/\{\{\s*input\s*\}\}/g, upstreamText);
}

export interface NodeCost {
  nodeId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  usd: number;
  // false when no per-model rate is known (e.g. an OpenRouter slug we can't map
  // to the price table). Such nodes contribute 0 and are surfaced separately so
  // the total never silently understates by pretending they're free.
  priced: boolean;
}

export interface GraphCost {
  usd: number;
  inputTokens: number;
  outputTokens: number;
  perNode: NodeCost[];
  llmNodes: number;
  unpricedNodes: number;
}

export const EMPTY_GRAPH_COST: GraphCost = {
  usd: 0,
  inputTokens: 0,
  outputTokens: 0,
  perNode: [],
  llmNodes: 0,
  unpricedNodes: 0,
};

export function estimateGraphCost(nodes: FlowNode[], edges: Edge[]): GraphCost {
  const perNode: NodeCost[] = [];
  let usd = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let unpricedNodes = 0;

  for (const node of nodes) {
    if (node.data.kind !== "llm") continue;

    const { model, prompt, maxTokens } = readLLMParams(node.data.params);
    const upstream = resolveUpstreamText(node.id, nodes, edges);
    const resolved = resolvePrompt(prompt, upstream);

    const inTok = countTokens(resolved);
    const outTok = maxTokens; // ceiling — real output is unknown pre-run
    const price = getModelPrice(model);
    const priced = Boolean(price);
    const nodeUsd = price
      ? (inTok / 1_000_000) * price.inputPerM +
        (outTok / 1_000_000) * price.outputPerM
      : 0;

    if (!priced) unpricedNodes += 1;
    usd += nodeUsd;
    inputTokens += inTok;
    outputTokens += outTok;

    perNode.push({
      nodeId: node.id,
      model,
      inputTokens: inTok,
      outputTokens: outTok,
      usd: nodeUsd,
      priced,
    });
  }

  return {
    usd,
    inputTokens,
    outputTokens,
    perNode,
    llmNodes: perNode.length,
    unpricedNodes,
  };
}
