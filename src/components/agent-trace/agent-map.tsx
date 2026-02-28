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
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeNode {
  id: string;
  name: string;
  title: string;
  department: string;
  reports: EmployeeNode[];
  agents?: Array<{
    id: string;
    name: string;
    emoji: string;
    status: 'active' | 'idle' | 'offline';
    costToday: number;
    model?: string;
  }>;
}

export function AgentMap() {
  const [viewMode, setViewMode] = useState<'org' | 'agent'>('org');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const router = useRouter();

  const { data: orgData, isLoading: orgLoading } = useOrgAgentOverview();
  const { data: tracesData, isLoading: tracesLoading } = useTraces({ limit: 10 });

  const handleAgentClick = (agent: any) => {
    setSelectedAgentId(agent.id);
    setSelectedAgent(agent);
  };

  const renderEmployeeNode = (employee: EmployeeNode, level: number = 0) => {
    const showAgents = viewMode === 'agent' && employee.agents && employee.agents.length > 0;

    return (
      <div key={employee.id} className="relative">
        <Card className="p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{employee.name}</h3>
              <p className="text-xs text-muted-foreground">{employee.title}</p>
              <p className="text-xs text-muted-foreground">{employee.department}</p>
            </div>
          </div>

          {/* Agent Badges */}
          {showAgents && (
            <div className="mt-3 flex flex-wrap gap-2">
              {employee.agents!.map((agent) => (
                <AgentBadge
                  key={agent.id}
                  name={agent.name}
                  emoji={agent.emoji}
                  status={agent.status}
                  cost={agent.costToday}
                  onClick={() => handleAgentClick(agent)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Reports */}
        {employee.reports && employee.reports.length > 0 && (
          <div className="ml-8 border-l-2 border-muted pl-4">
            {employee.reports.map((report) => renderEmployeeNode(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agent Trace</h1>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Org Tree */}
      <div>
        {orgLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : orgData ? (
          renderEmployeeNode(orgData)
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No organization data available</p>
          </Card>
        )}
      </div>

      {/* Recent Traces */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Traces</h2>
        {tracesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : tracesData && tracesData.length > 0 ? (
          <div className="space-y-3">
            {tracesData.map((trace: any) => (
              <Card key={trace.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-2 line-clamp-2">
                      {trace.instruction}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        <span>{trace.duration}s</span>
                      )}
                      {trace.totalCost !== undefined && (
                        <span>${trace.totalCost.toFixed(4)}</span>
                      )}
                      {trace.agentCount !== undefined && (
                        <span>{trace.agentCount} agents</span>
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
