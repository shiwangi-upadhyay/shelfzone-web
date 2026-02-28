'use client';

import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow';

const TYPE_COLORS: Record<string, string> = {
  instruction: '#6366f1',   // indigo/blue
  completion: '#22c55e',    // green
  error: '#ef4444',         // red
  delegation: '#a855f7',    // purple
  thinking: '#f59e0b',      // amber
};

function FlowDelegationEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, animated } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  const edgeType = data?.type as string || 'instruction';
  const strokeColor = TYPE_COLORS[edgeType] || 'hsl(var(--border))';

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          strokeDasharray: animated ? '5 5' : undefined,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            className="absolute text-[10px] bg-card border border-border/60 rounded px-1.5 py-0.5 text-muted-foreground max-w-[180px] truncate pointer-events-none font-mono"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(FlowDelegationEdge);
