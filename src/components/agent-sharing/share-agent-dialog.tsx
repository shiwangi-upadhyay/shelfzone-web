'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  employee: {
    firstName: string;
    lastName: string;
    department: {
      name: string;
    } | null;
  } | null;
}

interface ShareAgentDialogProps {
  agentId: string;
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareAgentDialog({
  agentId,
  agentName,
  open,
  onOpenChange,
}: ShareAgentDialogProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permission, setPermission] = useState<'control' | 'view'>('view');
  const [mode, setMode] = useState<'route' | 'collaborate' | 'transfer'>('route');
  const [costLimit, setCostLimit] = useState<string>('');

  // Fetch users (employees)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-for-sharing'],
    queryFn: () => api.get<{ data: User[] }>('/api/agents/users'),
    enabled: open,
  });

  const users = usersData?.data ?? [];

  const shareMutation = useMutation({
    mutationFn: (data: {
      sharedWithUserId: string;
      permission: string;
      mode: string;
      costLimit?: number;
    }) => api.post(`/api/agents/${agentId}/share`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-shares', agentId] });
      queryClient.invalidateQueries({ queryKey: ['shared-agents'] });
      toast.success(`Successfully shared ${agentName}`);
      onOpenChange(false);
      // Reset form
      setSelectedUserId('');
      setPermission('view');
      setMode('route');
      setCostLimit('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to share agent');
    },
  });

  const handleShare = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    shareMutation.mutate({
      sharedWithUserId: selectedUserId,
      permission,
      mode,
      costLimit: costLimit ? parseFloat(costLimit) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share {agentName}
          </DialogTitle>
          <DialogDescription>
            Grant access to this agent to another team member. They can send commands and costs will be tracked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Share with</Label>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => {
                    const name = user.employee
                      ? `${user.employee.firstName} ${user.employee.lastName}`
                      : user.email;
                    const dept = user.employee?.department?.name || '';
                    
                    return (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>{name}</span>
                          {dept && (
                            <span className="text-xs text-muted-foreground">{dept}</span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Permission */}
          <div className="space-y-2">
            <Label htmlFor="permission">Permission</Label>
            <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
              <SelectTrigger id="permission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">View Only</span>
                    <span className="text-xs text-muted-foreground">
                      Can see conversations but not send messages
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="control">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Control</span>
                    <span className="text-xs text-muted-foreground">
                      Can send commands and interact with the agent
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label htmlFor="mode">Sharing Mode</Label>
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="route">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Route to Expert</span>
                    <span className="text-xs text-muted-foreground">
                      They control the agent, costs on your account
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="collaborate">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Collaborate</span>
                    <span className="text-xs text-muted-foreground">
                      Both work together in same conversation
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Temporary Transfer</span>
                    <span className="text-xs text-muted-foreground">
                      Full control until they release it back
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Limit */}
          <div className="space-y-2">
            <Label htmlFor="costLimit">Cost Limit (optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                id="costLimit"
                type="number"
                step="0.01"
                min="0"
                placeholder="5.00"
                value={costLimit}
                onChange={(e) => setCostLimit(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-revoke when this amount is reached
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={!selectedUserId || shareMutation.isPending}
          >
            {shareMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Share Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
