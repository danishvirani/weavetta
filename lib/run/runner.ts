import type { Edge } from "@xyflow/react";
import type { FlowNode } from "../store";
import type { LLMProvider } from "../types";
import { getUpstreamIds, nodeText } from "../graph";
import { resolvePrompt } from "../estimate";
import { readLLMParams } from "../llm";
import { streamChat, simulateStream } from "./providers";

// Kahn topological sort so each node runs after its upstreams. Falls back to the
// original order for any nodes left in a cycle (the canvas allows cycles; a
// Loop node will own real iteration later — for now we just don't hang).
export function topoSort(nodes: FlowNode[], edges: Edge[]): FlowNode[] {
  const indeg = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  for (const e of edges) {
    if (indeg.has(e.target)) indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }
  const queue = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ordered: FlowNode[] = [];
  const seen = new Set<string>();

  while (queue.length) {
    const n = queue.shift()!;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    ordered.push(n);
    for (const e of edges) {
      if (e.source !== n.id) continue;
      const d = (indeg.get(e.target) ?? 0) - 1;
      indeg.set(e.target, d);
      if (d <= 0) {
        const t = byId.get(e.target);
        if (t && !seen.has(t.id)) queue.push(t);
      }
    }
  }
  for (const n of nodes) if (!seen.has(n.id)) ordered.push(n);
  return ordered;
}

export interface RunCallbacks {
  getKey: (provider: LLMProvider) => string | undefined;
  // When true, LLM nodes run a local simulated stream — no key, no network.
  simulate?: boolean;
  onNodeStart: (nodeId: string, input: string) => void;
  onNodeDelta: (nodeId: string, output: string) => void;
  onNodeDone: (nodeId: string, output: string) => void;
  onNodeError: (nodeId: string, error: string) => void;
  signal?: AbortSignal;
}

// Execute the graph once. LLM nodes call their provider directly and stream;
// every other implemented kind passes its single upstream's text through (the
// bespoke split/loop/format logic lands in a later commit). Output text is
// memoised per node so downstream nodes read finished upstream results.
export async function runGraph(
  nodes: FlowNode[],
  edges: Edge[],
  cb: RunCallbacks,
): Promise<void> {
  const order = topoSort(nodes, edges);
  const outputs = new Map<string, string>();

  const upstreamText = (nodeId: string): string => {
    const [src] = getUpstreamIds(nodeId, edges);
    return src ? (outputs.get(src) ?? "") : "";
  };

  for (const node of order) {
    if (cb.signal?.aborted) throw new DOMException("Run cancelled", "AbortError");

    if (node.data.kind === "input") {
      outputs.set(node.id, nodeText(node));
      continue;
    }

    if (node.data.kind === "llm") {
      const { provider, model, prompt, temperature, maxTokens } = readLLMParams(
        node.data.params,
      );
      const resolved = resolvePrompt(prompt, upstreamText(node.id));
      cb.onNodeStart(node.id, resolved);

      let stream: AsyncGenerator<string>;
      if (cb.simulate) {
        stream = simulateStream(maxTokens, cb.signal);
      } else {
        const apiKey = cb.getKey(provider);
        if (!apiKey) {
          const msg = `No ${provider} key — add it in Keys, or turn on Demo.`;
          cb.onNodeError(node.id, msg);
          throw new Error(msg);
        }
        stream = streamChat({
          provider,
          model,
          prompt: resolved,
          temperature,
          maxTokens,
          apiKey,
          signal: cb.signal,
        });
      }

      try {
        let acc = "";
        for await (const delta of stream) {
          acc += delta;
          cb.onNodeDelta(node.id, acc);
        }
        outputs.set(node.id, acc);
        cb.onNodeDone(node.id, acc);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        const msg = err instanceof Error ? err.message : String(err);
        cb.onNodeError(node.id, msg);
        throw err;
      }
      continue;
    }

    // preview / export / split / loop / format — pass the upstream text through
    // so the Preview node renders it and chains stay intact.
    const text = upstreamText(node.id);
    outputs.set(node.id, text);
    cb.onNodeDone(node.id, text);
  }
}
