'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SalaryComponent {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
  generatedAt: string;
  paidAt?: string;
}

export interface SalaryStructure {
  employeeId: string;
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance?: number;
  otherAllowances?: Record<string, number>;
  pf?: number;
  esi?: number;
  pt?: number;
  tds?: number;
  otherDeductions?: Record<string, number>;
}

export function usePayslips() {
  return useQuery({
    queryKey: ['payslips'],
    queryFn: async () => {
      const response = await api.get('/me/payslips');
      return response.data;
    },
  });
}

export function usePayslip(id: string) {
  return useQuery({
    queryKey: ['payslips', id],
    queryFn: async () => {
      const response = await api.get<Payslip>(`/payroll/payslips/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSalaryStructure(employeeId?: string) {
  return useQuery({
    queryKey: ['salary-structure', employeeId],
    queryFn: async () => {
      const url = employeeId
        ? `/payroll/salary-structure/${employeeId}`
        : '/me/salary-structure';
      const response = await api.get<SalaryStructure>(url);
      return response.data;
    },
    enabled: !!employeeId || true,
  });
}
