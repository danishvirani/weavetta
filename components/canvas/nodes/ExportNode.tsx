"use client";

import { useState } from "react";
import { type NodeProps } from "@xyflow/react";
import { Copy, Download, Check } from "lucide-react";
import { useWorkflow, type FlowNode } from "@/lib/store";
import { resolveUpstreamText } from "@/lib/graph";
import { cn } from "@/lib/utils";
import { NodeShell } from "./NodeShell";

type Fmt = "md" | "txt" | "json";
const FORMATS: Fmt[] = ["md", "txt", "json"];

export function ExportNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeParams = useWorkflow((s) => s.updateNodeParams);
  const nodes = useWorkflow((s) => s.nodes);
  const edges = useWorkflow((s) => s.edges);
  const [copied, setCopied] = useState(false);

  const format = (data.params?.format as Fmt) ?? "md";
  const text = resolveUpstreamText(id, nodes, edges);
  const payload =
    format === "json" ? JSON.stringify({ output: text }, null, 2) : text;

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function download() {
    if (!text) return;
    const mime = format === "json" ? "application/json" : "text/plain";
    const blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weavetta-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <NodeShell kind="export" selected={selected}>
      <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
        {FORMATS.map((f) => (
          <button
            key={f}
            onClick={() => updateNodeParams(id, { format: f })}
            className={cn(
              "nodrag flex-1 rounded px-2 py-1 text-[11px] font-medium uppercase",
              format === f
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        <button
          onClick={copy}
          disabled={!text}
          className="nodrag inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={download}
          disabled={!text}
          className="nodrag inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
        >
          <Download className="size-3" />
          Download
        </button>
      </div>

      {!text && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Connect a node to export its output.
        </p>
      )}
    </NodeShell>
  );
}
