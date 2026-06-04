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
import type { NodeData, NodeKind } from "./types";
import { NODE_REGISTRY } from "./node-registry";

export type FlowNode = Node<NodeData>;

interface WorkflowState {
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (kind: NodeKind, position: XYPosition) => void;
}

function newId(kind: NodeKind): string {
  return `${kind}-${crypto.randomUUID().slice(0, 8)}`;
}

// v0.0 seed: a tiny Input -> LLM -> Preview graph so the canvas reads as a
// workflow on first load, not a blank grid.
const initialNodes: FlowNode[] = [
  { id: "input-seed", type: "workflow", position: { x: 0, y: 80 }, data: { label: "Input", kind: "input" } },
  { id: "llm-seed", type: "workflow", position: { x: 280, y: 80 }, data: { label: "LLM Call", kind: "llm" } },
  { id: "preview-seed", type: "workflow", position: { x: 560, y: 80 }, data: { label: "Preview", kind: "preview" } },
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
      type: "workflow",
      position,
      data: { label: NODE_REGISTRY[kind].label, kind },
    };
    set({ nodes: [...get().nodes, node] });
  },
}));
