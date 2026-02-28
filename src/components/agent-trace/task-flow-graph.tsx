'use client';

import { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import FlowAgentNode from './flow-node';
import FlowDelegationEdge from './flow-edge';
import { useTraceFlow } from '@/hooks/use-trace-flow';
import { Skeleton } from '@/components/ui/skeleton';

const nodeTypes = { flowAgent: FlowAgentNode };
const edgeTypes = { flowDelegation: FlowDelegationEdge };

interface TaskFlowGraphProps {
  traceId: string;
  onNodeClick?: (sessionId: string, agentName: string, agentId: string) => void;
}

export function TaskFlowGraph({ traceId, onNodeClick }: TaskFlowGraphProps) {
  const { data, isLoading } = useTraceFlow(traceId);

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    if (node.data?.sessionId && onNodeClick) {
      onNodeClick(node.data.sessionId, node.data.name, node.data.agentId);
    }
  }, [onNodeClick]);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-lg border border-dashed border-border/60 text-muted-foreground">
        <p className="text-sm">No flow data available</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-lg border border-border/60 bg-card overflow-hidden">
      <ReactFlow
        nodes={data.nodes}
        edges={data.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background gap={24} size={1} color="hsl(var(--border) / 0.3)" />
        <Controls
          className="!bg-card !border-border/60 !shadow-sm [&>button]:!bg-card [&>button]:!border-border/40 [&>button]:!text-muted-foreground"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card !border-border/60"
          nodeColor="hsl(var(--muted))"
          maskColor="hsl(var(--background) / 0.8)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
