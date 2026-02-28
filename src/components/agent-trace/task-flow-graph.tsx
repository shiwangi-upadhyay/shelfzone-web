'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowNode } from './flow-node';
import { FlowEdge } from './flow-edge';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskFlowGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
  isLoading?: boolean;
}

const nodeTypes = {
  custom: FlowNode,
};

const edgeTypes = {
  custom: FlowEdge,
};

export function TaskFlowGraph({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  isLoading,
}: TaskFlowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  if (isLoading) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No flow data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-right"
        defaultEdgeOptions={{
          type: 'custom',
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-background"
        />
      </ReactFlow>
    </div>
  );
}
