'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DollarSign, Plus, Loader2, AlertTriangle, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Budget {
  id: string;
  agentId: string | null;
  teamId: string | null;
  monthlyCapUsd: number;
  currentSpend: number;
  month: number;
  year: number;
  autoPauseEnabled: boolean;
  isPaused: boolean;
  pausedAt: string | null;
  agent?: { name: string } | null;
  team?: { name: string } | null;
}

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [cap, setCap] = useState('100');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const { data, isLoading } = useQuery({
    queryKey: ['agent-budgets'],
    queryFn: () => api.get<any>('/api/agent-portal/budgets'),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post('/api/agent-portal/budgets', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-budgets'] });
      toast.success('Budget created');
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unpauseMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/agent-portal/budgets/${id}/unpause`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-budgets'] });
      toast.success('Budget unpaused');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      agentId: agentId || undefined,
      monthlyCapUsd: parseFloat(cap),
      month: parseInt(month),
      year: parseInt(year),
    });
  };

  const budgets = data?.data || [];

  const getSpendPercent = (b: Budget) =>
    b.monthlyCapUsd > 0 ? Math.min((b.currentSpend / b.monthlyCapUsd) * 100, 100) : 0;

  const getSpendColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-orange-500';
    if (pct >= 60) return 'bg-yellow-500';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Monitor and control agent spending</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Agent ID (optional)</Label>
                <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="Leave empty for platform budget" />
              </div>
              <div className="space-y-2">
                <Label>Monthly Cap (USD)</Label>
                <Input type="number" step="0.01" value={cap} onChange={(e) => setCap(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">No budgets configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget: any) => {
            const pct = getSpendPercent(budget);
            return (
              <Card key={budget.id} className={budget.isPaused ? 'border-red-500/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {budget.agent?.name || budget.team?.name || 'Platform Budget'}
                    </CardTitle>
                    <div className="flex gap-2">
                      {budget.isPaused && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Paused
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {budget.month}/{budget.year}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${budget.currentSpend.toFixed(2)} / ${budget.monthlyCapUsd.toFixed(2)}
                    </span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                  <Progress value={pct} className={getSpendColor(pct)} />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Auto-pause: {budget.autoPauseEnabled ? 'On' : 'Off'}</span>
                    {budget.isPaused && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unpauseMutation.mutate(budget.id)}
                        disabled={unpauseMutation.isPending}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Unpause
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
