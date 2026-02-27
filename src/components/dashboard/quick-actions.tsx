'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, UserPlus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/use-dashboard';

export function QuickActions() {
  const { data } = useDashboard();
  const isCheckedIn = data?.attendance.status === 'checked_in';

  const actions = [
    {
      label: isCheckedIn ? 'Clock Out' : 'Clock In',
      icon: Clock,
      href: '/attendance',
      variant: isCheckedIn ? 'outline' : 'default',
    },
    {
      label: 'Apply Leave',
      icon: Calendar,
      href: '/leave/apply',
      variant: 'outline',
    },
    {
      label: 'View Payslip',
      icon: FileText,
      href: '/payroll',
      variant: 'outline',
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant as 'default' | 'outline'}
              className="w-full justify-start"
              asChild
            >
              <Link href={action.href}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
