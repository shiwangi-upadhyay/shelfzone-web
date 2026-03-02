'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AgentCostBreakdown {
  agentId: string;
  agentName: string;
  totalCost: number;
  totalTokens: number;
  tokensIn: number;
  tokensOut: number;
  messageCount: number;
}

interface TabCostBreakdown {
  tabId: string | null;
  tabName: string | null;
  totalCost: number;
  agents: AgentCostBreakdown[];
}

function AgentCostItem({ agent, totalCost }: { agent: AgentCostBreakdown; totalCost: number }) {
  const percentage = totalCost > 0 ? (agent.totalCost / totalCost) * 100 : 0;

  // Color based on cost share
  const getColorClass = () => {
    if (percentage > 50) return 'text-red-600 dark:text-red-400';
    if (percentage > 25) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{agent.agentName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-lg font-semibold', getColorClass())}>
              ${agent.totalCost.toFixed(4)}
            </span>
            <Badge variant="outline" className="text-xs">
              {percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            {agent.totalTokens.toLocaleString()} tokens
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {agent.messageCount} {agent.messageCount === 1 ? 'message' : 'messages'}
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            percentage > 50 ? 'bg-red-500' : percentage > 25 ? 'bg-amber-500' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Token breakdown */}
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>↓ {agent.tokensIn.toLocaleString()} in</span>
        <span>↑ {agent.tokensOut.toLocaleString()} out</span>
      </div>
    </div>
  );
}

export function CostBreakdown() {
  const { data, isLoading, error } = useQuery<{ data: TabCostBreakdown }>({
    queryKey: ['cost-breakdown-current-tab'],
    queryFn: () => api.get('/api/command-center/costs/current-tab'),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const breakdown = data?.data;

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading costs...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-sm text-red-500">Failed to load cost breakdown</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <h2 className="font-semibold">Cost Breakdown</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">${(breakdown?.totalCost || 0).toFixed(4)}</p>
          </div>
        </div>
        {breakdown?.tabName && (
          <p className="text-xs text-muted-foreground mt-2">
            Tab: <span className="font-medium">{breakdown.tabName}</span>
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 p-2">
        {!breakdown || breakdown.agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No costs yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Costs will appear as you use agents
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {breakdown.agents.map((agent) => (
              <AgentCostItem
                key={agent.agentId}
                agent={agent}
                totalCost={breakdown.totalCost}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
