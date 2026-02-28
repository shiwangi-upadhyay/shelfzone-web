import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgentStats {
  agentId: string;
  totalSessions: number;
  avgCost: number;
  totalCost: number;
  tokensIn: number;
  tokensOut: number;
  errorRate: number;
  avgDuration: number;
  costToday: number;
  costThisWeek: number;
  costThisMonth: number;
}

export interface CostBreakdownItem {
  date: string;
  cost: number;
  sessions: number;
}

export interface ExpensiveOperation {
  id: string;
  type: string;
  description: string;
  cost: number;
  timestamp: string;
}

export interface AgentCostBreakdown {
  daily: CostBreakdownItem[];
  topExpensive: ExpensiveOperation[];
}

export interface EmployeeAgentSummary {
  employeeId: string;
  employeeName: string;
  agents: Array<{
    id: string;
    name: string;
    emoji: string;
    status: 'active' | 'idle' | 'offline';
    costToday: number;
  }>;
}

export function useAgentStats(agentId: string) {
  return useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async () => {
      const response = await api.get(`/api/agents/${agentId}/stats`);
      return response.data as AgentStats;
    },
    enabled: !!agentId,
  });
}

export function useAgentCostBreakdown(agentId: string) {
  return useQuery({
    queryKey: ['agent-cost-breakdown', agentId],
    queryFn: async () => {
      const response = await api.get(`/api/agents/${agentId}/cost-breakdown`);
      return response.data as AgentCostBreakdown;
    },
    enabled: !!agentId,
  });
}

export function useEmployeeAgentSummary(employeeId: string) {
  return useQuery({
    queryKey: ['employee-agent-summary', employeeId],
    queryFn: async () => {
      const response = await api.get(`/api/employees/${employeeId}/agents`);
      return response.data as EmployeeAgentSummary;
    },
    enabled: !!employeeId,
  });
}

export function useOrgAgentOverview() {
  return useQuery({
    queryKey: ['org-agent-overview'],
    queryFn: async () => {
      const response = await api.get('/api/org-tree/agent-overview');
      return response.data;
    },
  });
}
