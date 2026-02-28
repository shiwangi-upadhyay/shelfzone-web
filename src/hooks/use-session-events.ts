'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: string;
  fromAgentId: string | null;
  toAgentId: string | null;
  content: string;
  metadata: Record<string, unknown>;
  tokenCount: number;
  cost: string;
  durationMs: number;
  timestamp: string;
  fromAgent: { id: string; name: string } | null;
  toAgent: { id: string; name: string } | null;
}

export function useSessionEvents(sessionId: string | null, opts?: { type?: string }) {
  return useQuery({
    queryKey: ['session-events', sessionId, opts?.type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (opts?.type) params.set('type', opts.type);
      const qs = params.toString();
      const res = await api.get(`/api/sessions/${sessionId}/events${qs ? `?${qs}` : ''}`);
      return res.data as SessionEvent[];
    },
    enabled: !!sessionId,
  });
}
