'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot, Users, MoreVertical, Share2, Eye, Server } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveTabContexts } from '@/hooks/use-agent-contexts';
import { useSharedAgents } from '@/hooks/use-shared-agents';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ShareAgentDialog } from '@/components/agent-sharing/share-agent-dialog';
import { AgentSharesList } from '@/components/agent-sharing/agent-shares-list';
import { SharedSessionViewer } from '@/components/agent-sharing/shared-session-viewer';

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  model?: string;
  status: 'active' | 'idle' | 'error';
  isMaster?: boolean;
  nodeId?: string | null;
  node?: {
    id: string;
    name: string;
    online: boolean;
  } | null;
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogAgentId, setShareDialogAgentId] = useState<string>('');
  const [shareDialogAgentName, setShareDialogAgentName] = useState<string>('');
  const [viewLiveAgentId, setViewLiveAgentId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get<{ data: Agent[] }>('/api/agent-portal/agents');
      return res.data;
    },
  });

  const { data: contexts } = useActiveTabContexts();
  const { data: sharedAgentsData, isLoading: sharedLoading } = useSharedAgents();

  const allAgents = data ?? [];
  const sharedAgents = sharedAgentsData?.data ?? [];

  // Filter out shared agents from "My Agents" to avoid duplication
  const sharedAgentIds = new Set(sharedAgents.map((s) => s.agent.id));
  const agents = allAgents.filter((agent) => !sharedAgentIds.has(agent.id));

  // Helper to get context for an agent
  const getAgentContext = (agentId: string) => {
    return contexts?.find((ctx: any) => ctx.agentId === agentId);
  };

  const handleShareClick = (agentId: string, agentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDialogAgentId(agentId);
    setShareDialogAgentName(agentName);
    setShareDialogOpen(true);
  };

  const handleViewLiveClick = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewLiveAgentId(agentId);
  };

  return (
    <div className="flex h-full w-[260px] flex-shrink-0 flex-col border-r bg-card/50">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center border-b px-4">
        <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Agents</span>
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1 min-h-0">
        {/* My Agents Section */}
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              My Agents
            </h3>
          </div>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            const context = getAgentContext(agent.id);
            
            return (
              <div key={agent.id} className="relative group">
                <TooltipProvider>
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
                            {agent.nodeId && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                <Server className="w-2.5 h-2.5" />
                                remote
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

                {/* Share Menu - shown on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleShareClick(agent.id, agent.name, e)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleViewLiveClick(agent.id, e)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Live Sessions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          
          {!isLoading && agents.length === 0 && (
            <div className="px-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No agents available</p>
            </div>
          )}
        </div>

        {/* Shared With Me Section */}
        {sharedAgents.length > 0 && (
          <div className="p-2 space-y-1 mt-4 border-t pt-4">
            <div className="px-2 py-1.5 flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Shared With Me
              </h3>
            </div>
            
            {sharedAgents.map((share) => {
              const isSelected = selectedAgentId === share.agent.id;
              const ownerName = share.owner.employee 
                ? `${share.owner.employee.firstName} ${share.owner.employee.lastName}`
                : share.owner.email;
              const department = share.owner.employee?.department?.name || '';
              
              return (
                <TooltipProvider key={share.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectAgent(share.agent.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-all',
                          isSelected
                            ? 'bg-purple-600/10 shadow-sm ring-1 ring-purple-600/20'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0 relative',
                          isSelected 
                            ? 'bg-purple-600/20' 
                            : 'bg-muted'
                        )}>
                          🤖
                          {/* Shared indicator */}
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                            <Users className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-medium truncate text-sm',
                              isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-foreground'
                            )}>
                              {share.agent.name}
                            </span>
                            {share.permission === 'control' ? (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                                control
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                                view
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-purple-600 dark:text-purple-400 truncate">
                            Shared by {ownerName}
                          </p>
                          
                          {/* Cost usage bar (if limit exists) */}
                          {share.costLimit && (
                            <div className="mt-1">
                              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-1 transition-all',
                                    (Number(share.costUsed) / Number(share.costLimit)) * 100 < 75 && 'bg-emerald-500',
                                    (Number(share.costUsed) / Number(share.costLimit)) * 100 >= 75 && (Number(share.costUsed) / Number(share.costLimit)) * 100 < 90 && 'bg-amber-500',
                                    (Number(share.costUsed) / Number(share.costLimit)) * 100 >= 90 && 'bg-red-500'
                                  )}
                                  style={{ width: `${Math.min((Number(share.costUsed) / Number(share.costLimit)) * 100, 100)}%` }}
                                />
                              </div>
                              <p className="text-[8px] text-muted-foreground mt-0.5">
                                ${Number(share.costUsed).toFixed(4)} / ${Number(share.costLimit).toFixed(2)} spent
                              </p>
                            </div>
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-semibold">{share.agent.name}</p>
                      <p className="text-xs mt-1">Shared by {ownerName}</p>
                      {department && (
                        <p className="text-xs text-muted-foreground">{department}</p>
                      )}
                      <p className="text-xs mt-1">
                        Permission: <span className="font-medium">{share.permission}</span>
                      </p>
                      {share.costLimit && (
                        <p className="text-xs mt-1">
                          Budget: ${Number(share.costUsed).toFixed(4)} / ${Number(share.costLimit).toFixed(2)}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Share Agent Dialog */}
      <ShareAgentDialog
        agentId={shareDialogAgentId}
        agentName={shareDialogAgentName}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {/* Shared Session Viewer */}
      {viewLiveAgentId && (
        <SharedSessionViewer
          agentId={viewLiveAgentId}
          open={!!viewLiveAgentId}
          onOpenChange={(open) => !open && setViewLiveAgentId(null)}
        />
      )}
    </div>
  );
}
