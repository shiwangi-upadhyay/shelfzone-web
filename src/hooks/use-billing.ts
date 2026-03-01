'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BillingSummary {
  totalCost: number;
  totalTokens: number;
  activeAgents: number;
  costThisMonth: number;
  costLastMonth: number;
  costByDay: Array<{ date: string; cost: number }>;
}

export interface BillingByAgent {
  agentId: string;
  agentName: string;
  model: string;
  totalCost: number;
  totalTokens: number;
  sessionCount: number;
  avgCostPerSession: number;
}

export interface BillingByEmployee {
  employeeId: string;
  name: string;
  department: string;
  totalCost: number;
  agentCount: number;
  topAgent: string;
}

export interface BillingByModel {
  model: string;
  totalCost: number;
  totalTokens: number;
  sessionCount: number;
}

export interface BillingInvoice {
  month: number;
  year: number;
  totalCost: number;
  totalTokens: number;
  agentCount: number;
  status: string;
}

export function useBillingSummary() {
  return useQuery({
    queryKey: ['billing', 'summary'],
    queryFn: () => api.get<BillingSummary>('/api/billing/summary'),
    staleTime: 1000 * 60,
  });
}

export function useBillingByAgent() {
  return useQuery({
    queryKey: ['billing', 'by-agent'],
    queryFn: () => api.get<BillingByAgent[]>('/api/billing/by-agent'),
    staleTime: 1000 * 60,
  });
}

export function useBillingByEmployee() {
  return useQuery({
    queryKey: ['billing', 'by-employee'],
    queryFn: () => api.get<BillingByEmployee[]>('/api/billing/by-employee'),
    staleTime: 1000 * 60,
  });
}

export function useBillingByModel() {
  return useQuery({
    queryKey: ['billing', 'by-model'],
    queryFn: () => api.get<BillingByModel[]>('/api/billing/by-model'),
    staleTime: 1000 * 60,
  });
}

export function useBillingInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.get<BillingInvoice[]>('/api/billing/invoices'),
    staleTime: 1000 * 60,
  });
}
