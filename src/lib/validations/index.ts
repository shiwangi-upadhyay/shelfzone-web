import { z } from 'zod';

// Common string validations
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const weakPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    'Invalid phone number format'
  )
  .min(10, 'Phone number must be at least 10 digits');

export const urlSchema = z
  .string()
  .url('Invalid URL format');

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  );

// Common number validations
export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number');

export const nonNegativeNumberSchema = z
  .number()
  .nonnegative('Must be a non-negative number');

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage must not exceed 100');

// Common date validations
export const pastDateSchema = z
  .date()
  .max(new Date(), 'Date must be in the past');

export const futureDateSchema = z
  .date()
  .min(new Date(), 'Date must be in the future');

// Name validations
export const firstNameSchema = z
  .string()
  .min(2, 'First name must be at least 2 characters')
  .max(50, 'First name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes');

export const lastNameSchema = z
  .string()
  .min(2, 'Last name must be at least 2 characters')
  .max(50, 'Last name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes');

// ID validations
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

// Common composed schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: weakPasswordSchema,
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: firstNameSchema.optional(),
    lastName: lastNameSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: weakPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Utility validation functions
export const createRequiredStringSchema = (fieldName: string, minLength = 1) =>
  z.string().min(minLength, `${fieldName} is required`);

export const createOptionalStringSchema = (maxLength?: number) =>
  maxLength
    ? z.string().max(maxLength, `Must not exceed ${maxLength} characters`).optional()
    : z.string().optional();

export const createEnumSchema = <T extends string>(
  values: readonly [T, ...T[]],
  fieldName: string
) =>
  z.enum(values, {
    message: `Invalid ${fieldName}`,
  });
