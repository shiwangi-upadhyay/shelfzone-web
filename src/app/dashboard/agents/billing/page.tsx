'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, TrendingUp, Activity, Calendar, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AgentSpend {
  agentId: string;
  agentName: string;
  totalCost: number;
  totalTokens: number;
  sessionCount: number;
}

interface DailySpend {
  date: string;
  totalCost: number;
  agents: AgentSpend[];
}

interface BillingOverview {
  totalAllTime: number;
  totalThisMonth: number;
  totalThisWeek: number;
  totalToday: number;
  agentBreakdown: AgentSpend[];
  dailyBreakdown: DailySpend[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trendLabel && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
              <span className="text-sm text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function AgentSpendTable({ agents }: { agents: AgentSpend[] }) {
  const totalCost = agents.reduce((sum, agent) => sum + agent.totalCost, 0);

  return (
    <div className="space-y-2">
      {agents.map((agent, index) => {
        const percentage = totalCost > 0 ? (agent.totalCost / totalCost) * 100 : 0;
        const color = COLORS[index % COLORS.length];

        return (
          <div
            key={agent.agentId}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-1 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{agent.agentName}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{agent.totalTokens.toLocaleString()} tokens</span>
                <span>•</span>
                <span>{agent.sessionCount} sessions</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold">${agent.totalCost.toFixed(4)}</p>
              <Badge variant="outline" className="mt-1">
                {percentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentBillingPage() {
  const { data, isLoading, error } = useQuery<{ data: BillingOverview }>({
    queryKey: ['billing-overview'],
    queryFn: () => api.get('/api/command-center/billing/overview'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const overview = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Billing</h1>
            <p className="text-muted-foreground mt-1">Cost analysis and usage metrics</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Failed to load billing data</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const dailyChartData = overview.dailyBreakdown.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: parseFloat(day.totalCost.toFixed(4)),
  }));

  const agentPieData = overview.agentBreakdown.map((agent) => ({
    name: agent.agentName,
    value: parseFloat(agent.totalCost.toFixed(4)),
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Billing</h1>
          <p className="text-muted-foreground mt-1">Cost analysis and usage metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total All Time"
          value={`$${overview.totalAllTime.toFixed(4)}`}
          icon={DollarSign}
        />
        <StatCard
          title="This Month"
          value={`$${overview.totalThisMonth.toFixed(4)}`}
          icon={Calendar}
        />
        <StatCard
          title="This Week"
          value={`$${overview.totalThisWeek.toFixed(4)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Today"
          value={`$${overview.totalToday.toFixed(4)}`}
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Trend (30 Days)</h3>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Cost']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Agent Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Distribution</h3>
          {agentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                >
                  {agentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Cost']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Agent Breakdown Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Per-Agent Breakdown</h3>
            <p className="text-sm text-muted-foreground mt-1">All-time spend by agent</p>
          </div>
          <Badge variant="outline">
            {overview.agentBreakdown.length} {overview.agentBreakdown.length === 1 ? 'agent' : 'agents'}
          </Badge>
        </div>

        {overview.agentBreakdown.length > 0 ? (
          <AgentSpendTable agents={overview.agentBreakdown} />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Bot className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No agent activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start using agents to see cost breakdown
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
