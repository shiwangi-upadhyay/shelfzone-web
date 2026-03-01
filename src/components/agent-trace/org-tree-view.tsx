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

    // Layout constants
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 140;
    const HORIZONTAL_SPACING = 50;
    const VERTICAL_SPACING = 150;

    interface TreeNode {
      employee: OrgEmployee;
      children: TreeNode[];
      x: number;
      y: number;
      subtreeWidth: number;
    }

    // Build tree structure
    function buildTreeStructure(emp: OrgEmployee, depth: number): TreeNode {
      const children = employees.filter((e) => e.managerId === emp.employeeId);
      const childNodes = children.map((child) => buildTreeStructure(child, depth + 1));

      return {
        employee: emp,
        children: childNodes,
        x: 0,
        y: depth * VERTICAL_SPACING,
        subtreeWidth: 0,
      };
    }

    // Calculate positions using post-order traversal
    function calculatePositions(node: TreeNode): number {
      if (node.children.length === 0) {
        // Leaf node
        node.subtreeWidth = NODE_WIDTH;
        return NODE_WIDTH;
      }

      // Position children first (post-order)
      let childrenTotalWidth = 0;
      let currentX = 0;

      for (const child of node.children) {
        const childWidth = calculatePositions(child);
        child.x = currentX + childWidth / 2;
        currentX += childWidth + HORIZONTAL_SPACING;
        childrenTotalWidth += childWidth;
      }

      // Add spacing between children
      childrenTotalWidth += HORIZONTAL_SPACING * (node.children.length - 1);

      // Center parent above children
      const firstChildX = node.children[0].x;
      const lastChildX = node.children[node.children.length - 1].x;
      node.x = (firstChildX + lastChildX) / 2;

      // Subtree width is the max of parent width and children width
      node.subtreeWidth = Math.max(NODE_WIDTH, childrenTotalWidth);

      return node.subtreeWidth;
    }

    // Shift entire tree to ensure no negative x values
    function shiftTree(node: TreeNode, offsetX: number): void {
      node.x += offsetX;
      for (const child of node.children) {
        shiftTree(child, offsetX);
      }
    }

    // Find minimum x value in tree
    function findMinX(node: TreeNode): number {
      let minX = node.x;
      for (const child of node.children) {
        minX = Math.min(minX, findMinX(child));
      }
      return minX;
    }

    // Convert tree to ReactFlow nodes and edges
    function treeToReactFlow(node: TreeNode, parentId: string | null): void {
      const nodeId = node.employee.employeeId;

      nodesMap.set(nodeId, {
        id: nodeId,
        type: 'employee',
        position: { x: node.x - NODE_WIDTH / 2, y: node.y },
        data: {
          employeeId: node.employee.employeeId,
          name: node.employee.name,
          designation: node.employee.designation?.name,
          department: node.employee.department?.name,
          agents: node.employee.agents,
          totalCost: node.employee.totalCost,
          activeAgents: node.employee.activeAgents,
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

      // Process children
      for (const child of node.children) {
        treeToReactFlow(child, nodeId);
      }
    }

    // Find root nodes (no manager)
    const roots = employees.filter((e) => !e.managerId);
    
    if (roots.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Process each root (typically just one CEO)
    let horizontalOffset = 100; // Starting padding

    for (const root of roots) {
      // Build tree structure
      const tree = buildTreeStructure(root, 0);

      // Calculate positions (post-order traversal)
      calculatePositions(tree);

      // Find minimum x and shift to ensure positive coordinates
      const minX = findMinX(tree);
      shiftTree(tree, -minX + horizontalOffset);

      // Convert to ReactFlow format
      treeToReactFlow(tree, null);

      // Update offset for next root (if multiple)
      horizontalOffset += tree.subtreeWidth + 200;
    }

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
