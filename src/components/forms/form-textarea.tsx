import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { FormField } from './form-field';

export interface FormTextareaProps extends Omit<TextareaProps, 'name'> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  registration?: Partial<UseFormRegisterReturn>;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      description,
      required,
      registration,
      className,
      ...textareaProps
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
        <Textarea
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaProps.id}-error` : undefined}
          {...registration}
          {...textareaProps}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
