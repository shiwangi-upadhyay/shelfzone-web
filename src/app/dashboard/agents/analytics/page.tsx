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
import {
  BarChart3,
  Bot,
  Zap,
  DollarSign,
  Activity,
  Loader2,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface PlatformAnalytics {
  totalAgents: number;
  activeAgents: number;
  totalSessions: number;
  totalCost: number;
  totalTokens: number;
  avgLatencyMs: number;
  errorRate: number;
  topAgents: Array<{
    id: string;
    name: string;
    sessions: number;
    cost: number;
    avgLatency: number;
  }>;
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-analytics'],
    queryFn: () => api.get<PlatformAnalytics>('/api/agent-portal/analytics/platform'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const analytics = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Analytics</h1>
        <p className="text-muted-foreground">Platform-wide performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              Total Agents
            </div>
            <p className="text-3xl font-bold mt-1">{analytics?.totalAgents || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.activeAgents || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              Total Sessions
            </div>
            <p className="text-3xl font-bold mt-1">{(analytics?.totalSessions || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Cost
            </div>
            <p className="text-3xl font-bold mt-1">${(analytics?.totalCost || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Avg Latency
            </div>
            <p className="text-3xl font-bold mt-1">{(analytics?.avgLatencyMs || 0).toFixed(0)}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Total Tokens
            </div>
            <p className="text-2xl font-bold mt-1">{(analytics?.totalTokens || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Error Rate
            </div>
            <p className="text-2xl font-bold mt-1">{((analytics?.errorRate || 0) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Avg Cost/Session
            </div>
            <p className="text-2xl font-bold mt-1">
              ${analytics?.totalSessions ? (analytics.totalCost / analytics.totalSessions).toFixed(4) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performing Agents
          </CardTitle>
          <CardDescription>Ranked by session count</CardDescription>
        </CardHeader>
        <CardContent>
          {!analytics?.topAgents?.length ? (
            <p className="text-center text-muted-foreground py-8">No agent data yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Avg Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topAgents.map((agent, i) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <Badge variant={i < 3 ? 'default' : 'outline'}>{i + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.sessions.toLocaleString()}</TableCell>
                    <TableCell>${agent.cost.toFixed(2)}</TableCell>
                    <TableCell>{agent.avgLatency.toFixed(0)}ms</TableCell>
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
