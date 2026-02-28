'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SessionAgent {
  id?: string;
  name: string;
  slug?: string;
  type?: string;
}

export interface SessionTree {
  id: string;
  agent: SessionAgent;
  instruction?: string;
  status: string;
  cost: string;
  tokensIn?: number;
  tokensOut?: number;
  startedAt: string;
  completedAt: string | null;
  _count?: { events: number };
  children: SessionTree[];
}

export function useTraceSessions(traceId: string | null) {
  return useQuery({
    queryKey: ['trace-sessions', traceId],
    queryFn: async () => {
      const res = await api.get(`/api/traces/${traceId}/sessions`);
      return res.data as SessionTree[];
    },
    enabled: !!traceId,
  });
}
