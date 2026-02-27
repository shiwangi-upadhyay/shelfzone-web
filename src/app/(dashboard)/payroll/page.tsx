'use client';

import { usePayslips } from '@/hooks/use-payroll';
import { PayslipCard } from '@/components/payroll/payslip-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

export default function PayrollPage() {
  const { data, isLoading } = usePayslips();

  const payslips = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          View your payslips and salary information
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : payslips.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No payslips available yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {payslips.map((payslip: any) => (
            <PayslipCard key={payslip.id} payslip={payslip} />
          ))}
        </div>
      )}
    </div>
  );
}
