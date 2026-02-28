'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrgAgentOverview, type OrgEmployee } from '@/hooks/use-agent-stats';
import { useTraces } from '@/hooks/use-traces';
import { ViewToggle } from './view-toggle';
import { TraceFilters } from './trace-filters';
import { AgentBadge, StatusDot } from './agent-badge';
import { AgentTree } from './agent-tree';
import { AgentDetailPanel } from './agent-detail-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function AgentMap() {
  const router = useRouter();
  const [view, setView] = useState<'org' | 'agent'>('org');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{ name: string; id: string | null; sessionId: string | null; status?: string }>({
    name: '', id: null, sessionId: null,
  });

  const { data: employees, isLoading: empLoading, error: empError } = useOrgAgentOverview();
  const { data: traces, isLoading: tracesLoading, error: tracesError } = useTraces({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    limit: 10,
  });

  const openPanel = (name: string, id: string | null, sessionId: string | null, status?: string) => {
    setSelectedAgent({ name, id, sessionId, status });
    setPanelOpen(true);
  };

  // Group employees by department
  const departments = new Map<string, OrgEmployee[]>();
  (employees || []).forEach(emp => {
    const dept = emp.department?.name || 'Unassigned';
    if (!departments.has(dept)) departments.set(dept, []);
    departments.get(dept)!.push(emp);
  });

  // Build manager→reports tree
  const buildTree = (emps: OrgEmployee[], parentId: string | null = null, depth = 0): React.ReactNode[] => {
    return emps
      .filter(e => e.managerId === parentId)
      .map(emp => (
        <div key={emp.employeeId} className={depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''}>
          <div className="py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{emp.name}</span>
              <span className="text-xs text-muted-foreground">${Number(emp.totalCost).toFixed(2)} total</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {emp.agents.map(agent => (
                <AgentBadge
                  key={agent.id}
                  name={agent.name}
                  status={agent.status}
                  cost={agent.totalCost}
                  onClick={() => openPanel(agent.name, agent.id, null, agent.status)}
                />
              ))}
              {emp.agents.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No agents</span>
              )}
            </div>
          </div>
          {buildTree(emps, emp.employeeId, depth + 1)}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <ViewToggle view={view} onChange={setView} />
        <TraceFilters
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {/* Content */}
      {empLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : view === 'org' ? (
        /* ORG VIEW */
        <div className="space-y-4">
          {[...departments.entries()].map(([dept, emps]) => (
            <div key={dept} className="rounded-xl border border-border bg-card shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/50 rounded-t-xl">
                <h3 className="font-semibold text-sm">🏢 {dept}</h3>
              </div>
              <div className="p-4">
                {buildTree(emps)}
              </div>
            </div>
          ))}
          {departments.size === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-3xl block mb-2">👥</span>
              <p className="text-sm">No employees found</p>
              <p className="text-xs mt-2 text-red-400">
                DEBUG: empLoading={String(empLoading)}, empError={empError?.message || 'none'}, employees={employees ? `array(${employees.length})` : String(employees)}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* AGENT VIEW */
        <div className="space-y-4">
          {(employees || [])
            .filter(emp => emp.agents.length > 0)
            .map(emp => (
              <div key={emp.employeeId} className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👤</span>
                    <span className="font-semibold text-sm">{emp.name}</span>
                    <span className="text-xs text-muted-foreground">({emp.department?.name})</span>
                  </div>
                  <span className="text-xs font-medium">Total: ${Number(emp.totalCost).toFixed(2)}</span>
                </div>
                <div className="p-4">
                  <AgentTree
                    agents={emp.agents.map(a => ({ id: a.id, name: a.name, status: a.status, totalCost: a.totalCost }))}
                    onAgentClick={(agent) => openPanel(agent.name, agent.id, null, agent.status)}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Recent Traces */}
      <div>
        <h3 className="font-semibold text-sm mb-3">📋 Recent Traces</h3>
        {tracesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !traces?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-2xl block mb-1">📋</span>
            <p className="text-sm">No traces found</p>
              <p className="text-xs mt-2 text-red-400">
                DEBUG: tracesLoading={String(tracesLoading)}, tracesError={tracesError?.message || 'none'}, traces={traces ? `array(${traces.length})` : String(traces)}
              </p>
          </div>
        ) : (
          <div className="space-y-2">
            {traces.map(trace => {
              const duration = trace.completedAt
                ? Math.round((new Date(trace.completedAt).getTime() - new Date(trace.startedAt).getTime()) / 1000)
                : null;
              const statusIcon = trace.status === 'completed' ? '✅' : trace.status === 'running' ? '🔄' : '❌';
              return (
                <div
                  key={trace.id}
                  className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{statusIcon}</span>
                      <p className="text-sm font-medium truncate">{trace.instruction}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>🤖 {trace.masterAgent?.name}</span>
                      {duration !== null && <span>⏱ {Math.floor(duration / 60)}m{duration % 60}s</span>}
                      <span>💰 ${Number(trace.totalCost).toFixed(2)}</span>
                      <span>👥 {trace.agentsUsed} agents</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/agent-trace/trace/${trace.id}`)}
                    className="ml-3 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    View →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <AgentDetailPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        agentName={selectedAgent.name}
        agentId={selectedAgent.id}
        sessionId={selectedAgent.sessionId}
        status={selectedAgent.status}
      />
    </div>
  );
}
