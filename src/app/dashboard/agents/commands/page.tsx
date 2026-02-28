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
import { Terminal, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Command {
  id: string;
  userId: string;
  command: string;
  classification: string;
  agentsInvoked: unknown;
  outcome: string;
  totalCost: number;
  totalLatencyMs: number;
  createdAt: string;
  user?: { email: string };
}

export default function CommandsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-commands'],
    queryFn: () => api.get<{ commands: Command[] }>('/api/agent-portal/commands'),
  });

  const commands = data?.commands || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Command Audit Log</h1>
        <p className="text-muted-foreground">Track all commands issued to agents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Commands ({commands.length})
          </CardTitle>
          <CardDescription>Full audit trail of agent interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : commands.length === 0 ? (
            <div className="text-center py-12">
              <Terminal className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No commands logged yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.map((cmd) => (
                  <TableRow key={cmd.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(cmd.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">{cmd.command}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cmd.classification}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cmd.outcome === 'success' ? 'default' : 'destructive'}>
                        {cmd.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>${cmd.totalCost.toFixed(4)}</TableCell>
                    <TableCell>{cmd.totalLatencyMs}ms</TableCell>
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
