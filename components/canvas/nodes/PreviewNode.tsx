"use client";

import { type NodeProps } from "@xyflow/react";
import { useWorkflow, type FlowNode } from "@/lib/store";
import { resolveUpstreamText } from "@/lib/graph";
import { useRunner } from "@/lib/run-store";
import { NodeShell } from "./NodeShell";

// Shows its upstream node's current text. Because the runner writes streamed
// tokens into the upstream LLM node's debug.lastOutput, and resolveUpstreamText
// reads exactly that, this re-renders live as the model streams — LLM -> Preview.
export function PreviewNode({ id, selected }: NodeProps<FlowNode>) {
  const nodes = useWorkflow((s) => s.nodes);
  const edges = useWorkflow((s) => s.edges);
  const status = useRunner((s) => s.status);
  const demoMode = useRunner((s) => s.demoMode);
  const text = resolveUpstreamText(id, nodes, edges);
  const streaming = status === "running";

  return (
    <NodeShell kind="preview" selected={selected} className="w-72">
      {text ? (
        <>
          <pre className="nowheel max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed">
            {text}
            {streaming && (
              <span className="ml-0.5 inline-block animate-pulse">▋</span>
            )}
          </pre>
          {demoMode && (
            <p className="mt-2 border-t pt-1.5 text-[10px] text-muted-foreground">
              Demo output · turn off Demo and add a key for live results
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          {streaming ? "Waiting for output…" : "Click Run to see the draft here."}
        </p>
      )}
    </NodeShell>
  );
}
