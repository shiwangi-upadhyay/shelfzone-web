import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Trace {
  id: string;
  instruction: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  duration?: number;
  totalCost?: number;
  agentCount?: number;
  ownerId: string;
  ownerName?: string;
}

export interface TraceFilters {
  status?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useTraces(filters?: TraceFilters) {
  return useQuery({
    queryKey: ['traces', filters],
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
      const url = `/api/traces${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    },
  });
}

export function useTrace(traceId: string) {
  return useQuery({
    queryKey: ['trace', traceId],
    queryFn: async () => {
      const response = await api.get(`/api/traces/${traceId}`);
      return response.data;
    },
    enabled: !!traceId,
  });
}

export function useCreateTrace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { instruction: string; agentId?: string }) => {
      const response = await api.post('/api/traces', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
    },
  });
}

export function useDeleteTrace() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (traceId: string) => {
      const response = await api.delete(`/api/traces/${traceId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
    },
  });
}
