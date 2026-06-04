import { type NodeProps } from "@xyflow/react";
import { NODE_REGISTRY } from "@/lib/node-registry";
import type { FlowNode } from "@/lib/store";
import { NodeShell } from "./NodeShell";

// Generic placeholder card for kinds that don't yet have a bespoke component
// (llm, split, loop, format, preview). Each gets its own in later commits.
export function WorkflowNode({ data, selected }: NodeProps<FlowNode>) {
  const meta = NODE_REGISTRY[data.kind];
  return (
    <NodeShell kind={data.kind} selected={selected}>
      <p className="text-xs text-muted-foreground">{meta.blurb}</p>
    </NodeShell>
  );
}
