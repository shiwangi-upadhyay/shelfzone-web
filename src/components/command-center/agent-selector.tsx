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

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-amber-400',
  error: 'bg-red-500',
};

export function AgentSelector({ 
  selectedAgentId, 
  onSelectAgent
}: AgentSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get<{ data: Agent[] }>('/api/agent-portal/agents');
      return res.data;
    },
  });

  const agents = data ?? [];

  return (
    <div className="flex h-full w-[260px] flex-col border-r bg-card/50">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Agents</span>
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            
            return (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all',
                  isSelected
                    ? 'bg-indigo-600/10 shadow-sm ring-1 ring-indigo-600/20'
                    : 'hover:bg-accent/50'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-lg shrink-0',
                  isSelected 
                    ? 'bg-indigo-600/20' 
                    : 'bg-muted'
                )}>
                  {agent.emoji || '🤖'}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-medium truncate text-sm',
                      isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'
                    )}>
                      {agent.name}
                    </span>
                    {agent.isMaster && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                        master
                      </span>
                    )}
                  </div>
                  {agent.model && (
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                      {agent.model}
                    </p>
                  )}
                </div>
                
                {/* Status Dot */}
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    statusColor[agent.status] || 'bg-gray-400'
                  )}
                />
              </button>
            );
          })}
          
          {!isLoading && agents.length === 0 && (
            <div className="px-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No agents available</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
