'use client';

import { useCallback } from 'react';
import ReactFlow, { Background, Controls, type Node } from 'reactflow';
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
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        <p>No flow data available</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-xl border border-border bg-card overflow-hidden">
      <ReactFlow
        nodes={data.nodes}
        edges={data.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
