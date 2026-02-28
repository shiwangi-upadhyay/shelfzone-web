'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useBillingSummary() {
  return useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ data: any }>('/api/billing/summary');
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useBillingByAgent() {
  return useQuery({
    queryKey: ['billing', 'by-agent'],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/api/billing/by-agent');
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useBillingByEmployee() {
  return useQuery({
    queryKey: ['billing', 'by-employee'],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/api/billing/by-employee');
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useBillingByModel() {
  return useQuery({
    queryKey: ['billing', 'by-model'],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/api/billing/by-model');
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useBillingInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/api/billing/invoices');
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}
