'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgentSession {
  id: string;
  taskTraceId: string;
  agentId: string;
  parentSessionId: string | null;
  instruction: string | null;
  status: string;
  cost: string;
  tokensIn: number;
  tokensOut: number;
  startedAt: string;
  completedAt: string | null;
  modelUsed: string | null;
  sessionType: string | null;
  durationMs: number | null;
  agent: {
    id: string;
    name: string;
  };
  _count: {
    events: number;
  };
}

export function useAgentSessions(agentId: string | null, opts?: { limit?: number }) {
  return useQuery({
    queryKey: ['agent-sessions', agentId, opts?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (opts?.limit) params.set('limit', String(opts.limit));
      const qs = params.toString();
      const res = await api.get(`/api/agents/${agentId}/sessions${qs ? `?${qs}` : ''}`);
      return res.data as AgentSession[];
    },
    enabled: !!agentId,
  });
}
