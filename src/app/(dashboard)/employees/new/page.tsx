'use client';

import { useCreateEmployee } from '@/hooks/use-employees';
import { OnboardingWizard } from '@/components/employees/onboarding-wizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewEmployeePage() {
  const router = useRouter();
  const { mutate: createEmployee, isPending } = useCreateEmployee();

  const handleSubmit = (data: any) => {
    createEmployee(data, {
      onSuccess: () => {
        router.push('/employees');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
          <p className="text-muted-foreground">
            Onboard a new employee to the system
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <OnboardingWizard onSubmit={handleSubmit} loading={isPending} />
    </div>
  );
}
