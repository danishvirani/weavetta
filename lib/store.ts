import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { NodeData } from "./types";

export type FlowNode = Node<NodeData>;

interface WorkflowState {
  nodes: FlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

// v0.0 seed: a single demo node so the canvas isn't empty on first load.
const initialNodes: FlowNode[] = [
  {
    id: "demo-1",
    type: "demo",
    position: { x: 0, y: 0 },
    data: { label: "Drag me", kind: "input" },
  },
];

export const useWorkflow = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },
}));
