'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput, FormSelect, FormDatePicker } from '@/components/forms';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().optional(),
});

const step2Schema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().min(1, 'Designation is required'),
  managerId: z.string().optional(),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']),
});

const step3Schema = z.object({
  aadhaar: z.string().optional(),
  pan: z.string().optional(),
  basicSalary: z.number().min(0, 'Salary must be positive').optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

type FormData = Step1Data & Step2Data & Step3Data;

interface OnboardingWizardProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export function OnboardingWizard({ onSubmit, loading }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData as Step1Data,
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData as Step2Data,
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData as Step3Data,
  });

  const handleStep1Submit = (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: Step3Data) => {
    const finalData = { ...formData, ...data } as FormData;
    onSubmit(finalData);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of 4</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the employee's basic details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="First Name"
                  {...step1Form.register('firstName')}
                  error={step1Form.formState.errors.firstName?.message}
                  required
                />
                <FormInput
                  label="Last Name"
                  {...step1Form.register('lastName')}
                  error={step1Form.formState.errors.lastName?.message}
                  required
                />
              </div>
              <FormInput
                label="Email"
                type="email"
                {...step1Form.register('email')}
                error={step1Form.formState.errors.email?.message}
                required
              />
              <FormInput
                label="Phone"
                {...step1Form.register('phone')}
                error={step1Form.formState.errors.phone?.message}
                required
              />
              <FormDatePicker
                label="Date of Birth"
                value={step1Form.watch('dateOfBirth') ? new Date(step1Form.watch('dateOfBirth')!) : undefined}
                onChange={(date) => step1Form.setValue('dateOfBirth', date?.toISOString() || '')}
              />
              <div className="flex justify-end">
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Assign department, designation, and manager</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
              <FormSelect
                label="Department"
                {...step2Form.register('departmentId')}
                error={step2Form.formState.errors.departmentId?.message}
                options={[]}
                placeholder="Select department"
                required
              />
              <FormSelect
                label="Designation"
                {...step2Form.register('designationId')}
                error={step2Form.formState.errors.designationId?.message}
                options={[]}
                placeholder="Select designation"
                required
              />
              <FormSelect
                label="Manager"
                {...step2Form.register('managerId')}
                options={[]}
                placeholder="Select manager (optional)"
              />
              <FormDatePicker
                label="Date of Joining"
                value={step2Form.watch('dateOfJoining') ? new Date(step2Form.watch('dateOfJoining')!) : undefined}
                onChange={(date) => step2Form.setValue('dateOfJoining', date?.toISOString() || '')}
                required
              />
              <FormSelect
                label="Role"
                {...step2Form.register('role')}
                error={step2Form.formState.errors.role?.message}
                options={[
                  { value: 'EMPLOYEE', label: 'Employee' },
                  { value: 'MANAGER', label: 'Manager' },
                  { value: 'HR_ADMIN', label: 'HR Admin' },
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                ]}
                required
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Sensitive Information</CardTitle>
            <CardDescription>Enter sensitive data (encrypted at rest)</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All sensitive data is encrypted before storage
              </AlertDescription>
            </Alert>
            <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-4">
              <FormInput
                label="Aadhaar Number"
                {...step3Form.register('aadhaar')}
                error={step3Form.formState.errors.aadhaar?.message}
                placeholder="XXXX XXXX XXXX"
              />
              <FormInput
                label="PAN Number"
                {...step3Form.register('pan')}
                error={step3Form.formState.errors.pan?.message}
                placeholder="ABCDE1234F"
              />
              <FormInput
                label="Basic Salary"
                type="number"
                {...step3Form.register('basicSalary', { valueAsNumber: true })}
                error={step3Form.formState.errors.basicSalary?.message}
                placeholder="0.00"
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review the information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Name:</dt>
                <dd>{formData.firstName} {formData.lastName}</dd>
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{formData.email}</dd>
                <dt className="text-muted-foreground">Phone:</dt>
                <dd>{formData.phone}</dd>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Organization Details</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Role:</dt>
                <dd>{formData.role}</dd>
                <dt className="text-muted-foreground">Date of Joining:</dt>
                <dd>{formData.dateOfJoining}</dd>
              </dl>
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => handleStep3Submit(formData as Step3Data)} disabled={loading}>
                <Check className="mr-2 h-4 w-4" />
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
