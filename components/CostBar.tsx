"use client";

import { useMemo } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUsd } from "@/lib/cost";
import { estimateGraphCost } from "@/lib/estimate";
import { useWorkflow } from "@/lib/store";
import { useRunner } from "@/lib/run-store";
import { ApiKeysDialog } from "@/components/ApiKeysDialog";
import { cn } from "@/lib/utils";

const fmtTokens = new Intl.NumberFormat("en-US");

export function CostBar() {
  const nodes = useWorkflow((s) => s.nodes);
  const edges = useWorkflow((s) => s.edges);
  const status = useRunner((s) => s.status);
  const runError = useRunner((s) => s.error);
  const run = useRunner((s) => s.run);
  const stop = useRunner((s) => s.stop);
  const demoMode = useRunner((s) => s.demoMode);
  const setDemoMode = useRunner((s) => s.setDemoMode);

  // The wedge: recompute the estimate live as the graph or any prompt changes.
  const cost = useMemo(() => estimateGraphCost(nodes, edges), [nodes, edges]);
  const canRun = cost.llmNodes > 0;
  const running = status === "running";

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
              <div className="flex cursor-default flex-col items-end leading-tight">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  est. cost / run
                </span>
                <span className="font-mono text-sm tabular-nums">
                  {formatUsd(cost.usd)}
                </span>
              </div>
            }
          />
          <TooltipContent className="max-w-xs">
            <CostBreakdown cost={cost} />
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setDemoMode(!demoMode)}
                aria-pressed={demoMode}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                  demoMode
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    demoMode ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
                Demo
              </button>
            }
          />
          <TooltipContent className="max-w-xs">
            {demoMode
              ? "Demo mode: runs are simulated locally — no key, no network. The cost shown is still the real estimate."
              : "Live mode: runs call the provider directly with your own key."}
          </TooltipContent>
        </Tooltip>

        {status === "error" && runError && (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="max-w-[14rem] truncate text-xs text-destructive">
                  {runError}
                </span>
              }
            />
            <TooltipContent className="max-w-xs">{runError}</TooltipContent>
          </Tooltip>
        )}

        {running ? (
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            onClick={stop}
          >
            <Square className="size-3.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => void run()}
            disabled={!canRun}
          >
            <Play className="size-3.5" />
            Run
          </Button>
        )}
      </div>
    </header>
  );
}

function CostBreakdown({
  cost,
}: {
  cost: ReturnType<typeof estimateGraphCost>;
}) {
  if (cost.llmNodes === 0) {
    return (
      <p className="text-xs">
        No LLM calls in this workflow yet — nothing to bill.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <p className="font-medium">See the cost before you click run.</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 tabular-nums">
        <dt className="text-muted-foreground">LLM calls</dt>
        <dd className="text-right">{cost.llmNodes}</dd>
        <dt className="text-muted-foreground">Input tokens</dt>
        <dd className="text-right">~{fmtTokens.format(cost.inputTokens)}</dd>
        <dt className="text-muted-foreground">Output (capped)</dt>
        <dd className="text-right">~{fmtTokens.format(cost.outputTokens)}</dd>
        <dt className="font-medium">Estimate</dt>
        <dd className="text-right font-medium">{formatUsd(cost.usd)}</dd>
      </dl>
      {cost.unpricedNodes > 0 && (
        <p className="text-muted-foreground">
          {cost.unpricedNodes} call
          {cost.unpricedNodes > 1 ? "s use a model" : " uses a model"} not in the
          price list — not counted.
        </p>
      )}
      <p className="text-muted-foreground">
        Output is priced at each node&apos;s max-tokens ceiling; the real bill is
        usually lower.
      </p>
    </div>
  );
}
