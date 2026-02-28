'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---------- Types ----------

export type EventType =
  | 'agent:thinking'
  | 'agent:delegation'
  | 'agent:tool_call'
  | 'agent:error'
  | 'agent:fix'
  | 'agent:completion'
  | 'cost:update'
  | 'trace:completed';

export interface TraceEvent {
  id: string;
  type: EventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface StreamMessage {
  id: string;
  role: 'user' | 'event';
  content?: string;
  event?: TraceEvent;
  timestamp: string;
}

export interface TaskNode {
  id: string;
  agentEmoji: string;
  agentName: string;
  status: 'queued' | 'running' | 'done' | 'error';
  instruction?: string;
  startedAt?: string;
  completedAt?: string;
  cost: number;
  children: TaskNode[];
}

export interface TraceStatus {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalCost: number;
  sessions: {
    id: string;
    agentId: string;
    agentName: string;
    agentEmoji: string;
    status: string;
    cost: number;
    startedAt: string;
    completedAt?: string;
  }[];
}

// ---------- useInstruct ----------

export function useInstruct(masterAgentId: string | null) {
  return useMutation({
    mutationFn: async (instruction: string) => {
      console.log('[useInstruct] calling POST /api/agent-gateway/instruct', { masterAgentId, instruction });
      try {
        const res = await api.post('/api/agent-gateway/instruct', { masterAgentId, instruction });
        console.log('[useInstruct] raw response:', res);
        const data = (res as any).data ?? res;
        console.log('[useInstruct] extracted data:', data);
        return data as { traceId: string; sessionId: string };
      } catch (err) {
        console.error('[useInstruct] CAUGHT ERROR:', err);
        throw err;
      }
    },
  });
}

// ---------- useTraceStream ----------

export function useTraceStream(traceId: string | null) {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [tasks, setTasks] = useState<TaskNode[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const reset = useCallback(() => {
    setEvents([]);
    setTotalCost(0);
    setIsCompleted(false);
    setTasks([]);
  }, []);

  useEffect(() => {
    if (!traceId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // EventSource can't send Authorization header, so pass token as query param
    let token = '';
    try {
      const stored = localStorage.getItem('shelfzone-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        token = state?.accessToken || '';
      }
    } catch {}
    const es = new EventSource(`${apiUrl}/api/agent-gateway/stream/${traceId}?token=${token}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event: TraceEvent = JSON.parse(e.data);
        event.id = event.id || crypto.randomUUID();

        if (event.type === 'cost:update') {
          setTotalCost(Number(event.data.totalCost) || 0);
          return;
        }

        if (event.type === 'trace:completed') {
          setIsCompleted(true);
          es.close();
          return;
        }

        setEvents((prev) => [...prev, event]);

        // Build task tree from delegation events
        if (event.type === 'agent:delegation') {
          const d = event.data as Record<string, unknown>;
          setTasks((prev) => [
            ...prev,
            {
              id: (d.sessionId as string) || crypto.randomUUID(),
              agentEmoji: (d.agentEmoji as string) || '🤖',
              agentName: (d.agentName as string) || 'Agent',
              status: 'running',
              instruction: d.instruction as string,
              startedAt: event.timestamp,
              cost: 0,
              children: [],
            },
          ]);
        }

        if (event.type === 'agent:completion') {
          const d = event.data as Record<string, unknown>;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === d.sessionId
                ? { ...t, status: 'done' as const, completedAt: event.timestamp, cost: Number(d.cost) || 0 }
                : t
            )
          );
        }

        if (event.type === 'agent:error') {
          const d = event.data as Record<string, unknown>;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === d.sessionId ? { ...t, status: 'error' as const, completedAt: event.timestamp } : t
            )
          );
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [traceId]);

  return { events, totalCost, isCompleted, tasks, reset };
}

// ---------- useTraceStatus ----------

export function useTraceStatus(traceId: string | null) {
  return useQuery({
    queryKey: ['trace-status', traceId],
    queryFn: async () => {
      const res = await api.get<{ data: TraceStatus }>(`/api/agent-gateway/status/${traceId}`);
      return res.data;
    },
    enabled: !!traceId,
    refetchInterval: 3000,
  });
}
