import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SharedAgent {
  id: string;
  agentId: string;
  ownerId: string;
  sharedWithUserId: string;
  permission: 'control' | 'view';
  mode: 'route' | 'collaborate' | 'transfer';
  status: 'active' | 'revoked' | 'expired';
  costLimit: number | null;
  costUsed: number;
  expiresAt: string | null;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    description: string | null;
    model: string;
    type: string;
  };
  owner: {
    id: string;
    email: string;
    employee: {
      firstName: string;
      lastName: string;
      department: {
        name: string;
      };
    } | null;
  };
  sharedWithUser: {
    id: string;
    email: string;
    employee: {
      firstName: string;
      lastName: string;
      department: {
        name: string;
      } | null;
    } | null;
  };
}

/**
 * Hook to fetch agents that others have shared with me
 */
export function useSharedAgents() {
  return useQuery<{ data: SharedAgent[] }>({
    queryKey: ['shared-agents'],
    queryFn: () => api.get('/api/agents/shared-with-me'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch who I've shared my agent with
 */
export function useMyAgentShares(agentId: string | null) {
  return useQuery<{ data: SharedAgent[] }>({
    queryKey: ['agent-shares', agentId],
    queryFn: () => api.get(`/api/agents/${agentId}/shares`),
    enabled: !!agentId,
  });
}
