'use client';

import { useState, useMemo } from 'react';
import { useSessionEvents } from '@/hooks/use-session-events';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const EVENT_TYPES = ['all', 'instruction', 'thinking', 'tool_call', 'delegation', 'message_in', 'message_out', 'report', 'error', 'fix', 'completion'];

const TYPE_COLORS: Record<string, string> = {
  instruction: 'text-blue-400',
  thinking: 'text-amber-400',
  tool_call: 'text-zinc-400',
  delegation: 'text-purple-400',
  error: 'text-red-400',
  fix: 'text-emerald-400',
  completion: 'text-emerald-400',
  report: 'text-blue-400',
  message_in: 'text-cyan-400',
  message_out: 'text-cyan-400',
};

export function RawLogsTab({ sessionId }: { sessionId: string | null }) {
  const { data: events, isLoading } = useSessionEvents(sessionId);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (events || [])
      .filter(e => filter === 'all' || e.type === filter)
      .filter(e => !search || e.content?.toLowerCase().includes(search.toLowerCase()));
  }, [events, filter, search]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${sessionId || 'unknown'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <Input
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-7 text-xs bg-background"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(t => (
              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={exportJSON}
          className="h-7 px-2.5 text-[10px] font-medium text-muted-foreground border border-border/60 rounded-md hover:bg-muted/50 transition-colors shrink-0"
        >
          Export JSON
        </button>
      </div>

      {/* Log viewer */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 text-zinc-100 p-3 font-mono text-[11px] leading-relaxed space-y-px max-h-[calc(100vh-340px)]">
        {filtered.length === 0 && (
          <p className="text-zinc-600 py-4 text-center">No logs match your filters</p>
        )}
        {filtered.map(e => {
          const time = new Date(e.timestamp).toISOString().slice(11, 23);
          const cost = Number(e.cost);
          const typeColor = TYPE_COLORS[e.type] || 'text-zinc-500';
          return (
            <div key={e.id}>
              <button
                onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                className="w-full text-left hover:bg-zinc-900 rounded px-1.5 py-0.5 flex items-baseline gap-2"
              >
                <span className="text-zinc-600 shrink-0">{time}</span>
                <span className={cn('uppercase text-[10px] font-bold shrink-0 w-20', typeColor)}>
                  {e.type}
                </span>
                {e.tokenCount > 0 && <span className="text-cyan-500/70 shrink-0">{e.tokenCount}t</span>}
                {cost > 0 && <span className="text-emerald-500/70 shrink-0">${cost.toFixed(4)}</span>}
                <span className="text-zinc-500 truncate flex-1">{e.content?.slice(0, 80)}</span>
              </button>
              {expandedId === e.id && (
                <pre className="ml-[5.5rem] mt-0.5 mb-1 text-zinc-400 whitespace-pre-wrap break-words text-[10px] border-l-2 border-zinc-800 pl-2 max-h-60 overflow-y-auto">
                  {e.content}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
