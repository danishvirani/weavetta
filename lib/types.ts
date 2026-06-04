// The seven v0.1 node kinds. v0.0 ships only the demo node; the union is here
// so the store, pricing, and cost code can be typed against the real shape.
export type NodeKind =
  | "input"
  | "llm"
  | "split"
  | "loop"
  | "format"
  | "preview"
  | "export";

export type LLMProvider = "openai" | "anthropic" | "openrouter";

// Per-node runtime debug fields (Gap 2). Populated during a run; cleared on reset.
export interface NodeDebug {
  lastInput?: string;
  lastOutput?: string;
  lastError?: string;
}

// `type` (not `interface`) so it satisfies React Flow's `Record<string, unknown>`
// data constraint — interfaces don't get an implicit index signature.
export type NodeData = {
  label: string;
  kind: NodeKind;
  debug?: NodeDebug;
  // Free-form per-kind params (prompt, model, template, ...). Typed per kind later.
  params?: Record<string, unknown>;
};
