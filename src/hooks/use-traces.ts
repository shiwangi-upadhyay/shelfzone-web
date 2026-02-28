'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Trace {
  id: string;
  ownerId: string;
  masterAgentId: string;
  instruction: string;
  status: string;
  totalCost: string;
  totalTokens: number;
  agentsUsed: number;
  startedAt: string;
  completedAt: string | null;
  masterAgent: { id: string; name: string };
}

export interface TraceFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useTraces(filters: TraceFilters = {}) {
  return useQuery({
    queryKey: ['traces', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
      });
      const qs = params.toString();
      const res = await api.get(`/api/traces${qs ? `?${qs}` : ''}`);
      return res.data as Trace[];
    },
  });
}

export function useTrace(id: string | null) {
  return useQuery({
    queryKey: ['trace', id],
    queryFn: async () => {
      const res = await api.get(`/api/traces/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
