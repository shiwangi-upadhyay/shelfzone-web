import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Payslip } from '@/hooks/use-payroll';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import Link from 'next/link';

interface PayslipCardProps {
  payslip: Payslip;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PayslipCard({ payslip }: PayslipCardProps) {
  return (
    <Link href={`/payroll/${payslip.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">
                {monthNames[payslip.month - 1]} {payslip.year}
              </h3>
              <p className="text-xs text-muted-foreground">
                Generated {format(new Date(payslip.generatedAt), 'MMM dd, yyyy')}
              </p>
            </div>
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
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <p className="text-2xl font-bold">₹{payslip.netSalary.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Gross</p>
              <p className="text-sm font-medium">₹{payslip.grossSalary.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
