'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useMyAgentShares } from '@/hooks/use-shared-agents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentSharesListProps {
  agentId: string;
}

export function AgentSharesList({ agentId }: AgentSharesListProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useMyAgentShares(agentId);

  const shares = data?.data ?? [];

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/api/agents/${agentId}/share/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-shares', agentId] });
      toast.success('Share revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke share');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Shares
          </CardTitle>
          <CardDescription>Who has access to this agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Current Shares
        </CardTitle>
        <CardDescription>Who has access to this agent</CardDescription>
      </CardHeader>
      <CardContent>
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            This agent is not shared with anyone
          </p>
        ) : (
          <div className="space-y-3">
            {shares.map((share) => {
              const userName = share.sharedWithUser.employee
                ? `${share.sharedWithUser.employee.firstName} ${share.sharedWithUser.employee.lastName}`
                : share.sharedWithUser.email;
              const department = share.sharedWithUser.employee?.department?.name || '';

              return (
                <div
                  key={share.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{userName}</p>
                      <Badge variant={share.permission === 'control' ? 'default' : 'secondary'}>
                        {share.permission}
                      </Badge>
                      <Badge variant="outline">{share.mode}</Badge>
                    </div>
                    {department && (
                      <p className="text-sm text-muted-foreground mt-1">{department}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Shared {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true })}</span>
                      {share.costLimit && (
                        <span>
                          Budget: ${Number(share.costUsed).toFixed(4)} / ${Number(share.costLimit).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeMutation.mutate(share.sharedWithUserId)}
                    disabled={revokeMutation.isPending}
                  >
                    {revokeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
