import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "@/lib/store";

export function DemoNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="min-w-44 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b px-3 py-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {data.kind}
        </p>
        <p className="text-sm font-medium">{data.label}</p>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground">
        A node lives here. v0.1 ships seven of them.
      </div>
      <Handle type="target" position={Position.Left} className="!size-2.5 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!size-2.5 !bg-muted-foreground" />
    </div>
  );
}
