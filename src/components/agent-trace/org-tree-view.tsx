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

interface EmployeeNodeData {
  employeeId: string;
  name: string;
  designation?: string;
  department?: string;
  agents: Array<{ id: string; name: string; status: string; totalCost: number }>;
  totalCost: number;
  activeAgents: number;
  onAgentClick: (agentId: string, agentName: string, status: string) => void;
}

// Custom employee node component
function EmployeeNode({ data }: { data: EmployeeNodeData }) {
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm min-w-[180px] hover:shadow-md transition-shadow">
      {/* Avatar + Name */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{data.name}</p>
          {data.designation && (
            <p className="text-[10px] text-muted-foreground truncate">{data.designation}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {(data.totalCost > 0 || data.agents.length > 0) && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
          <span className="font-mono tabular-nums">${Number(data.totalCost).toFixed(2)}</span>
          {data.activeAgents > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {data.activeAgents} active
            </span>
          )}
        </div>
      )}

      {/* Agent badges */}
      {data.agents.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => data.onAgentClick(agent.id, agent.name, agent.status)}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                'border transition-colors',
                agent.status === 'ACTIVE'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
                  : 'bg-muted border-border/60 text-muted-foreground hover:bg-muted/70'
              )}
            >
              🤖 {agent.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  employee: EmployeeNode,
};

interface OrgTreeViewProps {
  employees: OrgEmployee[];
  onAgentClick: (agentId: string, agentName: string, status: string) => void;
}

export function OrgTreeView({ employees, onAgentClick }: OrgTreeViewProps) {
  // Build tree hierarchy
  const { nodes, edges } = useMemo(() => {
    const nodesMap = new Map<string, Node>();
    const edgesArr: Edge[] = [];

    // Helper to calculate node position
    let yOffset = 0;
    const levelWidth = 220; // horizontal spacing
    const levelHeight = 140; // vertical spacing

    function buildNode(emp: OrgEmployee, level: number, parentId: string | null, index: number): void {
      const nodeId = emp.employeeId;

      nodesMap.set(nodeId, {
        id: nodeId,
        type: 'employee',
        position: { x: level * levelWidth, y: yOffset },
        data: {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department?.name,
          agents: emp.agents,
          totalCost: emp.totalCost,
          activeAgents: emp.activeAgents,
          onAgentClick,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Create edge from parent
      if (parentId) {
        edgesArr.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--border) / 0.4)', strokeWidth: 1.5, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--border) / 0.4)', width: 15, height: 15 },
        });
      }

      yOffset += levelHeight;

      // Recursively build children
      const children = employees.filter((e) => e.managerId === emp.employeeId);
      children.forEach((child, idx) => {
        buildNode(child, level + 1, nodeId, idx);
      });
    }

    // Find root nodes (no manager)
    const roots = employees.filter((e) => !e.managerId);
    roots.forEach((root, idx) => {
      buildNode(root, 0, null, idx);
    });

    return { nodes: Array.from(nodesMap.values()), edges: edgesArr };
  }, [employees, onAgentClick]);

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    // Click handled by agent badges
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-lg border border-dashed border-border/60 text-muted-foreground">
        <p className="text-sm">No employees found</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg border border-border/60 bg-card overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
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
