'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Node, Edge, NodeChange } from 'reactflow';
import { Position, MarkerType, applyNodeChanges as applyNodeChangesBase } from 'reactflow';
import { type OrgEmployee } from '@/hooks/use-agent-stats';

// Dynamic import to avoid SSR issues
const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] rounded-lg border border-border/60 bg-card flex items-center justify-center">
        <div className="text-muted-foreground">Loading Organization View...</div>
      </div>
    ),
  }
);

const Background = dynamic(() => import('reactflow').then((mod) => mod.Background), { ssr: false });
const Controls = dynamic(() => import('reactflow').then((mod) => mod.Controls), { ssr: false });
const MiniMap = dynamic(() => import('reactflow').then((mod) => mod.MiniMap), { ssr: false });

interface EmployeeNodeData {
  employeeId: string;
  name: string;
  department?: string;
}

// Custom employee node component - Pure org chart (NO agents)
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
        </div>
      </div>

      {/* Department */}
      {data.department && (
        <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
          {data.department}
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
  departmentFilter: string; // 'all' or specific department name
}

export function OrgTreeView({ employees, departmentFilter }: OrgTreeViewProps) {
  // State for draggable nodes
  const initialNodesAndEdges = useMemo(() => {
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

    // Check if node or any descendant matches the department filter
    function shouldShowBranch(node: TreeNode, filter: string): boolean {
      if (filter === 'all') return true;
      
      // Check if this node matches
      if (node.employee.department?.name === filter) return true;
      
      // Check if any child matches (recursive)
      return node.children.some(child => shouldShowBranch(child, filter));
    }

    // Convert tree to ReactFlow nodes and edges
    function treeToReactFlow(node: TreeNode, parentId: string | null): void {
      const nodeId = node.employee.employeeId;
      
      // Check if this branch should be shown based on department filter
      if (!shouldShowBranch(node, departmentFilter)) {
        return; // Skip this entire branch
      }

      nodesMap.set(nodeId, {
        id: nodeId,
        type: 'employee',
        position: { x: node.x - NODE_WIDTH / 2, y: node.y },
        data: {
          employeeId: node.employee.employeeId,
          name: node.employee.name,
          department: node.employee.department?.name,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Create edge from parent (only if parent is also visible)
      // ENHANCED: Super visible purple lines!
      if (parentId && nodesMap.has(parentId)) {
        edgesArr.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { 
            stroke: '#8b5cf6',      // Bright purple
            strokeWidth: 4,          // THICKER line
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: '#8b5cf6',       // Matching purple arrow
            width: 24,              // Larger arrow
            height: 24 
          },
          animated: false,
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
  }, [employees, departmentFilter]);

  // State for draggable nodes and edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Update nodes and edges when initialNodesAndEdges changes
  useEffect(() => {
    setNodes(initialNodesAndEdges.nodes);
    setEdges(initialNodesAndEdges.edges);
  }, [initialNodesAndEdges.nodes, initialNodesAndEdges.edges]);

  // Handle node changes (for dragging)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChangesBase(changes, nds));
    },
    []
  );

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
        onNodesChange={onNodesChange}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
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
