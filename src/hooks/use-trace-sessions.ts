import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Session {
  id: string;
  traceId?: string;
  agentId: string;
  agentName?: string;
  agentEmoji?: string;
  status: 'active' | 'completed' | 'failed';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  totalCost?: number;
  tokensIn?: number;
  tokensOut?: number;
  eventCount?: number;
}

export interface SessionFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useTraceSessions(traceId: string) {
  return useQuery({
    queryKey: ['trace-sessions', traceId],
    queryFn: async () => {
      const response = await api.get(`/api/traces/${traceId}/sessions`);
      return response.data;
    },
    enabled: !!traceId,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/api/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
}

export function useAgentSessions(agentId: string, filters?: SessionFilters) {
  return useQuery({
    queryKey: ['agent-sessions', agentId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
      }
      const queryString = params.toString();
      const url = `/api/agents/${agentId}/sessions${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!agentId,
  });
}
