'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'leave' | 'late' | 'half_day';
  workingHours?: number;
  overtimeHours?: number;
  remarks?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  leaves: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  overtimeHours: number;
}

export function useAttendance(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: async () => {
      const queryString = params
        ? `?${new URLSearchParams(params as any).toString()}`
        : '';
      const response = await api.get<any>(`/me/attendance${queryString}`);
      return response.data;
    },
  });
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get<any>(`/me/attendance?date=${today}`);
      return response.data?.[0] || null;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/attendance/check-in');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Checked in successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to check in');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/attendance/check-out');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Checked out successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to check out');
    },
  });
}

export function useRegularizeAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: string; remarks: string }) => {
      const response = await api.post<any>('/attendance/regularize', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance regularization request submitted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    },
  });
}
