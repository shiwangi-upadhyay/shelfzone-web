'use client';

import { useState } from 'react';
import { useSessionEvents } from '@/hooks/use-session-events';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const EVENT_TYPES = ['all', 'instruction', 'thinking', 'tool_call', 'delegation', 'message_in', 'message_out', 'report', 'error', 'fix', 'completion'];

export function RawLogsTab({ sessionId }: { sessionId: string | null }) {
  const { data: events, isLoading } = useSessionEvents(sessionId);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  const filtered = (events || [])
    .filter(e => filter === 'all' || e.type === filter)
    .filter(e => !search || e.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 p-3 border-b border-border">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto bg-zinc-900 text-zinc-100 p-3 font-mono text-xs space-y-1 max-h-[calc(100vh-340px)]">
        {filtered.length === 0 && (
          <p className="text-zinc-500">No logs found</p>
        )}
        {filtered.map(e => {
          const time = new Date(e.timestamp).toISOString().slice(11, 19);
          const cost = Number(e.cost);
          return (
            <div key={e.id}>
              <button
                onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                className="w-full text-left hover:bg-zinc-800 rounded px-1 py-0.5"
              >
                <span className="text-zinc-500">[{time}]</span>{' '}
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-700 text-zinc-300 uppercase">{e.type}</span>{' '}
                {e.tokenCount > 0 && <span className="text-cyan-400">{e.tokenCount}tok</span>}{' '}
                {cost > 0 && <span className="text-green-400">${cost.toFixed(4)}</span>}
              </button>
              {expandedId === e.id && (
                <pre className="ml-4 mt-1 text-zinc-400 whitespace-pre-wrap break-words text-[11px] border-l border-zinc-700 pl-2">
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
