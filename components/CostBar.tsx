"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUsd } from "@/lib/cost";
import { ApiKeysDialog } from "@/components/ApiKeysDialog";

export function CostBar() {
  // v0.0: placeholder. feat(cost-preview) wires this to the live graph estimate.
  const estimate = 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold tracking-tight">weavetta</span>
        <span className="text-xs text-muted-foreground">
          your workflows, your keys, your laptop
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ApiKeysDialog />
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  est. cost
                </span>
                <span className="font-mono text-sm tabular-nums">
                  {formatUsd(estimate)}
                </span>
              </div>
            }
          />
          <TooltipContent>See the cost before you click run.</TooltipContent>
        </Tooltip>

        <Button size="sm" className="gap-1.5" disabled>
          <Play className="size-3.5" />
          Run
        </Button>
      </div>
    </header>
  );
}
