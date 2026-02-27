'use client';

import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '@/hooks/use-employees';
import { EmployeeTable } from '@/components/employees/employee-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [designationFilter, setDesignationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEmployees({
    search,
    departmentId: departmentFilter || undefined,
    designationId: designationFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  const { mutate: deleteEmployee } = useDeleteEmployee();

  const canManageEmployees = 
    user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN';

  const employees = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization's employees
          </p>
        </div>
        {canManageEmployees && (
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <EmployeeTable
        employees={employees}
        loading={isLoading}
        onDelete={canManageEmployees ? deleteEmployee : undefined}
        canEdit={canManageEmployees}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
