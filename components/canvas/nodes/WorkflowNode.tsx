import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_REGISTRY } from "@/lib/node-registry";
import type { FlowNode } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WorkflowNode({ data, selected }: NodeProps<FlowNode>) {
  const meta = NODE_REGISTRY[data.kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "min-w-48 rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow",
        selected ? "ring-2 ring-ring" : "hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Icon className={cn("size-4 shrink-0", meta.accent)} />
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground">{meta.blurb}</div>

      {meta.hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-2.5 !border-2 !border-background !bg-muted-foreground"
        />
      )}
      {meta.hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!size-2.5 !border-2 !border-background !bg-muted-foreground"
        />
      )}
    </div>
  );
}
