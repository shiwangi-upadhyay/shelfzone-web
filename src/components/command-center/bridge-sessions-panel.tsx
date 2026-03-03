'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, DollarSign, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BridgeSession {
  id: string;
  agentId: string;
  instructorId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ERROR' | 'CANCELLED';
  startedAt: string;
  endedAt: string | null;
  tokensUsed: number;
  totalCost: number;
  instructor: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface BridgeSessionsPanelProps {
  agentId: string;
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  const seconds = differenceInSeconds(end, start);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function BridgeSessionsPanel({ agentId }: BridgeSessionsPanelProps) {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['bridge-sessions', agentId],
    queryFn: async () => {
      const res = await api.get<{ data: BridgeSession[] }>(
        `/api/bridge/sessions?agentId=${agentId}`
      );
      return res.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const stopSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      api.post(`/api/bridge/sessions/${sessionId}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bridge-sessions', agentId] });
      toast.success('Execution stopped successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to stop execution');
    },
  });

  const handleStopSession = (sessionId: string) => {
    stopSessionMutation.mutate(sessionId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bridgeSessions = sessions?.data ?? [];

  if (bridgeSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No remote executions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Remote agent executions will appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(80vh-200px)]">
      <div className="space-y-4 p-4">
        {bridgeSessions.map((session) => (
          <Card
            key={session.id}
            className={cn(
              'shadow-sm transition-all',
              session.status === 'ACTIVE' && 'ring-2 ring-green-500/50'
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-base">
                    {session.instructor.fullName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.instructor.email}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(session.startedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Badge
                  variant={
                    session.status === 'ACTIVE'
                      ? 'default'
                      : session.status === 'COMPLETED'
                      ? 'secondary'
                      : session.status === 'ERROR'
                      ? 'destructive'
                      : 'outline'
                  }
                  className={cn(
                    session.status === 'ACTIVE' && 'bg-green-600 animate-pulse'
                  )}
                >
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Cost:
                    </span>
                    <span className="font-mono font-semibold">
                      ${session.totalCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tokens:</span>
                    <span className="font-mono">
                      {session.tokensUsed.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration:
                    </span>
                    <span className="font-mono">
                      {formatDuration(session.startedAt, session.endedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={cn(
                        'text-xs font-semibold uppercase',
                        session.status === 'ACTIVE' && 'text-green-600',
                        session.status === 'COMPLETED' && 'text-blue-600',
                        session.status === 'ERROR' && 'text-red-600'
                      )}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>

              {session.status === 'ACTIVE' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => handleStopSession(session.id)}
                  disabled={stopSessionMutation.isPending}
                >
                  {stopSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    'Stop Execution'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
