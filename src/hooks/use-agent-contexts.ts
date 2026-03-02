import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgentContext {
  id: string;
  conversationId: string;
  agentId: string;
  tokensUsed: number;
  maxTokens: number;
  lastMessageAt: string;
  agent: {
    id: string;
    name: string;
    model: string;
  };
  usage: {
    tokensUsed: number;
    maxTokens: number;
    percentage: number;
    level: 'green' | 'amber' | 'red';
  };
}

// Get context for all agents in active tab
export function useActiveTabContexts() {
  return useQuery({
    queryKey: ['agent-contexts', 'active-tab'],
    queryFn: async () => {
      const response = await api.get<{ data: AgentContext[] }>(
        '/api/command-center/contexts/active/tab'
      );
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Get context for a specific conversation
export function useConversationContexts(conversationId: string | null) {
  return useQuery({
    queryKey: ['agent-contexts', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await api.get<{ data: AgentContext[] }>(
        `/api/command-center/contexts/${conversationId}`
      );
      return response.data;
    },
    enabled: !!conversationId,
  });
}
