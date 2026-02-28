import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface TraceFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

export function TraceFilters({ onFilterChange }: TraceFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFilterChange({ status: status === 'all' ? undefined : status });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ search });
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search traces..."
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select defaultValue="all" onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
