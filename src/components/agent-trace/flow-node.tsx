'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { StatusDot, MODEL_LABELS } from './agent-badge';

interface FlowNodeData {
  emoji: string;
  name: string;
  cost: number;
  duration: string;
  status: string;
  model?: string;
  isOwner?: boolean;
  sessionId?: string;
  agentId?: string;
}

function FlowAgentNode({ data }: NodeProps<FlowNodeData>) {
  const statusBorder = data.isOwner
    ? 'border-indigo-400/40 dark:border-indigo-500/30'
    : data.status === 'completed'
    ? 'border-emerald-400/40 dark:border-emerald-500/30'
    : data.status === 'running'
    ? 'border-blue-400/40 dark:border-blue-500/30'
    : data.status === 'failed'
    ? 'border-red-400/40 dark:border-red-500/30'
    : 'border-border/60';

  const modelLabel = data.model ? MODEL_LABELS[data.model] || data.model : null;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card shadow-sm px-4 py-3 min-w-[180px]',
        'hover:shadow-md transition-shadow cursor-pointer',
        statusBorder,
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2 !border-0" />

      <div className="flex items-center gap-2.5">
        <span className="text-lg">{data.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{data.name}</span>
            {!data.isOwner && <StatusDot status={data.status} />}
          </div>
          {!data.isOwner && (
            <div className="flex items-center gap-2 mt-0.5">
              {modelLabel && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded font-mono">
                  {modelLabel}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                ${Number(data.cost).toFixed(2)}
              </span>
              {data.duration && (
                <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  {data.duration}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-border !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(FlowAgentNode);
