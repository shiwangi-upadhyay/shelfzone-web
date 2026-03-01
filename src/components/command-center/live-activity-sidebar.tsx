'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PanelRightClose, PanelRightOpen, Activity, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TraceEvent } from '@/hooks/use-command-center';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'thinking' | 'decision' | 'delegation' | 'executing' | 'completion' | 'error';
  agentName: string;
  agentEmoji?: string;
  content: string;
  cost?: number;
  toAgentName?: string;
  toAgentEmoji?: string;
}

interface LiveActivitySidebarProps {
  events: TraceEvent[];
  totalCost: number;
  isActive: boolean;
}

function getActivityType(event: TraceEvent): ActivityItem['type'] {
  if (event.type === 'agent:thinking') return 'thinking';
  if (event.type === 'agent:delegation') return 'delegation';
  if (event.type === 'agent:tool_call') return 'executing';
  if (event.type === 'agent:completion') return 'completion';
  if (event.type === 'agent:error') return 'error';
  if (event.type === 'agent:message') return 'decision';
  return 'thinking';
}

function getActivityContent(event: TraceEvent): string {
  const d = event.data;
  
  switch (event.type) {
    case 'agent:thinking':
      return (d.text as string) || 'Analyzing...';
    case 'agent:delegation':
      return (d.instruction as string) || 'Delegating task...';
    case 'agent:tool_call':
      return `Using ${(d.toolName as string) || 'tool'}...`;
    case 'agent:completion':
      return (d.content as string) || (d.message as string) || 'Done ✓';
    case 'agent:error':
      return (d.message as string) || (d.error as string) || 'Error occurred';
    case 'agent:message':
      return (d.content as string) || (d.text as string) || '';
    default:
      return '';
  }
}

function getAgentName(event: TraceEvent): string {
  const d = event.data;
  return (d.agentName as string) || (d.fromAgent as any)?.name || 'Agent';
}

function getAgentEmoji(event: TraceEvent): string {
  const d = event.data;
  return (d.agentEmoji as string) || '🤖';
}

function ActivityItemCard({ item }: { item: ActivityItem }) {
  const typeStyles = {
    thinking: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
    decision: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20',
    delegation: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20',
    executing: 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30',
    completion: 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20',
    error: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
  };

  const typeLabels = {
    thinking: 'Thinking',
    decision: 'Decision',
    delegation: 'Delegation',
    executing: 'Executing',
    completion: 'Complete',
    error: 'Error',
  };

  return (
    <div className={cn('animate-in slide-in-from-bottom-2 duration-300 rounded-lg border px-2.5 py-2', typeStyles[item.type])}>
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0">{item.agentEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold truncate">{item.agentName}</span>
            <span className="text-[9px] font-bold uppercase text-muted-foreground">
              {typeLabels[item.type]}
            </span>
          </div>
          
          {item.type === 'delegation' && item.toAgentName ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>{item.toAgentEmoji}</span>
              <span className="font-medium">{item.toAgentName}</span>
            </div>
          ) : (
            <p className="text-[11px] text-foreground/80 leading-tight line-clamp-2">
              {item.content}
            </p>
          )}
          
          {item.cost !== undefined && item.cost > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
              <DollarSign className="h-2.5 w-2.5" />
              <span>${(Number(item.cost) || 0).toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveActivitySidebar({ events, totalCost, isActive }: LiveActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Convert events to activities
  useEffect(() => {
    const items: ActivityItem[] = events.map((event) => {
      const d = event.data;
      return {
        id: event.id,
        timestamp: event.timestamp,
        type: getActivityType(event),
        agentName: getAgentName(event),
        agentEmoji: getAgentEmoji(event),
        content: getActivityContent(event),
        cost: d.cost as number | undefined,
        toAgentName: event.type === 'agent:delegation' ? (d.agentName as string) : undefined,
        toAgentEmoji: event.type === 'agent:delegation' ? (d.agentEmoji as string) : undefined,
      };
    });
    setActivities(items);
  }, [events]);

  // Auto-scroll to bottom on new activity
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 100);
    }
  }, [activities.length]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-0 z-10 m-1 h-7 w-7"
        title={collapsed ? 'Show activity' : 'Hide activity'}
      >
        {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
      </Button>

      {!collapsed && (
        <div className="flex h-full w-[320px] flex-col border-l bg-card">
          {/* Header */}
          <div className="flex h-12 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Live Activity</span>
            </div>
            {isActive && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            )}
          </div>

          {/* Activity Stream */}
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="space-y-2 p-3">
              {activities.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Activity will appear here as agents work.
                </p>
              )}
              {activities.map((item) => (
                <ActivityItemCard key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>

          {/* Total Cost Footer */}
          <div className="border-t bg-muted/30 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Cost</span>
            <span className="text-sm font-mono font-bold text-foreground">
              ${totalCost.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
