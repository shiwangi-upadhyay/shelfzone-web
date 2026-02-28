'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgentStats {
  totalSessions: number;
  avgCost: number;
  errorRate: number;
  totalTokens: number;
  costByDay: { date: string; cost: number }[];
  subAgentBreakdown: unknown[];
}

export interface OrgEmployee {
  employeeId: string;
  name: string;
  managerId: string | null;
  department: { id: string; name: string };
  agents: { id: string; name: string; status: string; totalCost: number; sessionCount: number }[];
  totalCost: number;
  activeAgents: number;
  teamCost: number;
  teamActiveAgents: number;
}

export function useAgentStats(agentId: string | null) {
  return useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async () => {
      const res = await api.get(`/api/agents/${agentId}/stats`);
      return res.data as AgentStats;
    },
    enabled: !!agentId,
  });
}

export function useOrgAgentOverview() {
  return useQuery({
    queryKey: ['org-agent-overview'],
    queryFn: async () => {
      const res = await api.get('/api/org-tree/agent-overview');
      return res.data as OrgEmployee[];
    },
  });
}
