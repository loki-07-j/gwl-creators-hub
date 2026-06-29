export type Role = 'MEMBER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  membership: string;
  avatarUrl: string | null;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bg: string;
  category: string;
  tags: string[];
  version: string;
  fileCount: number;
  sizeLabel: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
  priceOriginal: number;
  priceOffer: number;
  priceMember: number;
  savingsBadge: string | null;
  shortDesc: string | null;
  benefits: string | null;
  included: string | null;
  thumbnailUrl: string | null;
  heroUrl: string | null;
  previewVideoUrl: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  downloadLink: string | null;
  paymentLink: string | null;
  platform: string | null;
  publishDate: string | null;
  releases?: ProductRelease[];
}

export interface ProductRelease {
  id: string;
  productId: string;
  version: string;
  changes: string[];
  dot: string | null;
  releasedAt: string;
  product?: Product;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  [k: string]: unknown;
}

export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}
