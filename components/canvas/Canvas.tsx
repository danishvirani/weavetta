"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "@/lib/store";
import { DemoNode } from "./nodes/DemoNode";

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflow();
  const nodeTypes = useMemo<NodeTypes>(() => ({ demo: DemoNode }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      proOptions={{ hideAttribution: true }}
      className="bg-background"
    >
      <Background gap={16} className="!bg-muted/30" />
      <Controls className="!shadow-sm" />
      <MiniMap pannable zoomable className="!rounded-lg !border" />
    </ReactFlow>
  );
}
