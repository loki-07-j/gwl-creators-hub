import { AuditAction } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { recordAudit } from './audit.service';

type Actor = { id: string; name: string };

export const contentService = {
  // ── Coupons ─────────────────────────────────────────────────────────────
  listCoupons: () => prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
  createCoupon: async (data: any, actor: Actor) => {
    const c = await prisma.coupon.create({ data });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.CREATE, change: `New coupon ${c.code}` });
    return c;
  },
  updateCoupon: (id: string, data: any) => prisma.coupon.update({ where: { id }, data }),
  toggleCoupon: async (id: string) => {
    const c = await prisma.coupon.findUnique({ where: { id } });
    if (!c) throw ApiError.notFound('Coupon not found');
    return prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  },
  deleteCoupon: (id: string) => prisma.coupon.delete({ where: { id } }),

  // ── Bundles ─────────────────────────────────────────────────────────────
  listBundles: () => prisma.bundle.findMany({ orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } } } }),
  createBundle: async (data: any, actor: Actor) => {
    const { productIds = [], ...rest } = data;
    const b = await prisma.bundle.create({
      data: { ...rest, items: { create: (productIds as string[]).map((productId) => ({ productId })) } },
    });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.CREATE, change: `New bundle ${b.name}` });
    return b;
  },
  updateBundle: async (id: string, data: any) => {
    const { productIds, ...rest } = data;
    if (productIds) {
      await prisma.bundleItem.deleteMany({ where: { bundleId: id } });
      await prisma.bundleItem.createMany({ data: (productIds as string[]).map((productId) => ({ bundleId: id, productId })) });
    }
    return prisma.bundle.update({ where: { id }, data: rest, include: { items: true } });
  },
  toggleBundle: async (id: string) => {
    const b = await prisma.bundle.findUnique({ where: { id } });
    if (!b) throw ApiError.notFound('Bundle not found');
    const active = !b.active;
    return prisma.bundle.update({ where: { id }, data: { active, status: active ? 'ACTIVE' : 'PAUSED' } });
  },
  deleteBundle: (id: string) => prisma.bundle.delete({ where: { id } }),

  // ── Testimonials ─────────────────────────────────────────────────────────
  listTestimonials: () => prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
  createTestimonial: (data: any) =>
    prisma.testimonial.create({ data: { ...data, initial: (data.name?.[0] ?? '?').toUpperCase() } }),
  updateTestimonial: (id: string, data: any) => prisma.testimonial.update({ where: { id }, data }),
  toggleTestimonial: async (id: string) => {
    const t = await prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw ApiError.notFound('Testimonial not found');
    return prisma.testimonial.update({ where: { id }, data: { published: !t.published } });
  },
  deleteTestimonial: (id: string) => prisma.testimonial.delete({ where: { id } }),

  // ── Announcements ──────────────────────────────────────────────────────────
  listAnnouncements: () => prisma.announcement.findMany({ orderBy: { sortOrder: 'asc' } }),
  createAnnouncement: (data: any) => prisma.announcement.create({ data }),
  updateAnnouncement: (id: string, data: any) => prisma.announcement.update({ where: { id }, data }),
  toggleAnnouncement: async (id: string) => {
    const a = await prisma.announcement.findUnique({ where: { id } });
    if (!a) throw ApiError.notFound('Announcement not found');
    return prisma.announcement.update({ where: { id }, data: { active: !a.active } });
  },
  deleteAnnouncement: (id: string) => prisma.announcement.delete({ where: { id } }),

  // ── FAQs ──────────────────────────────────────────────────────────────────
  listFaqs: () => prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } }),
  createFaq: (data: any) => prisma.faq.create({ data }),
  updateFaq: (id: string, data: any) => prisma.faq.update({ where: { id }, data }),
  toggleFaq: async (id: string) => {
    const f = await prisma.faq.findUnique({ where: { id } });
    if (!f) throw ApiError.notFound('FAQ not found');
    return prisma.faq.update({ where: { id }, data: { published: !f.published } });
  },
  deleteFaq: (id: string) => prisma.faq.delete({ where: { id } }),

  // ── Landing sections ──────────────────────────────────────────────────────
  listLanding: () => prisma.landingSection.findMany({ orderBy: { sortOrder: 'asc' } }),
  toggleLanding: async (id: string) => {
    const l = await prisma.landingSection.findUnique({ where: { id } });
    if (!l) throw ApiError.notFound('Section not found');
    return prisma.landingSection.update({ where: { id }, data: { enabled: !l.enabled } });
  },
};
