'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrgAgentOverview, type OrgEmployee } from '@/hooks/use-agent-stats';
import { useTraces } from '@/hooks/use-traces';
import { ViewToggle } from './view-toggle';
import { TraceFilters } from './trace-filters';
import { AgentBadge, StatusDot } from './agent-badge';
import { AgentTree } from './agent-tree';
import { AgentDetailPanel } from './agent-detail-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AgentMap() {
  const router = useRouter();
  const [view, setView] = useState<'org' | 'agent'>('org');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{
    name: string; id: string | null; sessionId: string | null; status?: string;
  }>({ name: '', id: null, sessionId: null });

  const { data: employees, isLoading: empLoading } = useOrgAgentOverview();
  const { data: traces, isLoading: tracesLoading } = useTraces({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    limit: 10,
  });

  const openPanel = (name: string, id: string | null, sessionId: string | null, status?: string) => {
    setSelectedAgent({ name, id, sessionId, status });
    setPanelOpen(true);
  };

  // Derived data
  const departments = useMemo(() => {
    const map = new Map<string, OrgEmployee[]>();
    (employees || []).forEach(emp => {
      const dept = emp.department?.name || 'Unassigned';
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(emp);
    });
    return map;
  }, [employees]);

  const departmentNames = useMemo(() => [...departments.keys()].sort(), [departments]);

  // Filter employees
  const filteredDepartments = useMemo(() => {
    const result = new Map<string, OrgEmployee[]>();
    departments.forEach((emps, dept) => {
      if (departmentFilter !== 'all' && dept !== departmentFilter) return;
      const filtered = emps.filter(emp => {
        if (!search) return true;
        const q = search.toLowerCase();
        return emp.name.toLowerCase().includes(q) ||
          emp.agents.some(a => a.name.toLowerCase().includes(q));
      });
      if (filtered.length > 0) result.set(dept, filtered);
    });
    return result;
  }, [departments, departmentFilter, search]);

  // Build hierarchy tree
  const buildTree = (emps: OrgEmployee[], parentId: string | null = null, depth = 0): React.ReactNode[] => {
    return emps
      .filter(e => e.managerId === parentId)
      .map(emp => (
        <div key={emp.employeeId} className={cn(depth > 0 && 'ml-6 border-l border-border/40 pl-4')}>
          <div className="py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{emp.name}</span>
              <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                ${Number(emp.totalCost).toFixed(2)}
              </span>
              {emp.activeAgents > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {emp.activeAgents} active
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
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
                <span className="text-[11px] text-muted-foreground/60 italic">No agents assigned</span>
              )}
            </div>
          </div>
          {buildTree(emps, emp.employeeId, depth + 1)}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <ViewToggle view={view} onChange={setView} />
        <TraceFilters
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          departments={departmentNames}
          department={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
        />
      </div>

      {/* Content */}
      {empLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : view === 'org' ? (
        /* ─── ORG VIEW ─── */
        <div className="space-y-3">
          {[...filteredDepartments.entries()].map(([dept, emps]) => (
            <div key={dept} className="rounded-lg border border-border/60 bg-card">
              <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  {dept}
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {emps.length} {emps.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="p-4">
                {buildTree(emps)}
              </div>
            </div>
          ))}
          {filteredDepartments.size === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">No employees match your filters</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── AGENT VIEW ─── */
        <div className="space-y-3">
          {(employees || [])
            .filter(emp => emp.agents.length > 0)
            .filter(emp => {
              if (departmentFilter !== 'all' && emp.department?.name !== departmentFilter) return false;
              if (!search) return true;
              const q = search.toLowerCase();
              return emp.name.toLowerCase().includes(q) ||
                emp.agents.some(a => a.name.toLowerCase().includes(q));
            })
            .map(emp => (
              <div key={emp.employeeId} className="rounded-lg border border-border/60 bg-card">
                <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{emp.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{emp.department?.name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    ${Number(emp.totalCost).toFixed(2)} today
                  </span>
                </div>
                <div className="p-4">
                  <AgentTree
                    agents={emp.agents.map(a => ({
                      id: a.id, name: a.name, status: a.status, totalCost: a.totalCost,
                    }))}
                    onAgentClick={(agent) => openPanel(agent.name, agent.id, null, agent.status)}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ─── RECENT TRACES ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Recent Traces
          </h3>
          {traces && traces.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{traces.length} traces</span>
          )}
        </div>
        {tracesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !traces?.length ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border/60 rounded-lg">
            <p className="text-sm">No traces found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {traces.map(trace => {
              const duration = trace.completedAt
                ? Math.round((new Date(trace.completedAt).getTime() - new Date(trace.startedAt).getTime()) / 1000)
                : null;
              const statusConfig = trace.status === 'completed'
                ? { icon: '✅', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' }
                : trace.status === 'running'
                ? { icon: '🔄', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' }
                : { icon: '❌', bg: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' };

              return (
                <button
                  key={trace.id}
                  onClick={() => router.push(`/dashboard/agent-trace/trace/${trace.id}`)}
                  className={cn(
                    'w-full text-left rounded-lg border border-border/60 bg-card p-3.5',
                    'hover:bg-muted/30 transition-colors group',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', statusConfig.bg)}>
                          {statusConfig.icon} {trace.status}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {trace.masterAgent?.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate text-foreground">{trace.instruction}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
                      {duration !== null && <span>{Math.floor(duration / 60)}m{duration % 60}s</span>}
                      <span>${Number(trace.totalCost).toFixed(2)}</span>
                      <span>{trace.agentsUsed} agents</span>
                      <span className="text-muted-foreground/40 group-hover:text-foreground transition-colors">→</span>
                    </div>
                  </div>
                </button>
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
