'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SalaryComponent } from '@/hooks/use-payroll';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SalaryBreakdownProps {
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  netSalary: number;
}

export function SalaryBreakdown({
  earnings,
  deductions,
  grossSalary,
  netSalary,
}: SalaryBreakdownProps) {
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Earnings</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <CardDescription>Income components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {earnings.map((earning) => (
            <div key={earning.name} className="flex items-center justify-between">
              <span className="text-sm font-medium">{earning.name}</span>
              <span className="text-sm">₹{earning.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-4 flex items-center justify-between font-bold">
            <span>Total Earnings</span>
            <span className="text-green-600">₹{totalEarnings.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Deductions</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <CardDescription>Statutory and other deductions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deductions.length > 0 ? (
            <>
              {deductions.map((deduction) => (
                <div key={deduction.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{deduction.name}</span>
                  <span className="text-sm">₹{deduction.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex items-center justify-between font-bold">
                <span>Total Deductions</span>
                <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No deductions</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gross Salary</p>
              <p className="text-2xl font-bold">₹{grossSalary.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">
                -₹{totalDeductions.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Net Salary</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{netSalary.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
