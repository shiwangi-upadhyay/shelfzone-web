'use client';

import { useAgentStats } from '@/hooks/use-agent-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

export function CostTab({ agentId }: { agentId: string | null }) {
  const { data: stats, isLoading } = useAgentStats(agentId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
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
  const errorPct = (Number(stats.errorRate) * 100).toFixed(1);

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Total Cost" value={`$${Number(stats.avgCost * stats.totalSessions).toFixed(2)}`} accent />
        <StatCard label="Total Tokens" value={stats.totalTokens.toLocaleString()} />
        <StatCard label="Sessions" value={String(stats.totalSessions)} />
        <StatCard
          label="Error Rate"
          value={`${errorPct}%`}
          warn={Number(errorPct) > 5}
        />
      </div>

      {/* Chart */}
      {last7.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Cost — Last 7 Days
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v}`}
                width={40}
              />
              <Tooltip
                formatter={(v: number | undefined) => [`$${Number(v ?? 0).toFixed(4)}`, 'Cost']}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        'text-lg font-semibold font-mono tabular-nums',
        warn && 'text-red-600 dark:text-red-400',
        accent && 'text-foreground',
      )}>
        {value}
      </p>
    </div>
  );
}
