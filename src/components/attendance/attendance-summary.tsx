'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from '@/hooks/use-attendance';
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp } from 'lucide-react';

interface AttendanceSummaryProps {
  attendanceRecords: AttendanceRecord[];
  month: Date;
}

export function AttendanceSummary({ attendanceRecords, month }: AttendanceSummaryProps) {
  const present = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absent = attendanceRecords.filter((r) => r.status === 'absent').length;
  const leave = attendanceRecords.filter((r) => r.status === 'leave').length;
  const late = attendanceRecords.filter((r) => r.status === 'late').length;
  
  const totalWorkingHours = attendanceRecords.reduce(
    (sum, record) => sum + (record.workingHours || 0),
    0
  );
  
  const overtimeHours = attendanceRecords.reduce(
    (sum, record) => sum + (record.overtimeHours || 0),
    0
  );

  const stats = [
    {
      label: 'Present',
      value: present,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Absent',
      value: absent,
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      label: 'On Leave',
      value: leave,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: 'Late',
      value: late,
      icon: Clock,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.label === 'Present' && `${attendanceRecords.length > 0 ? ((present / attendanceRecords.length) * 100).toFixed(0) : 0}% attendance`}
                {stat.label === 'Absent' && 'days'}
                {stat.label === 'On Leave' && 'days'}
                {stat.label === 'Late' && 'occurrences'}
              </p>
            </CardContent>
          </Card>
        );
      })}

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkingHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">
            Total hours this month
          </p>
        </CardContent>
      </Card>

      {overtimeHours > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Extra hours this month
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
