'use client';

import { useAgentStats } from '@/hooks/use-agent-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CostTab({ agentId }: { agentId: string | null }) {
  const { data: stats, isLoading } = useAgentStats(agentId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-4 text-sm text-muted-foreground">No stats available</div>;
  }

  const last7 = (stats.costByDay || []).slice(-7);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Sessions" value={String(stats.totalSessions)} />
        <StatCard label="Avg Cost" value={`$${Number(stats.avgCost).toFixed(2)}`} />
        <StatCard label="Total Tokens" value={stats.totalTokens.toLocaleString()} />
        <StatCard label="Error Rate" value={`${(Number(stats.errorRate) * 100).toFixed(1)}%`} />
      </div>

      {last7.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-semibold mb-3">Cost by Day (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${Number(v).toFixed(4)}`} />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
