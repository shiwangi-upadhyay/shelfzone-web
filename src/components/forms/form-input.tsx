import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField } from './form-field';

export interface FormInputProps extends Omit<React.ComponentProps<'input'>, 'name'> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  registration?: Partial<UseFormRegisterReturn>;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      description,
      required,
      registration,
      className,
      ...inputProps
    },
    ref
  ) => {
    return (
      <FormField
        label={label}
        error={error}
        description={description}
        required={required}
        className={className}
      >
        <Input
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputProps.id}-error` : undefined}
          {...registration}
          {...inputProps}
        />
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';
