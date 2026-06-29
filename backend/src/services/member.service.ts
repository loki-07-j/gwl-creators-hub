import { NotificationCategory, TicketType, AuditAction } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const memberService = {
  async dashboard(userId: string) {
    const [ownedCount, fileAgg, activeCoupons, user, releases, recentInvoices] = await Promise.all([
      prisma.entitlement.count({ where: { userId } }),
      prisma.entitlement.findMany({ where: { userId }, include: { product: { select: { fileCount: true } } } }),
      prisma.coupon.count({ where: { active: true } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.productRelease.findMany({ orderBy: { releasedAt: 'desc' }, take: 3, include: { product: true } }),
      prisma.invoice.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' }, take: 4, include: { order: { include: { items: true } } } }),
    ]);

    const totalFiles = fileAgg.reduce((sum, e) => sum + (e.product?.fileCount ?? 0), 0);

    return {
      stats: {
        productsOwned: ownedCount,
        filesAvailable: totalFiles,
        activeCoupons,
        lifetimeSaved: user?.lifetimeSaved ?? 0,
      },
      latestReleases: releases.map((r) => ({
        id: r.id,
        name: r.product.name,
        icon: r.product.icon,
        version: r.version,
        note: r.changes[0] ?? 'Updated',
        releasedAt: r.releasedAt,
      })),
      recentActivity: recentInvoices.map((iv) => ({
        text: `Purchase complete — ${iv.order.items[0]?.label ?? 'Order'}`,
        when: iv.issuedAt,
      })),
      membership: {
        tier: user?.membership ?? 'NONE',
        memberSince: user?.memberSince,
        lifetimeSaved: user?.lifetimeSaved ?? 0,
      },
    };
  },

  // Purchased products (entitlements) — these carry the real download link.
  async products(userId: string, category?: string) {
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: { product: { include: { releases: { orderBy: { releasedAt: 'desc' }, take: 1 } } } },
      orderBy: { grantedAt: 'desc' },
    });
    return entitlements
      .map((e) => e.product)
      .filter((p) => !category || category === 'all' || p.category === category);
  },

  // Full catalog for members — every published product, flagged favourite/purchased.
  // downloadLink + purchaseCode are stripped so unpurchased products can't be accessed.
  async catalog(userId: string, category?: string) {
    const [allProducts, ents, wl] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
        include: { releases: { orderBy: { releasedAt: 'desc' }, take: 1 } },
      }),
      prisma.entitlement.findMany({ where: { userId }, select: { productId: true } }),
      prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } }),
    ]);
    const owned = new Set(ents.map((e) => e.productId));
    const fav = new Set(wl.map((w) => w.productId));
    return allProducts
      .filter((p) => !category || category === 'all' || p.category === category)
      .map(({ downloadLink: _dl, purchaseCode: _pc, ...p }) => ({ ...p, purchased: owned.has(p.id), favourite: fav.has(p.id) }));
  },

  // Redeem an admin-issued purchase code to unlock a product.
  async redeem(userId: string, productId: string, code: string) {
    const product = await prisma.product.findFirst({ where: { id: productId, status: 'PUBLISHED' } });
    if (!product) throw ApiError.notFound('Product not found');
    if (!product.purchaseCode) throw ApiError.badRequest('No purchase code is set for this product yet. Please contact support.');
    if ((code ?? '').trim().toUpperCase() !== product.purchaseCode.trim().toUpperCase()) {
      throw ApiError.badRequest('That purchase code is not valid for this product.');
    }
    const existing = await prisma.entitlement.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) throw ApiError.conflict('You have already unlocked this product.');
    await prisma.entitlement.create({ data: { userId, productId } });
    return { productId, name: product.name };
  },

  // Toggle a product in/out of the member's favourites (wishlist).
  async toggleFavourite(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');
    const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { productId, favourite: false };
    }
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return { productId, favourite: true };
  },

  async downloads(userId: string) {
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { grantedAt: 'desc' },
    });
    return entitlements.map((e) => ({
      id: e.product.id,
      name: e.product.name,
      icon: e.product.icon,
      version: e.product.version,
      size: e.product.sizeLabel,
      platform: e.product.platform,
      releasedAt: e.product.publishDate ?? e.product.updatedAt,
      downloadLink: e.product.downloadLink,
    }));
  },

  async releases(userId: string) {
    const ownedIds = (await prisma.entitlement.findMany({ where: { userId }, select: { productId: true } })).map((e) => e.productId);
    return prisma.productRelease.findMany({
      where: { productId: { in: ownedIds } },
      orderBy: { releasedAt: 'desc' },
      include: { product: true },
    });
  },

  bonus() {
    return prisma.bonusProduct.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } });
  },

  coupons() {
    return prisma.coupon.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } });
  },

  async wishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({ where: { userId }, include: { product: true }, orderBy: { createdAt: 'desc' } });
    return items.map((w) => ({
      id: w.id,
      productId: w.productId,
      name: w.product.name,
      icon: w.product.icon,
      original: rupee(w.product.priceOriginal),
      member: rupee(w.product.priceMember),
    }));
  },

  async removeWishlist(userId: string, id: string) {
    const item = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!item || item.userId !== userId) throw ApiError.notFound('Wishlist item not found');
    await prisma.wishlistItem.delete({ where: { id } });
  },

  async addWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  },

  invoices(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: { order: { include: { items: true } } },
    });
  },

  async membership(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return {
      tier: user.membership,
      memberSince: user.memberSince,
      lifetimeSaved: user.lifetimeSaved,
    };
  },

  notifications(userId: string, category?: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(category && category !== 'all' ? { category: category.toUpperCase() as NotificationCategory } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markNotificationRead(userId: string, id: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) throw ApiError.notFound('Notification not found');
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },

  async referral(userId: string) {
    const [user, referrals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.referral.findMany({ where: { referrerId: userId }, orderBy: { createdAt: 'desc' } }),
    ]);
    const rewarded = referrals.filter((r) => r.status === 'REWARDED');
    const pending = referrals.filter((r) => r.status === 'PENDING');
    const earned = rewarded.reduce((s, r) => s + r.rewardAmount, 0);
    return {
      link: `gwlhub.com/r/${user?.referralCode ?? 'creator'}`,
      stats: {
        successful: rewarded.length,
        earned,
        pending: pending.length,
        rank: 42,
      },
      referrals,
    };
  },

  async createTicket(userId: string, data: { type?: string; product?: string; message: string }) {
    const count = await prisma.supportTicket.count();
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo: `GWL-${1183 + count}`,
        userId,
        type: (data.type?.toUpperCase() as TicketType) ?? TicketType.GENERAL,
        product: data.product,
        message: data.message,
      },
    });
    return ticket;
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      membership: user.membership,
      memberSince: user.memberSince,
    };
  },

  async updateProfile(userId: string, data: { name?: string; country?: string; phone?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    await prisma.auditLog.create({
      data: { actorId: userId, actorName: user.name, action: AuditAction.UPDATE, change: 'Updated profile' },
    }).catch(() => null);
    return memberService.getProfile(userId);
  },
};
