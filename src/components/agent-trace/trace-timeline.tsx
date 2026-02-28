'use client';

import { useState, useMemo } from 'react';
import { useTraceSessions } from '@/hooks/use-trace-sessions';
import { useSessionEvents, type SessionEvent } from '@/hooks/use-session-events';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const EVENT_STYLES: Record<string, { color: string; dotColor: string; label: string }> = {
  instruction: { color: 'text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500', label: 'INSTRUCTION' },
  thinking: { color: 'text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500', label: 'THINKING' },
  delegation: { color: 'text-purple-600 dark:text-purple-400', dotColor: 'bg-purple-500', label: 'DELEGATION' },
  tool_call: { color: 'text-zinc-500 dark:text-zinc-400', dotColor: 'bg-zinc-400', label: 'TOOL_CALL' },
  error: { color: 'text-red-600 dark:text-red-400', dotColor: 'bg-red-500', label: 'ERROR' },
  fix: { color: 'text-emerald-600 dark:text-emerald-400', dotColor: 'bg-emerald-500', label: 'FIX' },
  report: { color: 'text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500', label: 'REPORT' },
  completion: { color: 'text-emerald-600 dark:text-emerald-400', dotColor: 'bg-emerald-500', label: 'COMPLETION' },
  message_in: { color: 'text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500', label: 'MESSAGE' },
  message_out: { color: 'text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500', label: 'MESSAGE' },
};

interface TraceTimelineProps {
  traceId: string;
  sessionIds: string[];
}

export function TraceTimeline({ traceId, sessionIds }: TraceTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch events for all sessions
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ['trace-all-events', traceId, sessionIds],
    queryFn: async () => {
      if (!sessionIds.length) return [];
      const results = await Promise.all(
        sessionIds.map(async (sid) => {
          try {
            const res = await api.get(`/api/sessions/${sid}/events`);
            return (res.data as SessionEvent[]).map(e => ({ ...e, sessionId: sid }));
          } catch {
            return [];
          }
        })
      );
      return results.flat().sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    },
    enabled: sessionIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!allEvents?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-lg">
        <p className="text-sm">No events recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {allEvents.map((event, i) => {
        const style = EVENT_STYLES[event.type] || { color: 'text-muted-foreground', dotColor: 'bg-muted', label: event.type.toUpperCase() };
        const time = new Date(event.timestamp).toISOString().slice(11, 19);
        const cost = Number(event.cost);
        const isExpanded = expandedId === event.id;
        const agentName = event.fromAgent?.name || event.toAgent?.name || '';

        return (
          <div key={event.id} className="flex gap-3 group">
            {/* Timeline rail */}
            <div className="flex flex-col items-center shrink-0">
              <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', style.dotColor)} />
              {i < allEvents.length - 1 && <div className="flex-1 w-px bg-border/30 mt-1" />}
            </div>

            {/* Event content */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
              className="flex-1 min-w-0 text-left pb-3 hover:bg-muted/20 rounded-md px-2 py-1 -ml-2 transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{time}</span>
                {agentName && (
                  <span className="text-[11px] font-medium text-foreground">{agentName}</span>
                )}
                <span className={cn('text-[10px] font-bold tracking-wider', style.color)}>
                  {style.label}
                </span>
                {event.tokenCount > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">{event.tokenCount} tok</span>
                )}
                {cost > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">${cost.toFixed(4)}</span>
                )}
              </div>
              {!isExpanded && event.content && (
                <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{event.content.slice(0, 100)}</p>
              )}
              {isExpanded && event.content && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words mt-1 leading-relaxed">
                  {event.content}
                </p>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
