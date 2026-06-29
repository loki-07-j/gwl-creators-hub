import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { prisma } from '../config/prisma';

/** Public, unauthenticated reads that power the landing page. */
export const catalogController = {
  products: asyncHandler(async (_req, res) =>
    ok(res, await prisma.product.findMany({ where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } })),
  ),

  productBySlug: asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED' },
      include: { releases: { orderBy: { releasedAt: 'desc' } } },
    });
    return ok(res, product);
  }),

  bundles: asyncHandler(async (_req, res) =>
    ok(res, await prisma.bundle.findMany({ where: { active: true }, include: { items: { include: { product: true } } } })),
  ),

  testimonials: asyncHandler(async (_req, res) =>
    ok(res, await prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })),
  ),

  faqs: asyncHandler(async (_req, res) =>
    ok(res, await prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })),
  ),

  announcements: asyncHandler(async (_req, res) =>
    ok(res, await prisma.announcement.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })),
  ),

  landing: asyncHandler(async (_req, res) =>
    ok(res, await prisma.landingSection.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } })),
  ),
};
