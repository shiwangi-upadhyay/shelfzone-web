'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface FlowNodeData {
  emoji: string;
  name: string;
  cost: number;
  duration: string;
  status: string;
  isOwner?: boolean;
}

function FlowAgentNode({ data }: NodeProps<FlowNodeData>) {
  const borderColor = data.isOwner
    ? 'border-purple-500'
    : data.status === 'completed' ? 'border-green-500'
    : data.status === 'running' ? 'border-blue-500'
    : data.status === 'failed' ? 'border-red-500'
    : 'border-border';

  return (
    <div className={`rounded-xl border-2 ${borderColor} bg-card shadow-sm px-4 py-3 min-w-[160px] text-center`}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="text-xl mb-1">{data.emoji}</div>
      <div className="font-semibold text-sm">{data.name}</div>
      {!data.isOwner && (
        <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
          <span>${Number(data.cost).toFixed(2)}</span>
          {data.duration && <span>• {data.duration}</span>}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

export default memo(FlowAgentNode);
