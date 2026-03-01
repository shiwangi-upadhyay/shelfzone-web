'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield, Download, X, Calendar as CalendarIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any> | null;
  timestamp: string;
  user: {
    id: string;
    email: string;
  };
}

interface AuditLogResponse {
  data: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-green-600 dark:text-green-400',
  UPDATE: 'text-blue-600 dark:text-blue-400',
  DELETE: 'text-red-600 dark:text-red-400',
  DEACTIVATE: 'text-red-600 dark:text-red-400',
  ARCHIVE: 'text-red-600 dark:text-red-400',
  AGENT_API_KEY_CREATED: 'text-amber-600 dark:text-amber-400',
  AGENT_API_KEY_REVOKED: 'text-amber-600 dark:text-amber-400',
  AGENT_API_KEY_ROTATED: 'text-amber-600 dark:text-amber-400',
};

const ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'DEACTIVATE',
  'ARCHIVE',
  'AGENT_API_KEY_CREATED',
  'AGENT_API_KEY_REVOKED',
  'AGENT_API_KEY_ROTATED',
  'LOGIN',
  'LOGOUT',
];

const RESOURCES = [
  'AgentRegistry',
  'User',
  'AgentApiKey',
  'auth',
  'Department',
  'Employee',
  'Leave',
  'Payroll',
];

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [search, setSearch] = useState('');

  // Build query params
  const buildParams = () => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (actionFilter) params.append('action', actionFilter);
    if (resourceFilter) params.append('resource', resourceFilter);
    if (userFilter) params.append('userId', userFilter);
    if (dateFrom) params.append('from', dateFrom.toISOString());
    if (dateTo) params.append('to', dateTo.toISOString());
    return params.toString();
  };

  const { data, isLoading, error } = useQuery<AuditLogResponse>({
    queryKey: ['audit-log', page, actionFilter, resourceFilter, userFilter, dateFrom, dateTo],
    queryFn: () => api.get(`/api/agent-portal/audit?${buildParams()}`),
  });

  const clearFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setUserFilter('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearch('');
    setPage(1);
  };

  const exportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Timestamp', 'User Email', 'Action', 'Resource', 'Resource ID', 'Details'];
    const rows = filteredData.map((entry) => [
      format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      entry.user.email,
      entry.action,
      entry.resource,
      entry.resourceId || '',
      entry.details ? JSON.stringify(entry.details) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  // Client-side search filtering
  const filteredData =
    data?.data?.filter((entry) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        entry.user.email.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        entry.resource.toLowerCase().includes(searchLower) ||
        entry.resourceId?.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.details).toLowerCase().includes(searchLower)
      );
    }) || [];

  const hasActiveFilters =
    actionFilter || resourceFilter || userFilter || dateFrom || dateTo || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All resources</SelectItem>
                  {RESOURCES.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Bar */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search in visible results..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Entries
            {data?.pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredData.length} of {data.pagination.total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-destructive/30" />
              <p className="mt-4 text-sm text-destructive">
                Failed to load audit log
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No audit entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Timestamp</TableHead>
                    <TableHead className="min-w-[200px]">User Email</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="min-w-[300px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">{entry.user.email}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-semibold',
                            ACTION_COLORS[entry.action] || 'text-foreground'
                          )}
                        >
                          {entry.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {entry.resource}
                        {entry.resourceId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            #{entry.resourceId.slice(0, 8)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.details ? (
                          <pre className="max-w-md overflow-x-auto text-xs text-muted-foreground">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
