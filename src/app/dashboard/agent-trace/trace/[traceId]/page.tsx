'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useTrace } from '@/hooks/use-traces';
import { useTraceFlow } from '@/hooks/use-trace-flow';
import { useSessionEvents } from '@/hooks/use-session-events';
import { TaskFlowGraph } from '@/components/agent-trace/task-flow-graph';
import { AgentDetailPanel } from '@/components/agent-trace/agent-detail-panel';
import { LiveIndicator } from '@/components/agent-trace/live-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { Node } from 'reactflow';

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.traceId as string;

  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const { data: trace, isLoading: traceLoading } = useTrace(traceId);
  const { data: flowData, isLoading: flowLoading } = useTraceFlow(traceId);

  const isActive = trace?.status === 'running';

  const handleNodeClick = (node: Node) => {
    if (node.data.type !== 'owner') {
      setSelectedAgent({
        id: node.data.sessionId || node.id,
        name: node.data.agentName,
        emoji: node.data.emoji,
        status: node.data.status,
      });
    }
  };

  if (traceLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Trace not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Extract error events from flow data for "Issues Found" section
  const errorEvents: any[] = [];
  // TODO: Fetch error events from sessions in this trace

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/agent-trace')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold line-clamp-2">{trace.instruction}</h1>
              <LiveIndicator isLive={isActive} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge
                variant={
                  trace.status === 'completed'
                    ? 'default'
                    : trace.status === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {trace.status}
              </Badge>
              {trace.duration !== undefined && (
                <span className="text-muted-foreground">
                  Duration: {trace.duration}s
                </span>
              )}
              {trace.totalCost !== undefined && (
                <span className="text-muted-foreground">
                  Total Cost: ${trace.totalCost.toFixed(4)}
                </span>
              )}
              {trace.agentCount !== undefined && (
                <span className="text-muted-foreground">
                  Agents: {trace.agentCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Flow Graph */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Task Flow</h2>
        <TaskFlowGraph
          nodes={flowData?.nodes || []}
          edges={flowData?.edges || []}
          onNodeClick={handleNodeClick}
          isLoading={flowLoading}
        />
      </Card>

      {/* Issues Found */}
      {errorEvents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Issues Found</h2>
          </div>
          <div className="space-y-3">
            {errorEvents.map((error: any, index: number) => (
              <Card key={index} className="p-4 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">{error.agentName}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {error.error}
                    </p>
                    {error.fix && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Fixed: {error.fix}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {error.timeToFix}s to fix
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Total Duration</p>
            <p className="text-lg font-semibold">
              {trace.duration !== undefined ? `${trace.duration}s` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Total Cost</p>
            <p className="text-lg font-semibold">
              {trace.totalCost !== undefined ? `$${trace.totalCost.toFixed(4)}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Agents Used</p>
            <p className="text-lg font-semibold">
              {trace.agentCount !== undefined ? trace.agentCount : 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Agent Detail Panel */}
      <AgentDetailPanel
        agentId={selectedAgent?.id}
        agentName={selectedAgent?.name}
        agentEmoji={selectedAgent?.emoji}
        status={selectedAgent?.status}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}
