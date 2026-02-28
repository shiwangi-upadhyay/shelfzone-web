import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: 'instruction' | 'message_in' | 'message_out' | 'report' | 'thinking' | 
        'tool_call' | 'tool_result' | 'error' | 'fix' | 'delegation' | 'completion';
  content: string;
  metadata?: {
    sender?: string;
    recipient?: string;
    toolName?: string;
    command?: string;
    result?: string;
    subAgentId?: string;
    subAgentName?: string;
    errorType?: string;
    fixDescription?: string;
  };
  timestamp: string;
  tokensIn?: number;
  tokensOut?: number;
  cost?: number;
}

export interface EventFilters {
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useSessionEvents(sessionId: string, filters?: EventFilters) {
  return useQuery({
    queryKey: ['session-events', sessionId, filters],
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
      const url = `/api/sessions/${sessionId}/events${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!sessionId,
  });
}

export function useSessionTimeline(sessionId: string) {
  return useQuery({
    queryKey: ['session-timeline', sessionId],
    queryFn: async () => {
      const response = await api.get(`/api/sessions/${sessionId}/timeline`);
      return response.data;
    },
    enabled: !!sessionId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      sessionId: string; 
      type: string; 
      content: string;
      metadata?: Record<string, any>;
    }) => {
      const response = await api.post(`/api/sessions/${data.sessionId}/events`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-events', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-timeline', variables.sessionId] });
    },
  });
}
