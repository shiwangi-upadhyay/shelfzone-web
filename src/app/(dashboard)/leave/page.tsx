'use client';

import { useLeaveRequests, useLeaveBalance } from '@/hooks/use-leave';
import { LeaveBalanceCard } from '@/components/leave/leave-balance-card';
import { LeaveRequestTable } from '@/components/leave/leave-request-table';
import { ApprovalInbox } from '@/components/leave/approval-inbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function LeavePage() {
  const { user } = useAuthStore();
  const { data: requestsData, isLoading: requestsLoading } = useLeaveRequests();
  const { data: balanceData, isLoading: balanceLoading } = useLeaveBalance();

  const canApprove = 
    user?.role === 'MANAGER' || 
    user?.role === 'HR_ADMIN' || 
    user?.role === 'SUPER_ADMIN';

  const leaveRequests = requestsData?.data || [];
  const leaveBalances = balanceData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage your leave requests and balances
          </p>
        </div>
        <Button asChild>
          <Link href="/leave/apply">
            <Plus className="mr-2 h-4 w-4" />
            Apply Leave
          </Link>
        </Button>
      </div>

      {!balanceLoading && leaveBalances.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Leave Balance</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {leaveBalances.map((balance: any) => (
              <LeaveBalanceCard key={balance.leaveType} balance={balance} />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="my-leaves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
          {canApprove && <TabsTrigger value="approvals">Approval Inbox</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-leaves">
          <LeaveRequestTable requests={leaveRequests} loading={requestsLoading} />
        </TabsContent>

        {canApprove && (
          <TabsContent value="approvals">
            <ApprovalInbox />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
