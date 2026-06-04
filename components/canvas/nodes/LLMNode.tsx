"use client";

import { type NodeProps } from "@xyflow/react";
import { useWorkflow, type FlowNode } from "@/lib/store";
import type { LLMProvider } from "@/lib/types";
import { modelsForProvider } from "@/lib/pricing";
import { PROVIDERS, readLLMParams, defaultModelFor } from "@/lib/llm";
import { NodeShell } from "./NodeShell";

const fieldClass =
  "nodrag w-full rounded-md border bg-transparent px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function LLMNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeParams = useWorkflow((s) => s.updateNodeParams);
  const { provider, model, prompt, temperature } = readLLMParams(data.params);
  const models = modelsForProvider(provider);

  function onProvider(p: LLMProvider) {
    updateNodeParams(id, { provider: p, model: defaultModelFor(p) });
  }

  return (
    <NodeShell kind="llm" selected={selected} className="w-72">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <select
            value={provider}
            onChange={(e) => onProvider(e.target.value as LLMProvider)}
            className={fieldClass}
            aria-label="Provider"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {provider === "openrouter" ? (
            <input
              value={model}
              onChange={(e) => updateNodeParams(id, { model: e.target.value })}
              placeholder="vendor/model-slug"
              className={fieldClass}
              aria-label="Model slug"
            />
          ) : (
            <select
              value={model}
              onChange={(e) => updateNodeParams(id, { model: e.target.value })}
              className={fieldClass}
              aria-label="Model"
            >
              {models.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => updateNodeParams(id, { prompt: e.target.value })}
          placeholder="Prompt… use {{input}} for upstream text"
          className="nodrag nowheel h-20 w-full resize-none rounded-md border bg-transparent px-2 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />

        <label className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>temperature</span>
          <span className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) =>
                updateNodeParams(id, { temperature: Number(e.target.value) })
              }
              className="nodrag w-24"
              aria-label="Temperature"
            />
            <span className="w-6 tabular-nums text-foreground">
              {temperature.toFixed(1)}
            </span>
          </span>
        </label>
      </div>
    </NodeShell>
  );
}
