'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TraceFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  departments?: string[];
  department?: string;
  onDepartmentChange?: (v: string) => void;
}

export function TraceFilters({
  search, onSearchChange, status, onStatusChange,
  departments, department, onDepartmentChange,
}: TraceFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-56 h-8 text-xs bg-background"
      />
      {departments && departments.length > 0 && onDepartmentChange && (
        <Select value={department || 'all'} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
