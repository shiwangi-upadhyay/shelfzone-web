'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrgAgentOverview } from '@/hooks/use-agent-stats';
import { useTraces } from '@/hooks/use-traces';
import { ViewToggle } from './view-toggle';
import { AgentBadge } from './agent-badge';
import { AgentDetailPanel } from './agent-detail-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Users, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Agent emoji map
const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️',
  BackendForge: '⚙️',
  DataArchitect: '🗄️',
  ShieldOps: '🛡️',
  PortalEngine: '🖥️',
  UIcraft: '🎨',
  TestRunner: '🧪',
  DocSmith: '📝',
};

function getAgentEmoji(name: string): string {
  return AGENT_EMOJI[name] || '🤖';
}

function mapStatus(status: string): 'active' | 'idle' | 'offline' {
  if (status === 'ACTIVE') return 'active';
  if (status === 'INACTIVE' || status === 'PAUSED') return 'idle';
  return 'offline';
}

// API response types
interface OrgAgent {
  id: string;
  name: string;
  status: string;
  totalCost: number;
  sessionCount: number;
}

interface OrgEmployee {
  employeeId: string;
  name: string;
  managerId: string | null;
  department: { id: string; name: string };
  agents: OrgAgent[];
  totalCost: number;
  activeAgents: number;
  teamCost: number;
  teamActiveAgents: number;
}

export function AgentMap() {
  const [viewMode, setViewMode] = useState<'org' | 'agent'>('agent');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const router = useRouter();

  const { data: orgData, isLoading: orgLoading } = useOrgAgentOverview();
  const { data: tracesData, isLoading: tracesLoading } = useTraces({ limit: 10 });

  // Cast orgData to our type
  const employees: OrgEmployee[] = Array.isArray(orgData) ? orgData : [];

  // Build tree from flat list
  const buildTree = (employees: OrgEmployee[]) => {
    const map = new Map<string, OrgEmployee & { children: OrgEmployee[] }>();
    const roots: (OrgEmployee & { children: OrgEmployee[] })[] = [];

    employees.forEach((emp) => {
      map.set(emp.employeeId, { ...emp, children: [] });
    });

    employees.forEach((emp) => {
      const node = map.get(emp.employeeId)!;
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(employees);

  const handleAgentClick = (agent: OrgAgent, employeeName: string) => {
    setSelectedAgentId(agent.id);
    setSelectedAgent({
      id: agent.id,
      name: agent.name,
      emoji: getAgentEmoji(agent.name),
      status: mapStatus(agent.status),
      costToday: Number(agent.totalCost),
      ownerName: employeeName,
    });
  };

  const renderEmployeeNode = (
    employee: OrgEmployee & { children: OrgEmployee[] },
    level: number = 0,
  ) => {
    const showAgents = viewMode === 'agent';
    const hasAgents = employee.agents && employee.agents.length > 0;

    return (
      <div key={employee.employeeId} className="relative">
        <Card className="p-4 mb-3 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{employee.name}</h3>
                {hasAgents && (
                  <Badge variant="outline" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    {employee.agents.length} agent{employee.agents.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {employee.department.name}
              </p>
              {viewMode === 'agent' && hasAgents && (
                <p className="text-xs font-medium text-primary mt-1">
                  Total: ${Number(employee.totalCost).toFixed(2)} · {employee.activeAgents} active
                </p>
              )}
            </div>
          </div>

          {/* Agent Badges — shown in Agent View */}
          {showAgents && hasAgents && (
            <div className="mt-3 flex flex-wrap gap-2">
              {employee.agents.map((agent) => (
                <AgentBadge
                  key={agent.id}
                  name={agent.name}
                  emoji={getAgentEmoji(agent.name)}
                  status={mapStatus(agent.status)}
                  cost={Number(agent.totalCost)}
                  onClick={() => handleAgentClick(agent, employee.name)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Child employees */}
        {employee.children && employee.children.length > 0 && (
          <div className="ml-8 border-l-2 border-muted pl-4">
            {employee.children.map((child: any) => renderEmployeeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Trace</h1>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'org' ? 'Organization hierarchy' : 'Agents across your organization'}
          </p>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Org Tree */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          {viewMode === 'org' ? (
            <Users className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Bot className="h-5 w-5 text-muted-foreground" />
          )}
          <h2 className="text-lg font-semibold">
            {viewMode === 'org' ? 'Organization Tree' : 'Agent Overview'}
          </h2>
        </div>

        {orgLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : tree.length > 0 ? (
          <div className="space-y-1">
            {tree.map((root) => renderEmployeeNode(root))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No organization data available</p>
          </Card>
        )}
      </div>

      {/* Recent Traces */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Traces</h2>
        {tracesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : tracesData && tracesData.length > 0 ? (
          <div className="space-y-3">
            {tracesData.map((trace: any) => (
              <Card key={trace.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-2 line-clamp-2">
                      📋 {trace.instruction}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <Badge
                        variant={
                          trace.status === 'completed'
                            ? 'default'
                            : trace.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {trace.status === 'completed' ? '✅' : trace.status === 'running' ? '🔄' : '❌'} {trace.status}
                      </Badge>
                      {trace.startedAt && trace.completedAt && (
                        <span>
                          ⏱️ {Math.round((new Date(trace.completedAt).getTime() - new Date(trace.startedAt).getTime()) / 60000)}min
                        </span>
                      )}
                      {trace.totalCost !== undefined && (
                        <span>💰 ${Number(trace.totalCost).toFixed(2)}</span>
                      )}
                      {trace.agentsUsed !== undefined && (
                        <span>🤖 {trace.agentsUsed} agents</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/agent-trace/trace/${trace.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No traces yet</p>
          </Card>
        )}
      </div>

      {/* Agent Detail Panel */}
      <AgentDetailPanel
        agentId={selectedAgentId}
        agentName={selectedAgent?.name}
        agentEmoji={selectedAgent?.emoji}
        model={selectedAgent?.model}
        ownerName={selectedAgent?.ownerName}
        status={selectedAgent?.status}
        onClose={() => {
          setSelectedAgentId(null);
          setSelectedAgent(null);
        }}
      />
    </div>
  );
}
