'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  model?: string;
  status: 'active' | 'idle' | 'error';
  isMaster?: boolean;
}

interface AgentSidebarProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-amber-400',
  error: 'bg-red-500',
};

export function AgentSidebar({ selectedAgentId, onSelectAgent }: AgentSidebarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get<{ data: Agent[] }>('/api/agents');
      return res.data;
    },
  });

  const agents = data ?? [];

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-card">
      <div className="flex h-12 items-center border-b px-4">
        <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Agents</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                selectedAgentId === agent.id
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <span className="text-lg">{agent.emoji || '🤖'}</span>
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{agent.name}</span>
                  {agent.isMaster && (
                    <span className="text-[10px] font-bold uppercase text-indigo-500">master</span>
                  )}
                </div>
                {agent.model && (
                  <p className="text-xs text-muted-foreground font-mono truncate">{agent.model}</p>
                )}
              </div>
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  statusColor[agent.status] || 'bg-gray-400'
                )}
              />
            </button>
          ))}
          {!isLoading && agents.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No agents found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
