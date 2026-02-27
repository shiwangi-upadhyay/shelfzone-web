'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormInput, FormSelect, FormDatePicker } from '@/components/forms';
import { Employee } from '@/hooks/use-employees';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().min(1, 'Designation is required'),
  managerId: z.string().optional(),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  dateOfBirth: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  loading?: boolean;
}

export function EmployeeForm({ employee, onSubmit, loading }: EmployeeFormProps) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      departmentId: employee.departmentId,
      designationId: employee.designationId,
      managerId: employee.managerId,
      dateOfJoining: employee.dateOfJoining,
      dateOfBirth: employee.dateOfBirth,
      status: employee.status,
      role: employee.role,
    } : undefined,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="First Name"
              {...form.register('firstName')}
              error={form.formState.errors.firstName?.message}
              required
            />
            <FormInput
              label="Last Name"
              {...form.register('lastName')}
              error={form.formState.errors.lastName?.message}
              required
            />
          </div>
          
          <FormInput
            label="Email"
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            required
          />
          
          <FormInput
            label="Phone"
            {...form.register('phone')}
            error={form.formState.errors.phone?.message}
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Department"
              {...form.register('departmentId')}
              error={form.formState.errors.departmentId?.message}
              options={[]}
              placeholder="Select department"
              required
            />
            <FormSelect
              label="Designation"
              {...form.register('designationId')}
              error={form.formState.errors.designationId?.message}
              options={[]}
              placeholder="Select designation"
              required
            />
          </div>

          <FormSelect
            label="Manager"
            {...form.register('managerId')}
            options={[]}
            placeholder="Select manager (optional)"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormDatePicker
              label="Date of Joining"
              value={form.watch('dateOfJoining')}
              onChange={(date) => form.setValue('dateOfJoining', date || '')}
              required
            />
            <FormDatePicker
              label="Date of Birth"
              value={form.watch('dateOfBirth')}
              onChange={(date) => form.setValue('dateOfBirth', date || '')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Status"
              {...form.register('status')}
              error={form.formState.errors.status?.message}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'terminated', label: 'Terminated' },
              ]}
              required
            />
            <FormSelect
              label="Role"
              {...form.register('role')}
              error={form.formState.errors.role?.message}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'HR_ADMIN', label: 'HR Admin' },
                { value: 'SUPER_ADMIN', label: 'Super Admin' },
              ]}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
