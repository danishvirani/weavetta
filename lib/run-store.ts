import { create } from "zustand";
import { useWorkflow } from "./store";
import { useApiKeys } from "./api-keys";
import { runGraph } from "./run/runner";
import type { LLMProvider } from "./types";

// Drives a single graph run. Bridges the workflow store (graph + per-node debug)
// and the BYOK key store into the runner, and tracks coarse run status for the
// Run button. Per-node detail lives on each node's debug, updated live.
type RunStatus = "idle" | "running" | "done" | "error";

interface RunnerState {
  status: RunStatus;
  error?: string;
  // Demo mode simulates LLM calls locally — no key, no network, no CORS. On by
  // default so the app runs end-to-end out of the box; flip off for real BYOK.
  demoMode: boolean;
  setDemoMode: (on: boolean) => void;
  run: () => Promise<void>;
  stop: () => void;
  _ac?: AbortController;
}

export const useRunner = create<RunnerState>((set, get) => ({
  status: "idle",
  error: undefined,
  demoMode: true,
  setDemoMode: (on) => set({ demoMode: on }),
  run: async () => {
    if (get().status === "running") return;

    const ac = new AbortController();
    set({ status: "running", error: undefined, _ac: ac });

    // Clear stale outputs/errors so a re-run reads clean.
    useWorkflow.getState().clearAllDebug();
    const { nodes, edges, updateNodeDebug } = useWorkflow.getState();
    const keys = useApiKeys.getState().keys;

    try {
      await runGraph(nodes, edges, {
        getKey: (p: LLMProvider) => keys[p],
        simulate: get().demoMode,
        onNodeStart: (id, input) =>
          updateNodeDebug(id, {
            lastInput: input,
            lastOutput: "",
            lastError: undefined,
          }),
        onNodeDelta: (id, output) => updateNodeDebug(id, { lastOutput: output }),
        onNodeDone: (id, output) => updateNodeDebug(id, { lastOutput: output }),
        onNodeError: (id, err) => updateNodeDebug(id, { lastError: err }),
        signal: ac.signal,
      });
      set({ status: "done", _ac: undefined });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        set({ status: "idle", _ac: undefined });
        return;
      }
      set({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        _ac: undefined,
      });
    }
  },
  stop: () => {
    get()._ac?.abort();
    set({ status: "idle", _ac: undefined });
  },
}));
