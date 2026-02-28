'use client';

import { useState } from 'react';
import type { SessionEvent } from '@/hooks/use-session-events';

const EVENT_CONFIG: Record<string, { icon: string; border: string; label: string }> = {
  instruction: { icon: '📥', border: 'border-l-blue-500', label: 'Instruction' },
  thinking: { icon: '🧠', border: 'border-l-amber-500', label: 'Thinking' },
  tool_call: { icon: '🔧', border: 'border-l-zinc-400', label: 'Tool Call' },
  delegation: { icon: '➡️', border: 'border-l-purple-500', label: 'Delegation' },
  message_in: { icon: '📥', border: 'border-l-green-500', label: 'Message In' },
  message_out: { icon: '📤', border: 'border-l-green-500', label: 'Message Out' },
  report: { icon: '📤', border: 'border-l-green-500', label: 'Report' },
  error: { icon: '❌', border: 'border-l-red-500', label: 'Error' },
  fix: { icon: '✅', border: 'border-l-green-500', label: 'Fix' },
  completion: { icon: '🏁', border: 'border-l-purple-500', label: 'Completed' },
};

export function EventCard({ event }: { event: SessionEvent }) {
  const [expanded, setExpanded] = useState(event.type !== 'thinking');
  const config = EVENT_CONFIG[event.type] || { icon: '📎', border: 'border-l-zinc-300', label: event.type };

  const header = (() => {
    switch (event.type) {
      case 'instruction': return `FROM: ${event.fromAgent?.name || 'Owner'}`;
      case 'delegation': return `TO: ${event.toAgent?.name || 'Unknown'}`;
      case 'message_in': return `FROM: ${event.fromAgent?.name || 'Unknown'}`;
      case 'completion': return 'COMPLETED';
      default: return config.label;
    }
  })();

  const cost = Number(event.cost);
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div className={`border-l-4 ${config.border} rounded-lg bg-card shadow-sm p-3 space-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>{config.icon}</span>
          <span>{header}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {event.tokenCount > 0 && <span>{event.tokenCount} tok</span>}
          {cost > 0 && <span>${cost.toFixed(4)}</span>}
          <span>{time}</span>
        </div>
      </div>
      {event.type === 'thinking' && !expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {event.content.slice(0, 100)}... <span className="underline">expand</span>
        </button>
      ) : (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.content}</p>
      )}
      {event.type === 'thinking' && expanded && (
        <button onClick={() => setExpanded(false)} className="text-xs underline text-muted-foreground">
          collapse
        </button>
      )}
    </div>
  );
}
