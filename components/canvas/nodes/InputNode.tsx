"use client";

import { type NodeProps } from "@xyflow/react";
import { useWorkflow, type FlowNode } from "@/lib/store";
import { NodeShell } from "./NodeShell";

export function InputNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeParams = useWorkflow((s) => s.updateNodeParams);
  const text = typeof data.params?.text === "string" ? data.params.text : "";

  return (
    <NodeShell kind="input" selected={selected}>
      <textarea
        value={text}
        onChange={(e) => updateNodeParams(id, { text: e.target.value })}
        placeholder="Paste your text here…"
        className="nodrag nowheel h-24 w-full resize-none rounded-md border bg-transparent px-2 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <p className="mt-1 text-right text-[10px] tabular-nums text-muted-foreground">
        {text.length} chars
      </p>
    </NodeShell>
  );
}
