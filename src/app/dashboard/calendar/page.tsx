'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
import { useHolidays } from '@/hooks/use-holidays';
import { useAttendance } from '@/hooks/use-attendance';
import { useLeaveRequests } from '@/hooks/use-leave';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'team'>('month');

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;

  const { data: holidays } = useHolidays(year);
  const { data: attendanceData } = useAttendance({ month, year });
  const { data: leaveData } = useLeaveRequests();

  const holidayList = holidays || [];
  const attendanceRecords = attendanceData?.data || [];
  const leaveRequests = leaveData?.data || [];

  // Generate calendar days
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));
  const handleToday = () => setSelectedMonth(new Date());

  const isHoliday = (date: Date) => {
    return holidayList.find(h => isSameDay(new Date(h.date), date));
  };

  const hasAttendance = (date: Date) => {
    return attendanceRecords.find(a => isSameDay(new Date(a.date), date));
  };

  const hasLeave = (date: Date) => {
    return leaveRequests.find(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return date >= start && date <= end && l.status === 'APPROVED';
    });
  };

  const getDayColor = (date: Date) => {
    const holiday = isHoliday(date);
    const attendance = hasAttendance(date);
    const leave = hasLeave(date);
    const weekend = isWeekend(date);

    if (holiday) return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    if (leave) return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    if (attendance) return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    if (weekend) return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    return 'bg-white dark:bg-background border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View holidays, attendance, and team availability
          </p>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'team')}>
        <TabsList>
          <TabsTrigger value="month">My Calendar</TabsTrigger>
          <TabsTrigger value="team">Team Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(selectedMonth, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800" />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" />
              <span>Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
              <span>Weekend</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-lg border bg-card">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const holiday = isHoliday(day);
                const attendance = hasAttendance(day);
                const leave = hasLeave(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, selectedMonth);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[100px] p-2 border-b border-r last:border-r-0 cursor-pointer transition-colors hover:bg-accent',
                      getDayColor(day),
                      !isCurrentMonth && 'opacity-40'
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <div className={cn(
                        'text-sm font-medium mb-1',
                        isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {holiday && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium truncate">
                            {holiday.name}
                          </div>
                        )}
                        {leave && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                            On Leave
                          </div>
                        )}
                        {attendance && (
                          <div className="text-xs text-green-600 dark:text-green-400 truncate">
                            {attendance.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2 text-sm">
                {isHoliday(selectedDate) && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                    <span className="font-medium">{isHoliday(selectedDate)!.name}</span>
                    {isHoliday(selectedDate)!.description && (
                      <span className="text-muted-foreground">- {isHoliday(selectedDate)!.description}</span>
                    )}
                  </div>
                )}
                {hasLeave(selectedDate) && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>On Leave - {hasLeave(selectedDate)!.leaveType}</span>
                  </div>
                )}
                {hasAttendance(selectedDate) && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                    <span>Status: {hasAttendance(selectedDate)!.status}</span>
                    {hasAttendance(selectedDate)!.hoursWorked && (
                      <span className="text-muted-foreground">
                        - {hasAttendance(selectedDate)!.hoursWorked.toFixed(2)} hours
                      </span>
                    )}
                  </div>
                )}
                {isWeekend(selectedDate) && !isHoliday(selectedDate) && !hasLeave(selectedDate) && !hasAttendance(selectedDate) && (
                  <div className="text-muted-foreground">Weekend</div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Team calendar view coming soon...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Will show team member availability for scheduling
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
