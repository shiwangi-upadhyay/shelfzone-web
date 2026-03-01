'use client';

import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type OrgEmployee } from '@/hooks/use-agent-stats';
import { cn } from '@/lib/utils';
import { AGENT_EMOJI } from './agent-badge';

interface EmployeeNodeData {
  type: 'employee';
  employeeId: string;
  name: string;
  department?: string;
  totalCost: number;
}

interface AgentNodeData {
  type: 'agent';
  agentId: string;
  name: string;
  status: string;
  cost: number;
  model?: string;
  onAgentClick: (agentId: string, agentName: string, status: string) => void;
}

type NodeData = EmployeeNodeData | AgentNodeData;

// Custom employee node (owner)
function EmployeeOwnerNode({ data }: { data: EmployeeNodeData }) {
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm min-w-[160px]">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{data.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{data.department}</p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground font-mono tabular-nums">
        ${Number(data.totalCost).toFixed(2)} today
      </div>
    </div>
  );
}

// Custom agent node
function AgentNodeComponent({ data }: { data: AgentNodeData }) {
  const emoji = AGENT_EMOJI[data.name] || '🤖';
  const statusColor =
    data.status === 'ACTIVE'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
      : data.status === 'PAUSED'
      ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
      : 'bg-muted border-border/60 text-muted-foreground';

  return (
    <button
      onClick={() => data.onAgentClick(data.agentId, data.name, data.status)}
      className={cn(
        'border rounded-lg p-2.5 shadow-sm min-w-[140px] transition-all hover:shadow-md',
        statusColor
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{emoji}</span>
        <span className="text-xs font-semibold truncate">{data.name}</span>
      </div>
      {data.model && (
        <div className="text-[9px] opacity-75 font-mono truncate mb-1">{data.model}</div>
      )}
      <div className="text-[10px] font-mono tabular-nums opacity-90">${Number(data.cost).toFixed(2)}</div>
    </button>
  );
}

const nodeTypes = {
  employee: EmployeeOwnerNode,
  agent: AgentNodeComponent,
};

interface AgentTreeViewProps {
  employees: OrgEmployee[];
  onAgentClick: (agentId: string, agentName: string, status: string) => void;
}

export function AgentTreeView({ employees, onAgentClick }: AgentTreeViewProps) {
  // Build agent-focused tree
  const { nodes, edges } = useMemo(() => {
    const nodesArr: Node[] = [];
    const edgesArr: Edge[] = [];

    let yOffset = 0;
    const employeeSpacing = 200; // vertical spacing between employee groups
    const agentSpacing = 100; // vertical spacing between agents

    // Filter employees who have agents
    const employeesWithAgents = employees.filter((emp) => emp.agents.length > 0);

    employeesWithAgents.forEach((emp, empIdx) => {
      const empNodeId = `emp-${emp.employeeId}`;

      // Employee node
      nodesArr.push({
        id: empNodeId,
        type: 'employee',
        position: { x: 0, y: yOffset },
        data: {
          type: 'employee',
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department?.name,
          totalCost: emp.totalCost,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      yOffset += agentSpacing;

      // Agent nodes
      emp.agents.forEach((agent, agentIdx) => {
        const agentNodeId = `agent-${agent.id}`;

        nodesArr.push({
          id: agentNodeId,
          type: 'agent',
          position: { x: agentIdx * 180, y: yOffset },
          data: {
            type: 'agent',
            agentId: agent.id,
            name: agent.name,
            status: agent.status,
            cost: agent.totalCost,
            onAgentClick,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Edge from employee to agent
        edgesArr.push({
          id: `${empNodeId}-${agentNodeId}`,
          source: empNodeId,
          target: agentNodeId,
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--border) / 0.4)', strokeWidth: 1.5, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--border) / 0.4)',
            width: 12,
            height: 12,
          },
        });
      });

      yOffset += employeeSpacing;
    });

    return { nodes: nodesArr, edges: edgesArr };
  }, [employees, onAgentClick]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-lg border border-dashed border-border/60 text-muted-foreground">
        <p className="text-sm">No agents found</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg border border-border/60 bg-card overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={1.2}
      >
        <Background gap={24} size={1} color="hsl(var(--border) / 0.2)" />
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
