import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FlowNode {
  id: string;
  type: string;
  data: {
    label: string;
    emoji?: string;
    agentName?: string;
    cost?: number;
    duration?: number;
    status?: string;
    sessionId?: string;
  };
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  type?: string;
}

export interface TraceFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️',
  BackendForge: '⚙️',
  DataArchitect: '🗄️',
  ShieldOps: '🛡️',
  PortalEngine: '🖥️',
  UIcraft: '🎨',
  TestRunner: '🧪',
  DocSmith: '📝',
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m${secs > 0 ? `${secs}s` : ''}`;
}

export function useTraceFlow(traceId: string) {
  return useQuery({
    queryKey: ['trace-flow', traceId],
    queryFn: async () => {
      const response = await api.get(`/api/traces/${traceId}/flow`);
      const raw = response.data || response;

      // Transform API nodes to ReactFlow nodes
      const nodeCount = raw.nodes?.length || 0;
      const centerX = 400;

      // Owner node at top
      const ownerNode: FlowNode = {
        id: 'owner',
        type: 'custom',
        data: {
          label: '👤 Owner',
          emoji: '👤',
          agentName: 'Owner',
          status: 'completed',
        },
        position: { x: centerX, y: 0 },
      };

      // Find the master agent (SHIWANGI — the one with no parent/delegatedBy in flow)
      const masterNode = raw.nodes?.find((n: any) => n.agentName === 'SHIWANGI') || raw.nodes?.[0];
      const subNodes = raw.nodes?.filter((n: any) => n.id !== masterNode?.id) || [];

      const nodes: FlowNode[] = [ownerNode];

      if (masterNode) {
        nodes.push({
          id: masterNode.id,
          type: 'custom',
          data: {
            label: masterNode.agentName,
            emoji: AGENT_EMOJI[masterNode.agentName] || '🤖',
            agentName: masterNode.agentName,
            cost: Number(masterNode.cost),
            duration: masterNode.duration,
            status: masterNode.status,
            sessionId: masterNode.id,
          },
          position: { x: centerX, y: 150 },
        });
      }

      // Spread sub-agents horizontally below master
      const spacing = 180;
      const totalWidth = (subNodes.length - 1) * spacing;
      const startX = centerX - totalWidth / 2;

      subNodes.forEach((node: any, index: number) => {
        nodes.push({
          id: node.id,
          type: 'custom',
          data: {
            label: node.agentName,
            emoji: AGENT_EMOJI[node.agentName] || '🤖',
            agentName: node.agentName,
            cost: Number(node.cost),
            duration: node.duration,
            status: node.status,
            sessionId: node.id,
          },
          position: { x: startX + index * spacing, y: 350 },
        });
      });

      // Edges: owner → master, master → each sub-agent
      const edges: FlowEdge[] = [];

      if (masterNode) {
        edges.push({
          id: `owner-${masterNode.id}`,
          source: 'owner',
          target: masterNode.id,
          label: 'Instruction',
          type: 'custom',
        });
      }

      // Use API edges for master → sub-agent delegation labels
      const edgeMap = new Map<string, string>();
      raw.edges?.forEach((e: any) => {
        const key = `${e.from}-${e.to}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, e.label);
        }
      });

      subNodes.forEach((node: any) => {
        const edgeLabel = masterNode
          ? edgeMap.get(`${masterNode.agentId}-${node.agentId}`) || 'Delegation'
          : 'Delegation';

        edges.push({
          id: `${masterNode?.id || 'master'}-${node.id}`,
          source: masterNode?.id || 'master',
          target: node.id,
          label: edgeLabel.length > 50 ? edgeLabel.slice(0, 47) + '...' : edgeLabel,
          animated: node.status === 'running',
          type: 'custom',
        });
      });

      return { nodes, edges } as TraceFlowData;
    },
    enabled: !!traceId,
  });
}
