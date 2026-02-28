'use client';

import { useDashboard, useUnreadCount } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Bell,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const { data: unreadData } = useUnreadCount();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to ShelfZone HR Portal
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
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
