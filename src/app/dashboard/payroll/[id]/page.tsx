'use client';

import { usePayslip } from '@/hooks/use-payroll';
import { SalaryBreakdown } from '@/components/payroll/salary-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayslipDetailPage({ params }: { params: { id: string } }) {
  const { data: payslip, isLoading } = usePayslip(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Payslip not found</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/dashboard/payroll">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/payroll">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                Payslip for {monthNames[payslip.month - 1]} {payslip.year}
              </CardTitle>
              <CardDescription>
                Generated on {format(new Date(payslip.generatedAt), 'MMMM dd, yyyy')}
              </CardDescription>
            </div>
            <Badge
              variant={
                payslip.status === 'paid'
                  ? 'default'
                  : payslip.status === 'processed'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {payslip.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {payslip.paidAt && (
            <p className="text-sm text-muted-foreground">
              Paid on {format(new Date(payslip.paidAt), 'MMMM dd, yyyy')}
            </p>
          )}
        </CardContent>
      </Card>

      <SalaryBreakdown
        earnings={payslip.earnings}
        deductions={payslip.deductions}
        grossSalary={payslip.grossSalary}
        netSalary={payslip.netSalary}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Basic Salary:</span>
            <span className="font-medium">₹{payslip.basicSalary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Earnings:</span>
            <span className="font-medium text-green-600">
              ₹{payslip.grossSalary.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Deductions:</span>
            <span className="font-medium text-red-600">
              -₹{payslip.totalDeductions.toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Net Salary:</span>
            <span className="text-green-600">₹{payslip.netSalary.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
