'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bot, Plus, Loader2, Activity, AlertCircle, Pause, Archive } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  status: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isCritical: boolean;
  lastHealthCheck: string | null;
  lastHealthStatus: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  DRAFT: 'outline',
  PAUSED: 'destructive',
  ARCHIVED: 'secondary',
};

const statusIcons: Record<string, React.ReactNode> = {
  ACTIVE: <Activity className="h-3 w-3" />,
  PAUSED: <Pause className="h-3 w-3" />,
  ARCHIVED: <Archive className="h-3 w-3" />,
  INACTIVE: <AlertCircle className="h-3 w-3" />,
};

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('CHAT');
  const [model, setModel] = useState('gpt-4');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['agents', statusFilter],
    queryFn: () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      return api.get<{ agents: Agent[] }>(`/api/agent-portal/agents${params}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post('/api/agent-portal/agents', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent created');
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setOpen(false);
    setName('');
    setSlug('');
    setDescription('');
    setType('CHAT');
    setModel('gpt-4');
    setSystemPrompt('');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      slug,
      type,
      model,
      description: description || undefined,
      systemPrompt: systemPrompt || undefined,
    });
  };

  const agents = (data?.agents || []).filter((a) =>
    search ? a.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">Manage your AI agent workforce</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Agent</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHAT">Chat</SelectItem>
                      <SelectItem value="WORKFLOW">Workflow</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="INTEGRATION">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Agent
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agents ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No agents found. Create your first agent.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <Link href={`/dashboard/agents/${agent.id}`} className="hover:underline">
                        <div>
                          <span className="font-medium">{agent.name}</span>
                          <p className="text-xs text-muted-foreground">{agent.slug}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{agent.model}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[agent.status] as any} className="gap-1">
                        {statusIcons[agent.status]}
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {agent.lastHealthStatus ? (
                        <Badge variant={agent.lastHealthStatus === 'healthy' ? 'default' : 'destructive'}>
                          {agent.lastHealthStatus}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.isCritical && <Badge variant="destructive">Critical</Badge>}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(agent.createdAt).toLocaleDateString()}
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
