'use client';

import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Holiday } from '@/hooks/use-holidays';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
}

interface TeamCalendarProps {
  selectedMonth: Date;
  holidays: Holiday[];
}

export function TeamCalendar({ selectedMonth, holidays }: TeamCalendarProps) {
  // Fetch team members (employees)
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/api/employees');
      return response.data;
    },
  });

  // Fetch attendance for all team members
  const { data: attendanceData } = useQuery({
    queryKey: ['team-attendance', selectedMonth],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/api/attendance', {
        params: {
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
        },
      });
      return response.data;
    },
  });

  // Fetch leave requests for all team members
  const { data: leaveData } = useQuery({
    queryKey: ['team-leaves'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/api/leave');
      return response.data;
    },
  });

  const employees = employeesData || [];
  const attendance = attendanceData || [];
  const leaves = leaveData || [];

  // Get current week dates
  const weekStart = startOfWeek(selectedMonth);
  const weekEnd = endOfWeek(selectedMonth);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isHoliday = (date: Date) => {
    return holidays.find(h => isSameDay(new Date(h.date), date));
  };

  const getEmployeeAttendance = (employeeId: string, date: Date) => {
    return attendance.find(a => 
      a.employeeId === employeeId && 
      isSameDay(new Date(a.date), date)
    );
  };

  const getEmployeeLeave = (employeeId: string, date: Date) => {
    return leaves.find(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return l.employee?.id === employeeId && 
             date >= start && 
             date <= end && 
             l.status === 'APPROVED';
    });
  };

  const getCellColor = (employeeId: string, date: Date) => {
    const holiday = isHoliday(date);
    const att = getEmployeeAttendance(employeeId, date);
    const leave = getEmployeeLeave(employeeId, date);
    const weekend = isWeekend(date);

    if (holiday) return 'bg-red-50 dark:bg-red-950/20';
    if (leave) return 'bg-blue-100 dark:bg-blue-950/30';
    if (att) return 'bg-green-100 dark:bg-green-950/30';
    if (weekend) return 'bg-gray-100 dark:bg-gray-900';
    return 'bg-white dark:bg-background';
  };

  const getAvailabilityStatus = (employeeId: string, date: Date) => {
    const holiday = isHoliday(date);
    const att = getEmployeeAttendance(employeeId, date);
    const leave = getEmployeeLeave(employeeId, date);
    const weekend = isWeekend(date);

    if (holiday) return { icon: '🔴', text: 'Holiday' };
    if (leave) return { icon: '🔵', text: 'On Leave' };
    if (att && att.status === 'PRESENT') return { icon: '🟢', text: 'Available' };
    if (weekend) return { icon: '⚪', text: 'Weekend' };
    return { icon: '⚫', text: 'Unknown' };
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No team members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing availability for week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/30" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/30" />
          <span>On Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/30" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-900" />
          <span>Weekend</span>
        </div>
      </div>

      {/* Team Grid */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold border-r min-w-[180px]">
                  Team Member
                </th>
                {weekDays.map(day => (
                  <th 
                    key={day.toISOString()} 
                    className="px-3 py-3 text-center text-xs font-medium border-r last:border-r-0 min-w-[80px]"
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-muted-foreground">{format(day, 'MMM d')}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {employees.slice(0, 10).map((emp: any) => (
                <tr key={emp.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 border-r">
                    <div className="font-medium text-sm">
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {emp.designation?.title || 'N/A'}
                    </div>
                  </td>
                  {weekDays.map(day => {
                    const status = getAvailabilityStatus(emp.id, day);
                    return (
                      <td 
                        key={day.toISOString()}
                        className={cn(
                          'px-2 py-3 text-center border-r last:border-r-0',
                          getCellColor(emp.id, day)
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{status.icon}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {status.text}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {employees.length > 10 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing first 10 team members
        </div>
      )}
    </div>
  );
}
