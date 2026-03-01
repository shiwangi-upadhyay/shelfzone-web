'use client';

import { useDashboard, useUnreadCount } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { CardGridSkeleton } from '@/components/ui/card-grid-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Bell
} from 'lucide-react';

export default function DashboardPage() {
  const { data: dashboard, isLoading, error, refetch } = useDashboard();
  const { data: unreadData } = useUnreadCount();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to ShelfZone HR Portal
          </p>
        </div>
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState title="Failed to load dashboard" message="Unable to load dashboard data. Please try again." onRetry={refetch} />;
  }

  const attendanceValue = 
    dashboard?.attendance.status === 'checked_in' 
      ? 'Checked In' 
      : dashboard?.attendance.status === 'checked_out'
      ? 'Checked Out'
      : 'Absent';

  const attendanceDescription = 
    dashboard?.attendance.status === 'checked_in'
      ? `Since ${dashboard.attendance.checkInTime ? new Date(dashboard.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}`
      : dashboard?.attendance.status === 'checked_out'
      ? `${dashboard.attendance.workingHours || 'N/A'} hours today`
      : 'Not checked in today';

  const leaveBalance = dashboard?.leaves.available 
    ? (Object.values(dashboard.leaves.available) as number[]).reduce((sum, val) => sum + val, 0)
    : 0;

  const payrollStatus = dashboard?.payroll.currentMonth.status || 'pending';
  const payrollAmount = dashboard?.payroll.currentMonth.amount 
    ? `₹${dashboard.payroll.currentMonth.amount.toLocaleString()}`
    : 'Pending';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ShelfZone HR Portal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Attendance"
          value={attendanceValue}
          description={attendanceDescription}
          icon={Clock}
          loading={isLoading}
        />
        
        <StatCard
          title="Pending Leaves"
          value={dashboard?.leaves.pending || 0}
          description={`${leaveBalance} days available`}
          icon={Calendar}
          loading={isLoading}
        />
        
        <StatCard
          title="Current Month Payslip"
          value={payrollAmount}
          description={`Status: ${payrollStatus}`}
          icon={DollarSign}
          loading={isLoading}
        />
        
        <StatCard
          title="Notifications"
          value={unreadData?.count || 0}
          description="Unread notifications"
          icon={Bell}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityFeed />
        
        <div className="col-span-3">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
