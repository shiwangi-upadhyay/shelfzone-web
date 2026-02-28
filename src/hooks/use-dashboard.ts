'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardData {
  attendance: {
    status: 'checked_in' | 'checked_out' | 'absent';
    checkInTime?: string;
    checkOutTime?: string;
    workingHours?: string;
  };
  leaves: {
    pending: number;
    approved: number;
    rejected: number;
    available: Record<string, number>;
  };
  payroll: {
    currentMonth: {
      status: 'pending' | 'processed' | 'paid';
      amount?: number;
    };
  };
  notifications: {
    unread: number;
    recent: Array<{
      id: string;
      type: string;
      message: string;
      createdAt: string;
      read: boolean;
    }>;
  };
}

// Map the actual API response to the DashboardData interface
function mapApiResponse(raw: any): DashboardData {
  const d = raw?.data || raw || {};
  const att = d.todayAttendance;

  return {
    attendance: {
      status: att?.checkOutTime ? 'checked_out' : att?.checkInTime ? 'checked_in' : 'absent',
      checkInTime: att?.checkInTime,
      checkOutTime: att?.checkOutTime,
      workingHours: att?.workingHours,
    },
    leaves: {
      pending: d.pendingLeaveRequests || 0,
      approved: 0,
      rejected: 0,
      available: d.leaveBalance || {},
    },
    payroll: {
      currentMonth: {
        status: d.latestPayslip?.status || 'pending',
        amount: d.latestPayslip?.netPay,
      },
    },
    notifications: {
      unread: 0,
      recent: [],
    },
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<any>('/api/me/dashboard');
      return mapApiResponse(response);
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<any>('/api/notifications?limit=10');
      return response;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<{ count: number }>('/api/notifications/unread-count');
      return response;
    },
    refetchInterval: 1000 * 60,
  });
}
