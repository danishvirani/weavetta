import type { Edge } from "@xyflow/react";
import type { FlowNode } from "./store";

export function getUpstreamIds(nodeId: string, edges: Edge[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source);
}

// Best-available text for a node before the run engine exists: a finished run
// output if present, otherwise the node's own typed text (Input). Extended as
// more node kinds gain real outputs.
export function nodeText(node: FlowNode | undefined): string {
  if (!node) return "";
  const out = node.data.debug?.lastOutput;
  if (out) return out;
  const t = node.data.params?.text;
  return typeof t === "string" ? t : "";
}

export function resolveUpstreamText(
  nodeId: string,
  nodes: FlowNode[],
  edges: Edge[],
): string {
  const [sourceId] = getUpstreamIds(nodeId, edges);
  if (!sourceId) return "";
  return nodeText(nodes.find((n) => n.id === sourceId));
}
