'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceRecord } from '@/hooks/use-attendance';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  loading?: boolean;
  month: Date;
}

const statusColors = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  leave: 'bg-blue-500',
  late: 'bg-yellow-500',
  half_day: 'bg-orange-500',
};

export function AttendanceCalendar({ attendanceRecords, loading, month }: AttendanceCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDay = (day: Date) => {
    return attendanceRecords.find((record) =>
      isSameDay(new Date(record.date), day)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{format(month, 'MMMM yyyy')}</CardTitle>
        <CardDescription>Color-coded attendance calendar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          
          {days.map((day) => {
            const attendance = getAttendanceForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`relative p-2 text-center rounded-lg border transition-colors ${
                  isToday ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                } ${
                  attendance ? 'cursor-pointer hover:bg-muted/50' : ''
                }`}
                title={attendance ? `${attendance.status} - ${attendance.workingHours || 0}h` : undefined}
              >
                <div className="text-sm font-medium">
                  {format(day, 'd')}
                </div>
                {attendance && (
                  <div
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                      statusColors[attendance.status]
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
