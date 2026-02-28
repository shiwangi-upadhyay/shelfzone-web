'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PanelRightClose, PanelRightOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskNode } from '@/hooks/use-command-center';

interface TaskBoardProps {
  tasks: TaskNode[];
}

const statusVariant: Record<string, string> = {
  queued: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function elapsed(start?: string, end?: string) {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const secs = Math.round((e - s) / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function TaskItem({ task }: { task: TaskNode }) {
  return (
    <div className="rounded-lg border bg-card p-2.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base">{task.agentEmoji}</span>
        <span className="flex-1 truncate text-sm font-medium">{task.agentName}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', statusVariant[task.status])}>
          {task.status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {elapsed(task.startedAt, task.completedAt)}
        </span>
        <span>${task.cost.toFixed(4)}</span>
      </div>
      {task.instruction && (
        <p className="text-xs text-muted-foreground truncate">{task.instruction}</p>
      )}
    </div>
  );
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-0 z-10 m-1 h-7 w-7"
        title={collapsed ? 'Show task board' : 'Hide task board'}
      >
        {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
      </Button>

      {!collapsed && (
        <div className="flex h-full w-[350px] flex-col border-l bg-card">
          <div className="flex h-12 items-center border-b px-4">
            <span className="text-sm font-semibold">Live Tasks</span>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {tasks.length}
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-3">
              {tasks.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Tasks will appear here as agents are delegated.
                </p>
              )}
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
