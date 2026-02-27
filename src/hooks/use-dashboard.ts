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

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardData>('/me/dashboard');
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications', {
        params: { limit: 10 },
      });
      return response.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      return response.data;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
