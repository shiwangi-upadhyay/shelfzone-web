'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DialogFooter,
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
import { FileText, Plus, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AgentRequest {
  id: string;
  agentName: string;
  purpose: string;
  suggestedModel: string;
  estimatedMonthlyBudget: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    department?: { name: string } | null;
  };
}

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    variant: 'secondary' as const, 
    icon: Clock,
    color: 'text-yellow-600'
  },
  APPROVED: { 
    label: 'Approved', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  REJECTED: { 
    label: 'Rejected', 
    variant: 'destructive' as const, 
    icon: XCircle,
    color: 'text-red-600'
  },
};

export default function AgentRequestsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
  const [open, setOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Form state
  const [agentName, setAgentName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [suggestedModel, setSuggestedModel] = useState('claude-sonnet-4-5');
  const [estimatedBudget, setEstimatedBudget] = useState('100');
  const [reason, setReason] = useState('');

  // Fetch requests
  const { data, isLoading } = useQuery({
    queryKey: ['agent-requests'],
    queryFn: () => api.get<{ data: AgentRequest[] }>('/api/agent-requests'),
  });

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: (body: {
      agentName: string;
      purpose: string;
      suggestedModel: string;
      estimatedMonthlyBudget: number;
      reason: string;
    }) => api.post('/api/agent-requests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-requests'] });
      toast.success('Agent request submitted successfully');
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/agent-requests/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-requests'] });
      toast.success('Request approved and agent created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/api/agent-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-requests'] });
      toast.success('Request rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequestId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setOpen(false);
    setAgentName('');
    setPurpose('');
    setSuggestedModel('claude-sonnet-4-5');
    setEstimatedBudget('100');
    setReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(estimatedBudget);
    if (isNaN(budget) || budget <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    createMutation.mutate({
      agentName,
      purpose,
      suggestedModel,
      estimatedMonthlyBudget: budget,
      reason,
    });
  };

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this request? This will create a new agent.')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    setSelectedRequestId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedRequestId || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: selectedRequestId, reason: rejectionReason });
  };

  const requests = data?.data || [];
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const myRequests = isSuperAdmin ? requests : requests.filter((r) => r.requestedBy.id === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Requests</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Review and approve agent requests' : 'Request new AI agents for your work'}
          </p>
        </div>
        {!isSuperAdmin && (
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request New Agent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name *</Label>
                  <Input
                    id="agentName"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g., DataAnalysisBot"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="What will this agent do?"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Suggested Model *</Label>
                    <Select value={suggestedModel} onValueChange={setSuggestedModel}>
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5</SelectItem>
                        <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
                        <SelectItem value="claude-haiku-4-5">Claude Haiku 4.5</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Est. Monthly Budget ($) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Business Justification *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why do you need this agent?"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Super Admin View: Pending Requests */}
      {isSuperAdmin && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending Approval ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Review and approve or reject agent requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {request.requestedBy.firstName || request.requestedBy.lastName
                            ? `${request.requestedBy.firstName || ''} ${request.requestedBy.lastName || ''}`.trim()
                            : request.requestedBy.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{request.requestedBy.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.requestedBy.department?.name || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-medium">{request.agentName}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.purpose}>
                        {request.purpose}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{request.suggestedModel}</TableCell>
                    <TableCell>${request.estimatedMonthlyBudget.toFixed(2)}/mo</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Requests (Employee: My Requests, Admin: All) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isSuperAdmin ? 'All Requests' : 'My Requests'} ({myRequests.length})
          </CardTitle>
          <CardDescription>
            {isSuperAdmin ? 'Complete history of agent requests' : 'Track the status of your agent requests'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                {isSuperAdmin ? 'No agent requests yet.' : 'You haven\'t submitted any agent requests yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => {
                const StatusIcon = statusConfig[request.status].icon;
                return (
                  <Card key={request.id} className="border-l-4" style={{
                    borderLeftColor: request.status === 'PENDING' ? '#ca8a04' : request.status === 'APPROVED' ? '#16a34a' : '#dc2626'
                  }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{request.agentName}</CardTitle>
                            <Badge variant={statusConfig[request.status].variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[request.status].label}
                            </Badge>
                          </div>
                          {isSuperAdmin && (
                            <p className="text-sm text-muted-foreground">
                              Requested by: {request.requestedBy.firstName || request.requestedBy.lastName
                                ? `${request.requestedBy.firstName || ''} ${request.requestedBy.lastName || ''}`.trim()
                                : request.requestedBy.email}
                              {request.requestedBy.department && ` • ${request.requestedBy.department.name}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Purpose</p>
                          <p>{request.purpose}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-muted-foreground">Model</p>
                            <p className="font-mono text-xs">{request.suggestedModel}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Est. Budget</p>
                            <p>${request.estimatedMonthlyBudget.toFixed(2)}/month</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Business Justification</p>
                          <p>{request.reason}</p>
                        </div>
                        {request.status === 'REJECTED' && request.rejectionReason && (
                          <div className="rounded-md bg-destructive/10 p-3">
                            <p className="font-medium text-destructive">Rejection Reason</p>
                            <p className="text-sm text-destructive/90">{request.rejectionReason}</p>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Submitted: {new Date(request.createdAt).toLocaleString()}</span>
                          {request.updatedAt !== request.createdAt && (
                            <span>Updated: {new Date(request.updatedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Agent Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
