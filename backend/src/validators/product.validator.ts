import { z } from 'zod';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const productCreateSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  icon: z.string().optional(),
  bg: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  fileCount: z.coerce.number().int().min(0).optional(),
  sizeLabel: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED']).optional(),
  priceOriginal: z.coerce.number().int().min(0).optional(),
  priceOffer: z.coerce.number().int().min(0).optional(),
  priceMember: z.coerce.number().int().min(0).optional(),
  savingsBadge: z.string().optional(),
  shortDesc: z.string().optional(),
  benefits: z.string().optional(),
  included: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  heroUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  downloadLink: z.string().optional(),
  paymentLink: z.string().optional(),
  purchaseCode: z.string().optional(),
  platform: z.string().optional(),
  publishDate: z.coerce.date().optional(),
}).transform((d) => ({ ...d, slug: d.slug ? slugify(d.slug) : slugify(d.name) }));

// partial update — accept any subset of create fields
export const productPatchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().optional(),
  icon: z.string().optional(),
  bg: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  fileCount: z.coerce.number().int().min(0).optional(),
  sizeLabel: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED']).optional(),
  priceOriginal: z.coerce.number().int().min(0).optional(),
  priceOffer: z.coerce.number().int().min(0).optional(),
  priceMember: z.coerce.number().int().min(0).optional(),
  savingsBadge: z.string().optional(),
  shortDesc: z.string().optional(),
  benefits: z.string().optional(),
  included: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  heroUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  downloadLink: z.string().optional(),
  paymentLink: z.string().optional(),
  purchaseCode: z.string().optional(),
  platform: z.string().optional(),
  publishDate: z.coerce.date().optional(),
});

export const releaseCreateSchema = z.object({
  version: z.string().min(1),
  changes: z.array(z.string()).default([]),
  dot: z.string().optional(),
  releasedAt: z.coerce.date().optional(),
});
