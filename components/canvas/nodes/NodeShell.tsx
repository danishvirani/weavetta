import { Handle, Position } from "@xyflow/react";
import { NODE_REGISTRY } from "@/lib/node-registry";
import type { NodeKind } from "@/lib/types";
import { cn } from "@/lib/utils";

// Shared chrome for every node card: header (icon + label + optional right slot),
// body, and the target/source handles dictated by the registry.
export function NodeShell({
  kind,
  selected,
  headerRight,
  children,
  className,
}: {
  kind: NodeKind;
  selected?: boolean;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const meta = NODE_REGISTRY[kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "w-60 rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow",
        selected ? "ring-2 ring-ring" : "hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Icon className={cn("size-4 shrink-0", meta.accent)} />
        <span className="text-sm font-medium">{meta.label}</span>
        {headerRight ? <div className="ml-auto">{headerRight}</div> : null}
      </div>
      <div className="px-3 py-2">{children}</div>

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
