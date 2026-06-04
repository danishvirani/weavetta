"use client";

import { NODE_KINDS, NODE_REGISTRY } from "@/lib/node-registry";
import type { NodeKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export const DRAG_MIME = "application/weavetta-node";

export function Palette() {
  function onDragStart(e: React.DragEvent, kind: NodeKind) {
    e.dataTransfer.setData(DRAG_MIME, kind);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r p-2">
      <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Nodes
      </p>
      {NODE_KINDS.map((kind) => {
        const meta = NODE_REGISTRY[kind];
        const Icon = meta.icon;
        return (
          <div
            key={kind}
            draggable
            onDragStart={(e) => onDragStart(e, kind)}
            className={cn(
              "flex cursor-grab items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5",
              "hover:border-border hover:bg-accent active:cursor-grabbing",
            )}
          >
            <Icon className={cn("size-4 shrink-0", meta.accent)} />
            <div className="min-w-0">
              <p className="text-sm leading-tight font-medium">{meta.label}</p>
              <p className="truncate text-xs text-muted-foreground">{meta.blurb}</p>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
