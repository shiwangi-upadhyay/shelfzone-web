'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Node, Edge } from 'reactflow';

const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️', BackendForge: '⚙️', DataArchitect: '🗄️',
  ShieldOps: '🛡️', PortalEngine: '🖥️', UIcraft: '🎨',
  TestRunner: '🧪', DocSmith: '📝',
};

interface FlowApiNode {
  id: string;
  agentId: string;
  agentName: string;
  cost: number;
  duration: number;
  status: string;
}

interface FlowApiEdge {
  from: string;
  to: string;
  label: string;
  type: string;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

export function useTraceFlow(traceId: string | null) {
  return useQuery({
    queryKey: ['trace-flow', traceId],
    queryFn: async () => {
      const res = await api.get(`/api/traces/${traceId}/flow`);
      const apiNodes: FlowApiNode[] = res.data.nodes;
      const apiEdges: FlowApiEdge[] = res.data.edges;

      // Build agentId→node map
      const agentIdToNode = new Map<string, FlowApiNode>();
      apiNodes.forEach(n => agentIdToNode.set(n.agentId, n));

      // Find root (nodes that are not targets of any edge)
      const targets = new Set(apiEdges.map(e => e.to));
      const roots = apiNodes.filter(n => !targets.has(n.agentId));
      
      // Build adjacency
      const children = new Map<string, string[]>();
      apiEdges.forEach(e => {
        if (!children.has(e.from)) children.set(e.from, []);
        children.get(e.from)!.push(e.to);
      });

      // Layout: BFS positioning
      const nodes: Node[] = [];
      const X_GAP = 250;
      const Y_GAP = 150;

      // Owner node
      nodes.push({
        id: 'owner',
        type: 'flowAgent',
        position: { x: 400, y: 0 },
        data: { emoji: '👤', name: 'Owner', cost: 0, duration: '', status: 'completed', isOwner: true },
      });

      // Position nodes level by level
      const visited = new Set<string>();
      let queue = roots.map(r => r.agentId);
      let level = 1;

      while (queue.length > 0) {
        const nextQueue: string[] = [];
        const totalWidth = (queue.length - 1) * X_GAP;
        const startX = 400 - totalWidth / 2;

        queue.forEach((agentId, i) => {
          if (visited.has(agentId)) return;
          visited.add(agentId);
          const n = agentIdToNode.get(agentId);
          if (!n) return;

          nodes.push({
            id: n.id,
            type: 'flowAgent',
            position: { x: startX + i * X_GAP, y: level * Y_GAP },
            data: {
              emoji: AGENT_EMOJI[n.agentName] || '🤖',
              name: n.agentName,
              cost: n.cost,
              duration: formatDuration(n.duration),
              status: n.status,
              sessionId: n.id,
              agentId: n.agentId,
            },
          });

          const kids = children.get(agentId) || [];
          nextQueue.push(...kids);
        });

        queue = nextQueue;
        level++;
      }

      // Edges
      const edges: Edge[] = [];
      // Owner → roots
      roots.forEach(r => {
        edges.push({
          id: `owner-${r.id}`,
          source: 'owner',
          target: r.id,
          type: 'flowDelegation',
          data: { label: 'Orchestrate' },
          animated: r.status === 'running',
        });
      });

      // Build sessionId lookup by agentId
      const agentToSession = new Map<string, string>();
      apiNodes.forEach(n => agentToSession.set(n.agentId, n.id));

      apiEdges.forEach((e, i) => {
        const sourceSession = agentToSession.get(e.from);
        const targetSession = agentToSession.get(e.to);
        if (!sourceSession || !targetSession) return;
        const targetNode = agentIdToNode.get(e.to);
        edges.push({
          id: `e-${i}`,
          source: sourceSession,
          target: targetSession,
          type: 'flowDelegation',
          data: { label: e.label.length > 60 ? e.label.slice(0, 57) + '...' : e.label },
          animated: targetNode?.status === 'running',
        });
      });

      return { nodes, edges };
    },
    enabled: !!traceId,
  });
}
