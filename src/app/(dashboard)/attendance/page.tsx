'use client';

import { useState } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { ClockWidget } from '@/components/attendance/clock-widget';
import { AttendanceCalendar } from '@/components/attendance/attendance-calendar';
import { AttendanceSummary } from '@/components/attendance/attendance-summary';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

export default function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: attendanceData, isLoading } = useAttendance({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  });

  const attendanceRecords = attendanceData?.data || [];

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const isCurrentMonth =
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Track your attendance and working hours
        </p>
      </div>

      <ClockWidget />

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <h2 className="text-lg font-semibold">
          {format(selectedMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <AttendanceSummary attendanceRecords={attendanceRecords} month={selectedMonth} />

      <AttendanceCalendar
        attendanceRecords={attendanceRecords}
        loading={isLoading}
        month={selectedMonth}
      />
    </div>
  );
}
