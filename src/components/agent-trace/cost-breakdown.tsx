import { AgentStats, AgentCostBreakdown } from '@/hooks/use-agent-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CostBreakdownProps {
  stats?: AgentStats;
  breakdown?: AgentCostBreakdown;
  isLoading?: boolean;
}

export function CostBreakdown({ stats, breakdown, isLoading }: CostBreakdownProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!stats || !breakdown) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No cost data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.costToday.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.costThisWeek.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.costThisMonth.toFixed(4)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={breakdown.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} tickFormatter={(value) => `$${value.toFixed(2)}`} />
              <Tooltip 
                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(4)}`, 'Cost']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Bar dataKey="cost" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Sessions</p>
              <p className="text-lg font-semibold">{stats.totalSessions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Cost/Session</p>
              <p className="text-lg font-semibold">${stats.avgCost.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tokens In</p>
              <p className="text-lg font-semibold">{stats.tokensIn.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tokens Out</p>
              <p className="text-lg font-semibold">{stats.tokensOut.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Error Rate</p>
              <p className="text-lg font-semibold">{(stats.errorRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Duration</p>
              <p className="text-lg font-semibold">{stats.avgDuration}s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Expensive Operations */}
      {breakdown.topExpensive && breakdown.topExpensive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Expensive Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.topExpensive.map((op) => (
                <div key={op.id} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{op.type}</p>
                    <p className="text-xs text-muted-foreground truncate">{op.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(op.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${op.cost.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
