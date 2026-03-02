'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveTabContexts } from '@/hooks/use-agent-contexts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const { data: contexts } = useActiveTabContexts();

  const agents = data ?? [];

  // Helper to get context for an agent
  const getAgentContext = (agentId: string) => {
    return contexts?.find((ctx: any) => ctx.agentId === agentId);
  };

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
            const context = getAgentContext(agent.id);
            
            return (
              <TooltipProvider key={agent.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
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
                        
                        {/* Context Usage Bar */}
                        {context && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all',
                                  context.usage.level === 'green' && 'bg-emerald-500',
                                  context.usage.level === 'amber' && 'bg-amber-500',
                                  context.usage.level === 'red' && 'bg-red-500'
                                )}
                                style={{ width: `${Math.min(context.usage.percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {context.usage.percentage.toFixed(1)}% context used
                            </p>
                          </div>
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
                  </TooltipTrigger>
                  {context && (
                    <TooltipContent side="right">
                      <p className="font-semibold">{agent.name} Context Usage</p>
                      <p className="text-xs mt-1">
                        {context.tokensUsed.toLocaleString()} / {context.maxTokens.toLocaleString()} tokens
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {context.usage.percentage.toFixed(1)}% used
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
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
