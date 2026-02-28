'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Loader2, TrendingUp, PieChart } from 'lucide-react';

interface PlatformCosts {
  totalCost: number;
  totalInputCost: number;
  totalOutputCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byAgent: Array<{
    agentId: string;
    agentName: string;
    totalCost: number;
    sessions: number;
  }>;
}

export default function CostsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-costs'],
    queryFn: () => api.get<any>('/api/agent-portal/costs/platform'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const costs = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Analysis</h1>
        <p className="text-muted-foreground">Detailed cost breakdown across all agents</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Cost
            </div>
            <p className="text-3xl font-bold mt-1">${(costs?.totalCost || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Input Cost
            </div>
            <p className="text-3xl font-bold mt-1">${(costs?.totalInputCost || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(costs?.totalInputTokens || 0).toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PieChart className="h-4 w-4" />
              Output Cost
            </div>
            <p className="text-3xl font-bold mt-1">${(costs?.totalOutputCost || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(costs?.totalOutputTokens || 0).toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Agent Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost by Agent
          </CardTitle>
          <CardDescription>Breakdown of spending per agent</CardDescription>
        </CardHeader>
        <CardContent>
          {!costs?.byAgent?.length ? (
            <p className="text-center text-muted-foreground py-8">No cost data yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Avg Cost/Session</TableHead>
                  <TableHead>Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.byAgent
                  .sort((a: any, b: any) => b.totalCost - a.totalCost)
                  .map((agent: any) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell>{agent.sessions.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">${agent.totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        ${agent.sessions > 0 ? (agent.totalCost / agent.sessions).toFixed(4) : '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {costs.totalCost > 0
                            ? ((agent.totalCost / costs.totalCost) * 100).toFixed(1)
                            : '0'}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
