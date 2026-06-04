"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "@/lib/store";
import type { NodeKind } from "@/lib/types";
import { WorkflowNode } from "./nodes/WorkflowNode";
import { InputNode } from "./nodes/InputNode";
import { ExportNode } from "./nodes/ExportNode";
import { LLMNode } from "./nodes/LLMNode";
import { PreviewNode } from "./nodes/PreviewNode";
import { Palette, DRAG_MIME } from "./Palette";

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useWorkflow();
  const { screenToFlowPosition } = useReactFlow();
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      input: InputNode,
      export: ExportNode,
      llm: LLMNode,
      preview: PreviewNode,
      split: WorkflowNode,
      loop: WorkflowNode,
      format: WorkflowNode,
    }),
    [],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(DRAG_MIME) as NodeKind;
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(kind, position);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
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
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full min-h-0">
        <Palette />
        <Flow />
      </div>
    </ReactFlowProvider>
  );
}
