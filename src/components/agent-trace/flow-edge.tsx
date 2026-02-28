import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export const FlowEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
          style={{
            stroke: data?.animated ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            strokeWidth: 2,
          }}
        />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="bg-background border rounded px-2 py-1 text-xs font-medium shadow-sm max-w-[150px] truncate"
            >
              {data.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

FlowEdge.displayName = 'FlowEdge';
