import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FlowNode {
  id: string;
  type: 'owner' | 'agent';
  data: {
    label: string;
    emoji?: string;
    agentName?: string;
    cost?: number;
    duration?: number;
    status?: 'active' | 'completed' | 'failed';
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
  style?: Record<string, any>;
}

export interface TraceFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function useTraceFlow(traceId: string) {
  return useQuery({
    queryKey: ['trace-flow', traceId],
    queryFn: async () => {
      const response = await api.get(`/api/traces/${traceId}/flow`);
      return response.data as TraceFlowData;
    },
    enabled: !!traceId,
  });
}
