import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(254);
const password = z
  .string()
  .min(12, 'Password must contain at least 12 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchoolSchema = z.object({
  body: z.object({
    schoolName: z.string().trim().min(2).max(160),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().min(2).max(100),
    estimatedStudents: z.enum(['1-100', '101-500', '501-1000', '1000+']).optional(),
    websiteUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
    applicantName: z.string().trim().min(2).max(120),
    applicantDesignation: z.string().trim().min(2).max(120),
    applicantEmail: email,
    applicantMobile: z.string().trim().min(6).max(40),
    additionalInfo: z.string().trim().max(2_000).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1).max(128),
    rememberDevice: z.boolean().optional(),
    deviceName: z.string().trim().max(160).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const setupPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(32).max(500),
    newPassword: password,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email }),
  params: z.object({}),
  query: z.object({}),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(32).max(500),
    newPassword: password,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(32).max(500).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});
