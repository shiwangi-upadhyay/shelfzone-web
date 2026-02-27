'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplyLeave, useLeaveBalance } from '@/hooks/use-leave';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput, FormSelect, FormTextarea } from '@/components/forms';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const applyLeaveSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isHalfDay: z.boolean(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>;

export default function ApplyLeavePage() {
  const router = useRouter();
  const { mutate: applyLeave, isPending } = useApplyLeave();
  const { data: balanceData } = useLeaveBalance();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const form = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      isHalfDay: false,
    },
  });

  const selectedLeaveType = form.watch('leaveType');
  const selectedBalance = balanceData?.find((b) => b.leaveType === selectedLeaveType);

  const handleSubmit = (data: ApplyLeaveFormData) => {
    applyLeave(data, {
      onSuccess: () => {
        router.push('/leave');
      },
    });
  };

  const leaveTypeOptions = balanceData?.map((balance) => ({
    value: balance.leaveType,
    label: `${balance.leaveType.replace('_', ' ')} (${balance.remainingDays} days left)`,
  })) || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
          <p className="text-muted-foreground">
            Submit a new leave request
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/leave">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Application</CardTitle>
          <CardDescription>Fill in the details for your leave request</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormSelect
              label="Leave Type"
              {...form.register('leaveType')}
              error={form.formState.errors.leaveType?.message}
              options={leaveTypeOptions}
              placeholder="Select leave type"
              required
            />

            {selectedBalance && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Available Balance</p>
                <p className="text-2xl font-bold">
                  {selectedBalance.remainingDays} days
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedBalance.usedDays} used of {selectedBalance.totalDays} total
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        form.setValue('startDate', date?.toISOString() || '');
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date <span className="text-destructive">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        form.setValue('endDate', date?.toISOString() || '');
                      }}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.endDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="halfDay"
                checked={form.watch('isHalfDay')}
                onCheckedChange={(checked) => 
                  form.setValue('isHalfDay', checked as boolean)
                }
              />
              <label
                htmlFor="halfDay"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Half Day Leave
              </label>
            </div>

            <FormTextarea
              label="Reason"
              {...form.register('reason')}
              error={form.formState.errors.reason?.message}
              placeholder="Please provide a reason for your leave..."
              rows={4}
              required
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
