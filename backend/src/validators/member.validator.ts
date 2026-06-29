import { z } from 'zod';

export const ticketSchema = z.object({
  type: z.enum(['BUG', 'FEATURE', 'BUSINESS', 'GENERAL']).optional(),
  product: z.string().optional(),
  message: z.string().trim().min(5, 'Please describe your issue'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  country: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.string().optional(),
});

export const wishlistAddSchema = z.object({
  productId: z.string().min(1),
});
