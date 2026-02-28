import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors = {
  active: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  completed: 'border-green-500 bg-green-50 dark:bg-green-950/20',
  failed: 'border-red-500 bg-red-50 dark:bg-red-950/20',
};

export const FlowNode = memo(({ data }: NodeProps) => {
  const isOwner = data.type === 'owner';
  const statusClass = data.status ? statusColors[data.status as keyof typeof statusColors] : '';

  return (
    <Card
      className={cn(
        'min-w-[200px] p-4 cursor-pointer hover:shadow-lg transition-shadow',
        isOwner ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : statusClass
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          {data.emoji && <span className="text-2xl">{data.emoji}</span>}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {data.agentName || data.label}
            </p>
            {isOwner && (
              <p className="text-xs text-muted-foreground">Task Owner</p>
            )}
          </div>
        </div>

        {/* Metrics */}
        {!isOwner && (
          <div className="flex items-center gap-3 text-xs">
            {data.cost !== undefined && (
              <div>
                <span className="text-muted-foreground">Cost: </span>
                <span className="font-medium">${Number(data.cost).toFixed(4)}</span>
              </div>
            )}
            {data.duration !== undefined && (
              <div>
                <span className="text-muted-foreground">Time: </span>
                <span className="font-medium">{data.duration}s</span>
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        {data.status && (
          <Badge
            variant={
              data.status === 'completed'
                ? 'default'
                : data.status === 'failed'
                ? 'destructive'
                : 'secondary'
            }
            className="text-xs"
          >
            {data.status}
          </Badge>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

FlowNode.displayName = 'FlowNode';
