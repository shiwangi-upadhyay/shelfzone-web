'use client';

import { useState, useMemo, useCallback } from 'react';
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
} from 'recharts';
import {
  useBillingSummary,
  useBillingByAgent,
  useBillingByEmployee,
  useBillingByModel,
  useBillingInvoices,
} from '@/hooks/use-billing';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, Bot, DollarSign, CalendarDays } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number | undefined | null, decimals = 2) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toFixed(decimals);
}

function fmtNum(n: number | undefined | null) {
  if (n == null) return '0';
  return Number(n).toLocaleString();
}

type SortDir = 'asc' | 'desc';

function useSortable<T>(data: T[] | undefined, defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  const toggle = (key: keyof T) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return { sorted, sortKey, sortDir, toggle };
}

// ─── Summary Cards ───────────────────────────────────────
function SummaryCards({ data }: { data: any }) {
  const pctChange = data?.monthOverMonthChange;
  const isUp = pctChange > 0;

  const cards = [
    {
      label: 'Total Spend',
      value: fmt(data?.totalSpend),
      icon: DollarSign,
      sub: 'All time',
    },
    {
      label: 'This Month',
      value: fmt(data?.thisMonth),
      icon: isUp ? TrendingUp : TrendingDown,
      sub: pctChange != null ? `${isUp ? '+' : ''}${pctChange.toFixed(1)}% vs last month` : undefined,
      subColor: isUp ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'Active Agents',
      value: fmtNum(data?.activeAgents),
      icon: Bot,
      sub: 'Currently active',
    },
    {
      label: 'Avg Cost / Agent',
      value: fmt(data?.avgCostPerAgent),
      icon: CalendarDays,
      sub: 'This month',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border bg-card p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono">{c.value}</p>
          {c.sub && (
            <p className={cn('mt-1 text-xs text-muted-foreground', c.subColor)}>
              {c.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────
function DailySpendChart({ data }: { data: any[] | undefined }) {
  const chartData = data || [];
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Daily Spend (Last 30 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(v: any) => [fmt(v), 'Spend']}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="rgb(99 102 241)"
              strokeWidth={2}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CostByAgentChart({ data }: { data: any[] | undefined }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(0, 5);
  }, [data]);

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Cost by Agent (Top 5)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis
              type="category"
              dataKey="agentName"
              tick={{ fontSize: 11 }}
              width={100}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(v: any) => [fmt(v), 'Cost']}
            />
            <Bar dataKey="totalCost" fill="rgb(99 102 241)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Sortable Table Header ───────────────────────────────
function Th({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  mono,
}: {
  label: string;
  sortKey: string;
  currentKey: string;
  dir: SortDir;
  onSort: (k: any) => void;
  mono?: boolean;
}) {
  const active = sortKey === currentKey;
  return (
    <th
      className={cn(
        'cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors',
        mono && 'font-mono'
      )}
      onClick={() => onSort(sortKey)}
    >
      {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );
}

// ─── Tables ──────────────────────────────────────────────
function ByAgentTable({ data }: { data: any[] | undefined }) {
  const { sorted, sortKey, sortDir, toggle } = useSortable(data || [], 'totalCost' as any);
  const hp = { currentKey: sortKey as string, dir: sortDir, onSort: toggle };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <Th label="Agent Name" sortKey="agentName" {...hp} />
            <Th label="Model" sortKey="model" {...hp} />
            <Th label="Sessions" sortKey="sessions" {...hp} mono />
            <Th label="Total Tokens" sortKey="totalTokens" {...hp} mono />
            <Th label="Total Cost" sortKey="totalCost" {...hp} mono />
            <Th label="Avg/Session" sortKey="avgPerSession" {...hp} mono />
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((r: any, i: number) => (
            <tr key={i} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-medium">{r.agentName}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.model}</td>
              <td className="px-4 py-3 font-mono">{fmtNum(r.sessions)}</td>
              <td className="px-4 py-3 font-mono">{fmtNum(r.totalTokens)}</td>
              <td className="px-4 py-3 font-mono">{fmt(r.totalCost)}</td>
              <td className="px-4 py-3 font-mono">{fmt(r.avgPerSession)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ByEmployeeTable({ data }: { data: any[] | undefined }) {
  const { sorted, sortKey, sortDir, toggle } = useSortable(data || [], 'totalCost' as any);
  const hp = { currentKey: sortKey as string, dir: sortDir, onSort: toggle };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <Th label="Employee" sortKey="employeeName" {...hp} />
            <Th label="Department" sortKey="department" {...hp} />
            <Th label="Agents" sortKey="agents" {...hp} mono />
            <Th label="Total Cost" sortKey="totalCost" {...hp} mono />
            <Th label="Top Agent" sortKey="topAgent" {...hp} />
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((r: any, i: number) => (
            <tr key={i} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-medium">{r.employeeName}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.department}</td>
              <td className="px-4 py-3 font-mono">{fmtNum(r.agents)}</td>
              <td className="px-4 py-3 font-mono">{fmt(r.totalCost)}</td>
              <td className="px-4 py-3">{r.topAgent}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ByModelTable({ data }: { data: any[] | undefined }) {
  const { sorted, sortKey, sortDir, toggle } = useSortable(data || [], 'totalCost' as any);
  const hp = { currentKey: sortKey as string, dir: sortDir, onSort: toggle };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <Th label="Model" sortKey="model" {...hp} />
            <Th label="Sessions" sortKey="sessions" {...hp} mono />
            <Th label="Total Tokens" sortKey="totalTokens" {...hp} mono />
            <Th label="Total Cost" sortKey="totalCost" {...hp} mono />
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((r: any, i: number) => (
            <tr key={i} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-medium">{r.model}</td>
              <td className="px-4 py-3 font-mono">{fmtNum(r.sessions)}</td>
              <td className="px-4 py-3 font-mono">{fmtNum(r.totalTokens)}</td>
              <td className="px-4 py-3 font-mono">{fmt(r.totalCost)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Invoices ────────────────────────────────────────────
function InvoicesSection({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        No invoices yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((inv: any, i: number) => (
        <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div>
            <p className="font-medium">{inv.month}/{inv.year}</p>
            <p className="mt-1 font-mono text-lg">{fmt(inv.totalCost)}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              inv.status === 'Paid' || inv.status === 'paid'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
            )}
          >
            {inv.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Export ──────────────────────────────────────────────
function ExportSection() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('shelfzone-auth') || '{}')?.state?.accessToken
        : null;

      const res = await fetch(`${API_URL}/api/billing/export?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-export-${from || 'all'}-${to || 'now'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        placeholder="From"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        placeholder="To"
      />
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
type Tab = 'agent' | 'employee' | 'model';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('agent');

  const { data: summary, isLoading: summaryLoading } = useBillingSummary();
  const { data: byAgent } = useBillingByAgent();
  const { data: byEmployee } = useBillingByEmployee();
  const { data: byModel } = useBillingByModel();
  const { data: invoices } = useBillingInvoices();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'agent', label: 'By Agent' },
    { key: 'employee', label: 'By Employee' },
    { key: 'model', label: 'By Model' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Monitor costs, usage, and invoices across your agents.
          </p>
        </div>
        <ExportSection />
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
      ) : (
        <SummaryCards data={summary} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailySpendChart data={summary?.dailySpend} />
        <CostByAgentChart data={byAgent} />
      </div>

      {/* Tables with Tabs */}
      <div className="rounded-xl border bg-card">
        <div className="flex border-b">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-colors',
                activeTab === t.key
                  ? 'border-b-2 border-indigo-500 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-1">
          {activeTab === 'agent' && <ByAgentTable data={byAgent} />}
          {activeTab === 'employee' && <ByEmployeeTable data={byEmployee} />}
          {activeTab === 'model' && <ByModelTable data={byModel} />}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Invoices</h2>
        <InvoicesSection data={invoices} />
      </div>
    </div>
  );
}
