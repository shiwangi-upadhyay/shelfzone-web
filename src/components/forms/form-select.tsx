import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from './form-field';

export interface FormSelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options: FormSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  registration?: Partial<UseFormRegisterReturn>;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  (
    {
      label,
      error,
      description,
      required,
      placeholder = 'Select an option',
      options,
      value,
      onValueChange,
      disabled,
      className,
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
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger ref={ref} aria-invalid={error ? 'true' : 'false'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }
);

FormSelect.displayName = 'FormSelect';
