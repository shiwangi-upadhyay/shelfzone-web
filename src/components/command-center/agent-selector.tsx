'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  model?: string;
  status: 'active' | 'idle' | 'error';
  isMaster?: boolean;
}

interface AgentSelectorProps {
  selectedAgentIds: string[];
  onSelectAgents: (ids: string[]) => void;
  executionMode: 'delegate' | 'parallel' | 'sequential';
  onModeChange: (mode: 'delegate' | 'parallel' | 'sequential') => void;
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-amber-400',
  error: 'bg-red-500',
};

export function AgentSelector({ 
  selectedAgentIds, 
  onSelectAgents,
  executionMode,
  onModeChange 
}: AgentSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get<{ data: Agent[] }>('/api/agent-portal/agents');
      return res.data;
    },
  });

  const agents = data ?? [];
  const masterAgent = agents.find(a => a.isMaster);

  const toggleAgent = (id: string) => {
    if (executionMode === 'delegate') {
      // In delegate mode, only allow selecting master agent
      onSelectAgents(masterAgent?.id === id ? [id] : []);
    } else {
      // In parallel/sequential mode, allow multiple selections
      if (selectedAgentIds.includes(id)) {
        onSelectAgents(selectedAgentIds.filter(aid => aid !== id));
      } else {
        onSelectAgents([...selectedAgentIds, id]);
      }
    }
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-card">
      <div className="flex h-12 items-center border-b px-4">
        <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Select Agents</span>
      </div>

      {/* Execution Mode Selector */}
      <div className="border-b p-3 space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Mode</Label>
        <div className="space-y-1">
          <Button
            variant={executionMode === 'delegate' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => onModeChange('delegate')}
          >
            Let SHIWANGI delegate
          </Button>
          <Button
            variant={executionMode === 'parallel' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => onModeChange('parallel')}
          >
            Send to all (parallel)
          </Button>
          <Button
            variant={executionMode === 'sequential' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => onModeChange('sequential')}
          >
            Sequential execution
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          
          {agents.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id);
            const isDisabled = executionMode === 'delegate' && !agent.isMaster;
            
            return (
              <button
                key={agent.id}
                onClick={() => !isDisabled && toggleAgent(agent.id)}
                disabled={isDisabled}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'text-muted-foreground hover:bg-accent',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {/* Checkbox */}
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                
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
            );
          })}
          
          {!isLoading && agents.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No agents found</p>
          )}
        </div>
      </ScrollArea>

      {executionMode === 'delegate' && masterAgent && (
        <div className="border-t bg-muted/30 p-2 text-[10px] text-muted-foreground">
          <p>💡 SHIWANGI will decide which sub-agents to delegate to.</p>
        </div>
      )}
    </div>
  );
}
