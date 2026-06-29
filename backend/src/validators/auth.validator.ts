import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['member', 'admin']).optional(),
});

export const registerSchema = z.object({
  token: z.string().min(10, 'Invite token is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
