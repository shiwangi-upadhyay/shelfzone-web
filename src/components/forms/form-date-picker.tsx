'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormField } from './form-field';

export interface FormDatePickerProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const FormDatePicker = forwardRef<HTMLButtonElement, FormDatePickerProps>(
  (
    {
      label,
      error,
      description,
      required,
      placeholder = 'Pick a date',
      value,
      onChange,
      disabled,
      className,
      minDate,
      maxDate,
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormField>
    );
  }
);

FormDatePicker.displayName = 'FormDatePicker';
