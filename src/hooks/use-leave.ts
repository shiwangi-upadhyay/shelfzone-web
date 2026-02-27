'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  isHalfDay: boolean;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export interface LeaveBalance {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const response = await api.get<any>('/me/leaves');
      return response;
    },
  });
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: ['leave-balance'],
    queryFn: async () => {
      const response = await api.get<LeaveBalance[]>('/leave-admin/balance');
      return response;
    },
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leaveType: string;
      startDate: string;
      endDate: string;
      isHalfDay: boolean;
      reason: string;
    }) => {
      const response = await api.post<any>('/leave/apply', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit leave request');
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put<any>(`/leave/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      toast.success('Leave request cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel leave request');
    },
  });
}

export function useReviewLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status: 'approved' | 'rejected';
      reviewComments?: string;
    }) => {
      const { id, ...body } = data;
      const response = await api.put<any>(`/leave/${id}/review`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast.success('Leave request reviewed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to review leave request');
    },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await api.get<any>('/leave?status=pending');
      return response;
    },
  });
}
