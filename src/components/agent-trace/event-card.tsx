'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SessionEvent } from '@/hooks/use-session-events';

const EVENT_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  instruction: { icon: '→', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', label: 'INSTRUCTION' },
  thinking: { icon: '◆', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', label: 'THINKING' },
  tool_call: { icon: '⚡', color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-400', label: 'TOOL_CALL' },
  delegation: { icon: '↗', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500', label: 'DELEGATION' },
  message_in: { icon: '←', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', label: 'MESSAGE' },
  message_out: { icon: '→', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', label: 'MESSAGE' },
  report: { icon: '↑', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', label: 'REPORT' },
  error: { icon: '✕', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', label: 'ERROR' },
  fix: { icon: '✓', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', label: 'FIX' },
  completion: { icon: '●', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', label: 'COMPLETION' },
};

interface EventCardProps {
  event: SessionEvent;
  showAgent?: boolean;
}

export function EventCard({ event, showAgent }: EventCardProps) {
  const [expanded, setExpanded] = useState(event.type !== 'thinking');
  const config = EVENT_CONFIG[event.type] || { icon: '·', color: 'text-muted-foreground', bg: 'bg-muted', label: event.type.toUpperCase() };

  const cost = Number(event.cost);
  const time = new Date(event.timestamp).toISOString().slice(11, 19);

  return (
    <div className="group flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div className={cn('h-2 w-2 rounded-full shrink-0', config.bg)} />
        <div className="flex-1 w-px bg-border/40 mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{time}</span>
          {showAgent && event.fromAgent && (
            <span className="text-[11px] font-medium text-foreground">{event.fromAgent.name}</span>
          )}
          <span className={cn('text-[10px] font-semibold tracking-wider', config.color)}>
            {config.label}
          </span>
          {event.tokenCount > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">{event.tokenCount} tok</span>
          )}
          {cost > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">${cost.toFixed(4)}</span>
          )}
        </div>

        {event.type === 'thinking' && !expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <span className="italic">{event.content?.slice(0, 120)}…</span>
            <span className="ml-1 underline text-[10px]">expand</span>
          </button>
        ) : (
          <>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
              {event.content}
            </p>
            {event.type === 'thinking' && expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="text-[10px] underline text-muted-foreground/60 hover:text-muted-foreground mt-1"
              >
                collapse
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
