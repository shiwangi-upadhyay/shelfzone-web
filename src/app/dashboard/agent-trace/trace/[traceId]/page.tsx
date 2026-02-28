'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrace } from '@/hooks/use-traces';
import { useTraceSessions } from '@/hooks/use-trace-sessions';
import { useSessionEvents } from '@/hooks/use-session-events';
import { TaskFlowGraph } from '@/components/agent-trace/task-flow-graph';
import { AgentDetailPanel } from '@/components/agent-trace/agent-detail-panel';
import { LiveIndicator } from '@/components/agent-trace/live-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️', BackendForge: '⚙️', DataArchitect: '🗄️',
  ShieldOps: '🛡️', PortalEngine: '🖥️', UIcraft: '🎨',
  TestRunner: '🧪', DocSmith: '📝',
};

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'Running...';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m${s}s`;
}

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.traceId as string;

  const { data: trace, isLoading: traceLoading } = useTrace(traceId);
  const { data: sessions } = useTraceSessions(traceId);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{ name: string; id: string | null; sessionId: string | null }>({
    name: '', id: null, sessionId: null,
  });

  // Collect all session IDs to fetch error events
  const allSessionIds = getAllSessionIds(sessions || []);
  // We'll fetch errors from the first session for now (simplification)
  const firstSessionId = allSessionIds[0] || null;
  const { data: allEvents } = useSessionEvents(firstSessionId);
  
  // Collect errors from events
  const errors = (allEvents || []).filter(e => e.type === 'error');
  const fixes = (allEvents || []).filter(e => e.type === 'fix');

  const handleNodeClick = (sessionId: string, agentName: string, agentId: string) => {
    setSelectedAgent({ name: agentName, id: agentId, sessionId });
    setPanelOpen(true);
  };

  if (traceLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Trace not found</p>
      </div>
    );
  }

  const statusBadge = trace.status === 'completed'
    ? { icon: '✅', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    : trace.status === 'running'
    ? { icon: '🔄', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    : { icon: '❌', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/agent-trace')} className="mb-3">
          ← Back
        </Button>
        <div className="rounded-xl border border-border bg-card shadow-sm p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
              {statusBadge.icon} {trace.status}
            </span>
            {trace.status === 'running' && <LiveIndicator />}
            <h2 className="text-lg font-semibold flex-1">{trace.instruction}</h2>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
            <span>⏱ {formatDuration(trace.startedAt, trace.completedAt)}</span>
            <span>💰 ${Number(trace.totalCost).toFixed(2)}</span>
            <span>👥 {trace.agentsUsed} agents</span>
            <span>🔢 {trace.totalTokens.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Flow Graph */}
      <div>
        <h3 className="font-semibold text-sm mb-3">🔀 Agent Flow</h3>
        <TaskFlowGraph traceId={traceId} onNodeClick={handleNodeClick} />
      </div>

      {/* Issues Found */}
      {errors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">⚠️ Issues Found</h3>
          <div className="space-y-2">
            {errors.map(err => {
              const fix = fixes.find(f => f.sessionId === err.sessionId);
              return (
                <div key={err.id} className="rounded-xl border border-red-200 dark:border-red-800 bg-card shadow-sm p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span>❌</span>
                    <span className="font-medium">{err.fromAgent?.name || 'Unknown'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{err.content}</p>
                  {fix && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">✅ Fix: {fix.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <h3 className="font-semibold text-sm mb-3">📊 Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold font-mono">{formatDuration(trace.startedAt, trace.completedAt)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-xl font-bold font-mono">${Number(trace.totalCost).toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Agents Used</p>
            <p className="text-xl font-bold font-mono">{trace.agentsUsed}</p>
          </div>
        </div>
      </div>

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
