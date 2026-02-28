'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrace } from '@/hooks/use-traces';
import { useTraceSessions } from '@/hooks/use-trace-sessions';
import { TaskFlowGraph } from '@/components/agent-trace/task-flow-graph';
import { TraceTimeline } from '@/components/agent-trace/trace-timeline';
import { AgentDetailPanel } from '@/components/agent-trace/agent-detail-panel';
import { LiveIndicator } from '@/components/agent-trace/live-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'Running…';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m${s}s`;
}

function getAllSessionIds(sessions: { id: string; children: { id: string; children: unknown[] }[] }[]): string[] {
  const ids: string[] = [];
  const walk = (list: { id: string; children: unknown[] }[]) => {
    for (const s of list) {
      ids.push(s.id);
      if (Array.isArray(s.children)) walk(s.children as { id: string; children: unknown[] }[]);
    }
  };
  walk(sessions);
  return ids;
}

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.traceId as string;

  const { data: trace, isLoading: traceLoading } = useTrace(traceId);
  const { data: sessions } = useTraceSessions(traceId);

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{
    name: string; id: string | null; sessionId: string | null;
  }>({ name: '', id: null, sessionId: null });

  const allSessionIds = useMemo(() => getAllSessionIds(sessions || []), [sessions]);

  const handleNodeClick = (sessionId: string, agentName: string, agentId: string) => {
    setSelectedAgent({ name: agentName, id: agentId, sessionId });
    setPanelOpen(true);
  };

  if (traceLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="p-6 text-center text-muted-foreground py-20">
        <p className="text-sm">Trace not found</p>
      </div>
    );
  }

  const statusConfig = trace.status === 'completed'
    ? { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' }
    : trace.status === 'running'
    ? { label: 'Running', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' }
    : { label: 'Failed', bg: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' };

  const timestamp = new Date(trace.startedAt).toLocaleString();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/agent-trace')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 inline-flex items-center gap-1"
        >
          ← Back to traces
        </button>

        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium', statusConfig.bg)}>
                  {statusConfig.label}
                </span>
                {trace.status === 'running' && <LiveIndicator />}
              </div>
              <h1 className="text-base font-semibold leading-snug">{trace.instruction}</h1>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">{timestamp}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/30">
            <StatItem label="Duration" value={formatDuration(trace.startedAt, trace.completedAt)} />
            <StatItem label="Total Cost" value={`$${Number(trace.totalCost).toFixed(2)}`} />
            <StatItem label="Agents" value={String(trace.agentsUsed)} />
            <StatItem label="Tokens" value={trace.totalTokens.toLocaleString()} />
          </div>
        </div>
      </div>

      {/* Flow Graph */}
      <section>
        <SectionHeader>Agent Flow</SectionHeader>
        <TaskFlowGraph traceId={traceId} onNodeClick={handleNodeClick} />
      </section>

      {/* Timeline */}
      <section>
        <SectionHeader>Event Timeline</SectionHeader>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <TraceTimeline traceId={traceId} sessionIds={allSessionIds} />
        </div>
      </section>

      {/* Detail Panel */}
      <AgentDetailPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        agentName={selectedAgent.name}
        agentId={selectedAgent.id}
        sessionId={selectedAgent.sessionId}
      />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold font-mono tabular-nums">{value}</p>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
      {children}
    </h2>
  );
}
