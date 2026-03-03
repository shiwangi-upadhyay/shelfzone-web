'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye, DollarSign, X, Loader2, Users, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SharedSession {
  id: string;
  agentId: string;
  sharedWithUserId: string;
  permission: 'control' | 'view';
  mode: 'route' | 'collaborate' | 'transfer';
  status: 'active' | 'revoked' | 'expired';
  costLimit: number | null;
  costUsed: number;
  expiresAt: string | null;
  createdAt: string;
  sharedWithUser: {
    id: string;
    email: string;
    employee: {
      firstName: string;
      lastName: string;
      department: {
        name: string;
      } | null;
    } | null;
  };
  agent: {
    id: string;
    name: string;
  };
}

interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  cost: number | null;
}

interface SharedSessionViewerProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharedSessionViewer({
  agentId,
  open,
  onOpenChange,
}: SharedSessionViewerProps) {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch active shares for this agent
  const { data: sharesData, isLoading: sharesLoading } = useQuery({
    queryKey: ['agent-shares', agentId],
    queryFn: () => api.get<{ data: SharedSession[] }>(`/api/agents/${agentId}/shares`),
    enabled: open,
    refetchInterval: autoRefresh ? 5000 : false, // Poll every 5 seconds when autoRefresh is on
  });

  const shares = sharesData?.data?.filter(share => share.status === 'active') ?? [];
  const selectedShare = shares.find(s => s.id === selectedSessionId);

  // Fetch conversation for selected shared user
  const { data: conversationData, isLoading: conversationLoading } = useQuery({
    queryKey: ['shared-conversation', agentId, selectedShare?.sharedWithUserId],
    queryFn: async () => {
      if (!selectedShare) return null;
      
      // Fetch conversations for this user+agent
      const res = await api.get<{ data: Conversation }>(`/api/command-center/conversations`, {
        params: {
          agentId: agentId,
          userId: selectedShare.sharedWithUserId,
        }
      });
      return res.data;
    },
    enabled: !!selectedShare && autoRefresh,
    refetchInterval: autoRefresh ? 5000 : false, // Poll every 5 seconds
  });

  const conversation = conversationData?.data;

  // Auto-select first active share
  useEffect(() => {
    if (shares.length > 0 && !selectedSessionId) {
      setSelectedSessionId(shares[0].id);
    }
  }, [shares, selectedSessionId]);

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/api/agents/${agentId}/share/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-shares', agentId] });
      toast.success('Access revoked successfully');
      setSelectedSessionId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke access');
    },
  });

  const handleEndSession = () => {
    if (selectedShare) {
      revokeMutation.mutate(selectedShare.sharedWithUserId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Shared Sessions
          </DialogTitle>
          <DialogDescription>
            View real-time activity of users accessing your shared agent
          </DialogDescription>
        </DialogHeader>

        {sharesLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : shares.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No active shared sessions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your agent to see live activity here
            </p>
          </div>
        ) : (
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Left Panel - Active Sessions List */}
            <div className="w-64 border-r pr-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Active Sessions ({shares.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="h-7 px-2"
                >
                  <Activity className={cn(
                    "h-3 w-3",
                    autoRefresh && "animate-pulse text-green-500"
                  )} />
                </Button>
              </div>
              <ScrollArea className="h-[calc(80vh-180px)]">
                <div className="space-y-2">
                  {shares.map((share) => {
                    const userName = share.sharedWithUser.employee
                      ? `${share.sharedWithUser.employee.firstName} ${share.sharedWithUser.employee.lastName}`
                      : share.sharedWithUser.email;
                    const isSelected = selectedSessionId === share.id;

                    return (
                      <button
                        key={share.id}
                        onClick={() => setSelectedSessionId(share.id)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {share.sharedWithUser.employee?.department?.name || 'No department'}
                            </p>
                          </div>
                          <Badge
                            variant={share.permission === 'control' ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {share.permission}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Cost: ${Number(share.costUsed).toFixed(4)}</span>
                            {share.costLimit && (
                              <span className="text-xs">
                                / ${Number(share.costLimit).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Conversation View */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedShare ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div>
                      <h3 className="font-semibold">
                        {selectedShare.sharedWithUser.employee
                          ? `${selectedShare.sharedWithUser.employee.firstName} ${selectedShare.sharedWithUser.employee.lastName}`
                          : selectedShare.sharedWithUser.email}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Using {selectedShare.agent.name} • {selectedShare.mode} mode
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-3 w-3" />
                          {Number(selectedShare.costUsed).toFixed(4)}
                        </div>
                        {selectedShare.costLimit && (
                          <p className="text-xs text-muted-foreground">
                            of ${Number(selectedShare.costLimit).toFixed(2)} limit
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleEndSession}
                        disabled={revokeMutation.isPending}
                      >
                        {revokeMutation.isPending ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <X className="mr-2 h-3 w-3" />
                        )}
                        End Session
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 pr-4">
                    {conversationLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !conversation || !conversation.messages || conversation.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            No conversation yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Waiting for user to send messages...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              'p-3 rounded-lg',
                              message.role === 'user'
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-muted'
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                                {message.role === 'user' ? 'User' : 'Assistant'}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {message.cost && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {Number(message.cost).toFixed(6)}
                                  </span>
                                )}
                                <span>
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a session to view activity
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
