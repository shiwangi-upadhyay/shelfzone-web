'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bot,
  ArrowLeft,
  Loader2,
  Activity,
  Shield,
  Pause,
  Archive,
  Heart,
  Key,
  Settings,
  DollarSign,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AgentDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  status: string;
  model: string;
  systemPrompt: string | null;
  systemPromptVersion: number;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  capabilities: unknown;
  tools: unknown;
  metadata: unknown;
  isCritical: boolean;
  teamId: string | null;
  lastHealthCheck: string | null;
  lastHealthStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ConfigLog {
  id: string;
  changeType: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string | null;
  createdAt: string;
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => api.get<any>(`/api/agent-portal/agents/${id}/detail`),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['agent-sessions', id],
    queryFn: () => api.get<any>(`/api/agent-portal/sessions?agentId=${id}`),
  });

  const { data: keysData } = useQuery({
    queryKey: ['agent-keys', id],
    queryFn: () => api.get<any>(`/api/agent-portal/agents/${id}/api-keys`),
  });

  const { data: configData } = useQuery({
    queryKey: ['agent-config', id],
    queryFn: () => api.get<any>(`/api/agent-portal/config/${id}/history`),
  });

  const healthCheckMutation = useMutation({
    mutationFn: () => api.post(`/api/agent-portal/agents/${id}/health-check`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      toast.success('Health check completed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api.put(`/api/agent-portal/agents/${id}/deactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      toast.success('Agent deactivated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.put(`/api/agent-portal/agents/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      toast.success('Agent archived');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const agent = agentData?.data as AgentDetail | undefined;
  const sessions = (sessionsData?.data || []) as Session[];
  const apiKeys = (keysData?.data || []) as ApiKey[];
  const configLogs = (configData?.data || []) as ConfigLog[];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Agent not found</p>
        <Link href="/dashboard/agents">
          <Button variant="outline" className="mt-4">Back to Agents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <Badge variant={agent.status === 'ACTIVE' ? 'default' : 'secondary'}>{agent.status}</Badge>
            {agent.isCritical && <Badge variant="destructive">Critical</Badge>}
          </div>
          <p className="text-muted-foreground">{agent.slug} · {agent.type} · {agent.model}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => healthCheckMutation.mutate()}
            disabled={healthCheckMutation.isPending}
          >
            {healthCheckMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
            Health Check
          </Button>
          {agent.status === 'ACTIVE' && (
            <Button variant="outline" size="sm" onClick={() => deactivateMutation.mutate()}>
              <Pause className="mr-2 h-4 w-4" />Deactivate
            </Button>
          )}
          {agent.status !== 'ARCHIVED' && (
            <Button variant="outline" size="sm" onClick={() => archiveMutation.mutate()}>
              <Archive className="mr-2 h-4 w-4" />Archive
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              Temperature
            </div>
            <p className="text-2xl font-bold mt-1">{agent.temperature}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Max Tokens
            </div>
            <p className="text-2xl font-bold mt-1">{agent.maxTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Timeout
            </div>
            <p className="text-2xl font-bold mt-1">{(agent.timeoutMs / 1000).toFixed(0)}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Prompt Version
            </div>
            <p className="text-2xl font-bold mt-1">v{agent.systemPromptVersion}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description & System Prompt */}
      {(agent.description || agent.systemPrompt) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {agent.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">{agent.description}</p>
              </div>
            )}
            {agent.systemPrompt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Prompt</p>
                <pre className="mt-1 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {agent.systemPrompt}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys ({apiKeys.length})</TabsTrigger>
          <TabsTrigger value="config-history">Config History ({configLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Token usage, latency, and cost per session</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sessions recorded yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Output</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.slice(0, 20).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.status === 'success' ? 'default' : 'destructive'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.inputTokens.toLocaleString()}</TableCell>
                        <TableCell>{s.outputTokens.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{s.totalTokens.toLocaleString()}</TableCell>
                        <TableCell>{s.latencyMs}ms</TableCell>
                        <TableCell className="text-right">${s.cost.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No API keys created</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium">{k.name}</TableCell>
                        <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{k.keyPrefix}...</code></TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(Array.isArray(k.scopes) ? k.scopes : []).map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={k.isActive ? 'default' : 'secondary'}>
                            {k.isActive ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {k.lastUsedAt ? formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true }) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config-history">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Changes</CardTitle>
            </CardHeader>
            <CardContent>
              {configLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No configuration changes</p>
              ) : (
                <div className="space-y-3">
                  {configLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{log.changeType}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {log.reason && <p className="text-sm text-muted-foreground">{log.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
