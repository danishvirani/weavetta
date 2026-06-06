import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type XYPosition,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { NodeData, NodeDebug, NodeKind } from "./types";
import { NODE_REGISTRY } from "./node-registry";

export type FlowNode = Node<NodeData>;

interface WorkflowState {
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (kind: NodeKind, position: XYPosition) => void;
  updateNodeData: (id: string, patch: Partial<NodeData>) => void;
  updateNodeParams: (id: string, patch: Record<string, unknown>) => void;
  updateNodeDebug: (id: string, patch: Partial<NodeDebug>) => void;
  clearAllDebug: () => void;
}

function newId(kind: NodeKind): string {
  return `${kind}-${crypto.randomUUID().slice(0, 8)}`;
}

// Seed graph: a worked example that runs the moment the app opens. The Input is
// pre-filled and the LLM has a real instruction, so clicking Run immediately
// produces something useful — the canvas teaches itself instead of starting blank.
const SEED_INPUT =
  "A lightweight running shoe. Breathable knit upper, no break-in, $129, ships Friday.";
const SEED_PROMPT =
  "Write 3 short, punchy marketing taglines for this product:\n\n{{input}}";

const initialNodes: FlowNode[] = [
  {
    id: "input-seed",
    type: "input",
    position: { x: 0, y: 80 },
    data: { label: "Input", kind: "input", params: { text: SEED_INPUT } },
  },
  {
    id: "llm-seed",
    type: "llm",
    position: { x: 320, y: 80 },
    data: { label: "LLM Call", kind: "llm", params: { prompt: SEED_PROMPT } },
  },
  {
    id: "preview-seed",
    type: "preview",
    position: { x: 700, y: 80 },
    data: { label: "Preview", kind: "preview" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "input-seed", target: "llm-seed" },
  { id: "e2", source: "llm-seed", target: "preview-seed" },
];

export const useWorkflow = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },
  addNode: (kind, position) => {
    const node: FlowNode = {
      id: newId(kind),
      type: kind,
      position,
      data: { label: NODE_REGISTRY[kind].label, kind },
    };
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    });
  },
  updateNodeParams: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, params: { ...n.data.params, ...patch } } }
          : n,
      ),
    });
  },
  updateNodeDebug: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, debug: { ...n.data.debug, ...patch } } }
          : n,
      ),
    });
  },
  clearAllDebug: () => {
    set({
      nodes: get().nodes.map((n) =>
        n.data.debug ? { ...n, data: { ...n.data, debug: undefined } } : n,
      ),
    });
  },
}));
