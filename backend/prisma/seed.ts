import {
  PrismaClient,
  UserRole,
  UserStatus,
  MembershipTier,
  ProductStatus,
  BundleStatus,
  CouponType,
  CouponScope,
  OrderStatus,
  ReferralStatus,
  NotificationCategory,
  AnnouncementType,
  AuditAction,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (p: string) => bcrypt.hashSync(p, 10);

async function clean() {
  // Order matters for FK constraints.
  await prisma.auditLog.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.productRelease.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.bonusProduct.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.landingSection.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.signupInvite.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('🌱 Seeding GWL Creators Hub…');
  await clean();

  // ── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@gmail.com',
      passwordHash: hash('12345'),
      role: UserRole.ADMIN,
      teamRole: 'SUPER_ADMIN',
      status: UserStatus.ACTIVE,
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Aarav',
      email: 'member@gmail.com',
      passwordHash: hash('1234'),
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      membership: MembershipTier.LIFETIME,
      memberSince: new Date('2026-01-12'),
      country: 'India',
      phone: '+91 98765 43210',
      lifetimeSaved: 18400,
      referralCode: 'aarav-7K2',
    },
  });

  // Team members (admin RBAC table)
  await prisma.user.createMany({
    data: [
      { name: 'Riya Sharma', email: 'riya@gwlhub.com', passwordHash: hash('password'), role: UserRole.ADMIN, teamRole: 'MARKETING', status: UserStatus.ACTIVE },
      { name: 'Mohit Verma', email: 'mohit@gwlhub.com', passwordHash: hash('password'), role: UserRole.ADMIN, teamRole: 'SUPPORT', status: UserStatus.ACTIVE },
      { name: 'Farah Khan', email: 'farah@gwlhub.com', passwordHash: hash('password'), role: UserRole.ADMIN, teamRole: 'FINANCE', status: UserStatus.INVITED },
    ],
  });

  // Customers (buyers shown in admin Customers table)
  const customerSeed = [
    { name: 'Priya Mehta', email: 'priya@gmail.com', membership: MembershipTier.LIFETIME, memberSince: new Date('2026-01-12') },
    { name: 'Arjun Kumar', email: 'arjun@gmail.com', membership: MembershipTier.LIFETIME, memberSince: new Date('2026-02-18') },
    { name: 'Sneha Rao', email: 'sneha@gmail.com', membership: MembershipTier.NONE },
    { name: 'Vikram Joshi', email: 'vikram@gmail.com', membership: MembershipTier.NONE },
    { name: 'Neha Gupta', email: 'neha@gmail.com', membership: MembershipTier.LIFETIME, memberSince: new Date('2025-12-08') },
    { name: 'Karthik V.', email: 'karthik@gmail.com', membership: MembershipTier.NONE },
  ];
  for (const c of customerSeed) {
    await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        passwordHash: hash('password'),
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        membership: c.membership,
        memberSince: c.memberSince ?? null,
      },
    });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const productSeed = [
    {
      name: 'Luxury Videos Hub', slug: 'luxury-videos-hub', icon: '🎬',
      bg: 'linear-gradient(135deg,#2a1f08,#0d0a04)', category: 'Videos', version: 'v1.0',
      fileCount: 20000, sizeLabel: 'All 4 packs', status: ProductStatus.PUBLISHED,
      priceOriginal: 1199, priceOffer: 699, priceMember: 699, savingsBadge: 'All 4 packs · 20,000+ videos',
      shortDesc: 'Everything in one — 20,000+ premium HQ luxury videos (all 4 packs combined).',
      benefits: 'All 4 video packs combined into one\n20,000+ premium HQ videos\nBest value — far cheaper than buying separately\nCommercial use · lifetime updates',
      included: 'Creator Launch Pass + Starter + Creator + Ultimate\n20,000+ HQ premium videos total\nReady for Reels, Shorts & Ads\nCommercial license · lifetime access',
      thumbnailUrl: '/uploads/luxury-videos-hub.png', heroUrl: '/uploads/luxury-videos-hub.png',
      platform: 'All platforms',
      seoTitle: 'Luxury Videos Hub — 20,000+ Premium HQ Videos (All Packs)', metaDescription: 'All 4 video packs combined — 20,000+ premium HQ luxury videos for Reels, Shorts & Ads. One-time ₹699, lifetime access, commercial use.', keywords: 'stock videos, reels, shorts, luxury videos, creator videos, video bundle',
    },
    {
      name: 'Creator Launch Pass', slug: 'creator-launch-pass', icon: '🚀',
      bg: 'linear-gradient(135deg,#2a1f08,#0d0a04)', category: 'Videos', version: 'v1.0',
      fileCount: 365, sizeLabel: '365+ videos', status: ProductStatus.PUBLISHED,
      priceOriginal: 999, priceOffer: 49, priceMember: 49, savingsBadge: '95% OFF',
      shortDesc: '365+ premium HQ luxury videos — the perfect way to start creating.',
      benefits: 'Start for less than the cost of a coffee\nInstant download · commercial use\nReady-to-use assets\nLifetime access',
      included: '365+ HQ premium videos\nReady for Reels, Shorts & Status\nCommercial use\nInstant download · lifetime access',
      thumbnailUrl: '/uploads/tier-launch-pass.png', heroUrl: '/uploads/tier-launch-pass.png',
      platform: 'All platforms',
      seoTitle: 'Creator Launch Pass — 365+ Premium HQ Videos', metaDescription: '365+ premium HQ luxury videos for Reels, Shorts & Status. Launch offer ₹49, commercial use, lifetime access.', keywords: 'stock videos, reels, shorts, creator videos, launch pass',
    },
    {
      name: 'Starter Plan', slug: 'starter-plan', icon: '⭐',
      bg: 'linear-gradient(135deg,#1c1810,#0d0a04)', category: 'Videos', version: 'v1.0',
      fileCount: 1000, sizeLabel: '1,000+ videos', status: ProductStatus.PUBLISHED,
      priceOriginal: 599, priceOffer: 199, priceMember: 199, savingsBadge: '67% OFF',
      shortDesc: '1,000+ premium HQ videos for creators posting consistently.',
      benefits: 'For creators posting consistently\nOrganized categories\nCommercial use\nLifetime access',
      included: '1,000+ HQ premium videos\nOrganized categories\nCommercial use\nInstant download · lifetime access',
      thumbnailUrl: '/uploads/tier-starter.png', heroUrl: '/uploads/tier-starter.png',
      platform: 'All platforms',
      seoTitle: 'Starter Plan — 1,000+ Premium HQ Videos', metaDescription: '1,000+ premium HQ luxury videos for consistent creators. ₹199, commercial use, lifetime access.', keywords: 'stock videos, reels, shorts, creator videos, starter',
    },
    {
      name: 'Creator Plan', slug: 'creator-plan', icon: '💎',
      bg: 'linear-gradient(135deg,#2a2408,#100c04)', category: 'Videos', version: 'v1.0',
      fileCount: 5000, sizeLabel: '5,000+ videos', status: ProductStatus.PUBLISHED,
      priceOriginal: 999, priceOffer: 299, priceMember: 299, savingsBadge: 'Most Popular',
      shortDesc: '5,000+ premium HQ videos — our most popular choice for serious creators.',
      benefits: 'Most popular for serious creators & agencies\nMassive organized collection\nCommercial use\nLifetime access',
      included: '5,000+ HQ premium videos\nMassive organized library\nCommercial use\nInstant download · lifetime access',
      thumbnailUrl: '/uploads/tier-creator.png', heroUrl: '/uploads/tier-creator.png',
      platform: 'All platforms',
      seoTitle: 'Creator Plan — 5,000+ Premium HQ Videos', metaDescription: '5,000+ premium HQ luxury videos for serious creators and agencies. ₹299, commercial use, lifetime access.', keywords: 'stock videos, reels, shorts, creator videos, agency',
    },
    {
      name: 'Ultimate Plan', slug: 'ultimate-plan', icon: '👑',
      bg: 'linear-gradient(135deg,#2a1f08,#0d0a04)', category: 'Videos', version: 'v1.0',
      fileCount: 15000, sizeLabel: '15,000+ videos', status: ProductStatus.PUBLISHED,
      priceOriginal: 1499, priceOffer: 499, priceMember: 499, savingsBadge: 'Best Value',
      shortDesc: '15,000+ premium HQ videos — the complete premium collection.',
      benefits: 'The complete premium collection\nEntire premium library\nCommercial use\nLifetime access',
      included: '15,000+ HQ premium videos\nEntire premium collection\nCommercial use\nInstant download · lifetime access',
      thumbnailUrl: '/uploads/tier-ultimate.png', heroUrl: '/uploads/tier-ultimate.png',
      platform: 'All platforms',
      seoTitle: 'Ultimate Plan — 15,000+ Premium HQ Videos', metaDescription: '15,000+ premium HQ luxury videos — the complete collection. ₹499, commercial use, lifetime access.', keywords: 'stock videos, reels, shorts, creator videos, ultimate',
    },
    {
      name: 'Ideas Hub', slug: 'ideas-hub', icon: '💡',
      bg: 'linear-gradient(135deg,#06181a,#040c0d)', category: 'Ideas', version: 'v1.0',
      fileCount: 3500, sizeLabel: '180 MB', status: ProductStatus.PUBLISHED,
      priceOriginal: 699, priceOffer: 149, priceMember: 129, savingsBadge: 'Save ₹550',
      shortDesc: '3,500+ AI-ready digital product ideas across 14 categories.',
      benefits: 'Skip weeks of research\nAI prompt included with every idea\nCopy & expand with ChatGPT, Claude, Gemini or any AI\nTamil & English support',
      included: '3,500+ digital product ideas\n14 organised categories\nReady-to-copy AI prompt per idea\nOne-time payment · lifetime access',
      thumbnailUrl: '/uploads/ideas-hub.png', heroUrl: '/uploads/ideas-hub.png',
      platform: 'PDF + AI Prompts',
      seoTitle: 'Ideas Hub — 3,500+ AI-Ready Digital Product Ideas', metaDescription: '3,500+ AI-ready digital product ideas across 14 categories with a ready-to-copy AI prompt for every idea.', keywords: 'business ideas, digital product ideas, ai prompts, startup ideas',
    },
    {
      name: 'Websites Hub', slug: 'websites-hub', icon: '🌐',
      bg: 'linear-gradient(135deg,#12152a,#080a16)', category: 'Websites', version: 'v1.0',
      fileCount: 141, sizeLabel: '1.1 GB', status: ProductStatus.PUBLISHED,
      priceOriginal: 1999, priceOffer: 499, priceMember: 449, savingsBadge: 'Save ₹1,500',
      shortDesc: '141 industry website templates built with the latest React stack.',
      benefits: 'Live preview before download\nComplete source code · setup in 2 commands\n30+ premium AI images per template\nSEO optimized · commercial use',
      included: '141 industry website templates\nReact + TypeScript + Tailwind + Framer Motion\nAnimated intro video + Master AI Prompt (PDF)\nOne-time payment · lifetime access',
      thumbnailUrl: '/uploads/websites-hub.png', heroUrl: '/uploads/websites-hub.png',
      platform: 'React + TypeScript + Tailwind',
      seoTitle: 'Websites Hub — 141 Premium Industry Website Templates', metaDescription: '141 premium industry website templates with live preview, source code, AI images and SEO — built with the latest React ecosystem.', keywords: 'website templates, react templates, business websites, html templates',
    },
    {
      name: 'Creators Research Hub', slug: 'creators-research-hub', icon: '📦',
      bg: 'linear-gradient(135deg,#161a2e,#0a0c16)', category: 'Research', version: 'v1.0',
      fileCount: 0, sizeLabel: '1 TB+', status: ProductStatus.PUBLISHED,
      priceOriginal: 4999, priceOffer: 999, priceMember: 899, savingsBadge: 'Save ₹4,000',
      shortDesc: '1TB+ of real digital products across hundreds of categories — research & learn.',
      benefits: 'Skip years of collecting resources\nStudy real product structure & packaging\nDiscover winning ideas across niches\nInstant access · lifetime reference library',
      included: '1TB+ real digital products\nHundreds of organised categories\nCourses, eBooks, templates, marketing & AI assets\nOne-time payment · lifetime access',
      thumbnailUrl: '/uploads/creators-research-hub.png', heroUrl: '/uploads/creators-research-hub.png',
      platform: 'All formats',
      seoTitle: 'Creators Research Hub — 1TB+ Digital Product Research Library', metaDescription: 'A curated 1TB+ library of real digital products across hundreds of categories to research, analyze and build better products.', keywords: 'digital product research, swipe files, creator research, product library',
    },
    {
      name: 'Shortcuts Hub', slug: 'shortcuts-hub', icon: '⌨️',
      bg: 'linear-gradient(135deg,#12231a,#070f0b)', category: 'Productivity', version: 'v1.0',
      fileCount: 100, sizeLabel: 'PDF cheat sheets', status: ProductStatus.PUBLISHED,
      priceOriginal: 499, priceOffer: 199, priceMember: 179, savingsBadge: 'Save ₹300',
      shortDesc: 'Keyboard shortcuts for 100+ software — Windows & macOS cheat sheets.',
      benefits: 'Work faster, click less\nEssential, Power User & Pro levels\nWindows & macOS support\nPrintable, searchable cheat sheets',
      included: 'Keyboard shortcuts for 100+ software\nVS Code, Photoshop, Premiere, Office, Canva, Notion & more\nPrintable cheat sheets\nOne-time payment · lifetime access',
      thumbnailUrl: '/uploads/shortcuts-hub.png', heroUrl: '/uploads/shortcuts-hub.png',
      platform: 'Windows & macOS',
      seoTitle: 'Shortcuts Hub — Keyboard Shortcuts for 100+ Software', metaDescription: 'Master 100+ software faster with keyboard shortcut cheat sheets for Windows & macOS — essential, power user and pro levels.', keywords: 'keyboard shortcuts, productivity, cheat sheets, vs code shortcuts',
    },
  ];
  // Map each product slug to its folder under product-content/ (some differ from the slug).
  const assetFolder: Record<string, string> = {
    'luxury-videos-hub': 'luxury-videos-hub',
    'creator-launch-pass': 'creator-launch-pass',
    'starter-plan': 'starter',
    'creator-plan': 'creator',
    'ultimate-plan': 'ultimate',
    'ideas-hub': 'ideas-hub',
    'websites-hub': 'websites-hub',
    'creators-research-hub': 'creators-research-hub',
    'shortcuts-hub': 'shortcuts-hub',
  };
  const products: Record<string, string> = {};
  for (let i = 0; i < productSeed.length; i++) {
    const p = productSeed[i];
    const folder = assetFolder[p.slug] ?? p.slug;
    const purchaseCode = 'GWL-' + p.slug.replace(/-/g, '').toUpperCase().slice(0, 8);
    const created = await prisma.product.create({
      data: {
        ...p,
        sortOrder: i, // initial display order = seed order; admin can drag to reorder
        downloadLink: '#',
        paymentLink: '#',
        purchaseCode,
        // Assets are served by the backend from product-content (banner = showcase, cover = video poster).
        thumbnailUrl: `/api/v1/assets/${folder}/banner.png`,
        heroUrl: `/api/v1/assets/${folder}/cover.png`,
      },
    });
    products[p.slug] = created.id;
  }

  // ── Releases ─────────────────────────────────────────────────────────────
  const releases = [
    { slug: 'websites-hub', version: 'v1.0', date: '2026-06-25', dot: '#7c8bff', changes: ['141 industry website templates', 'React + TypeScript + Tailwind stack', 'Master AI Prompt (PDF) included'] },
    { slug: 'ideas-hub', version: 'v1.0', date: '2026-06-22', dot: '#36b6c9', changes: ['3,500+ AI-ready ideas across 14 categories', 'AI prompt included with every idea', 'Tamil & English support'] },
    { slug: 'shortcuts-hub', version: 'v1.0', date: '2026-06-15', dot: '#00C853', changes: ['Shortcuts for 100+ software', 'Windows & macOS cheat sheets'] },
    { slug: 'luxury-videos-hub', version: 'v1.0', date: '2026-06-18', dot: '#F4C542', changes: ['All 4 video packs combined — 20,000+ premium HQ videos', 'Commercial license included'] },
  ];
  for (const r of releases) {
    await prisma.productRelease.create({
      data: { productId: products[r.slug], version: r.version, changes: r.changes, dot: r.dot, releasedAt: new Date(r.date) },
    });
  }

  // ── Bundles ──────────────────────────────────────────────────────────────
  const bundleSeed = [
    { name: 'Creator Mega Bundle', icon: '🚀', description: 'Luxury Videos Hub + Ideas Hub + Shortcuts Hub', priceOriginal: 1847, price: 699, status: BundleStatus.ACTIVE, active: true, slugs: ['luxury-videos-hub', 'ideas-hub', 'shortcuts-hub'] },
    { name: 'Business Starter Bundle', icon: '💼', description: 'Ideas Hub + Websites Hub + Creators Research Hub', priceOriginal: 7697, price: 1499, status: BundleStatus.ACTIVE, active: true, slugs: ['ideas-hub', 'websites-hub', 'creators-research-hub'] },
    { name: 'Ultimate Creator Bundle', icon: '👑', description: 'Luxury Videos Hub + Websites Hub + Ideas Hub', priceOriginal: 2647, price: 999, status: BundleStatus.PAUSED, active: false, slugs: ['luxury-videos-hub', 'websites-hub', 'ideas-hub'] },
  ];
  for (const b of bundleSeed) {
    await prisma.bundle.create({
      data: {
        name: b.name, icon: b.icon, description: b.description,
        priceOriginal: b.priceOriginal, price: b.price, status: b.status, active: b.active,
        items: { create: b.slugs.map((s) => ({ productId: products[s] })) },
      },
    });
  }

  // ── Coupons ──────────────────────────────────────────────────────────────
  const couponSeed = [
    { code: 'MEMBER20', type: CouponType.PERCENT, value: 20, scope: CouponScope.ALL_PRODUCTS, scopeLabel: 'All products', autoApply: true, active: true, usageCount: 1204, expiresAt: new Date('2026-12-31') },
    { code: 'BUNDLE15', type: CouponType.PERCENT, value: 15, scope: CouponScope.ALL_BUNDLES, scopeLabel: 'All bundles', autoApply: false, active: true, usageCount: 432, expiresAt: new Date('2026-09-30') },
    { code: 'FLASH30', type: CouponType.PERCENT, value: 30, scope: CouponScope.PRODUCT, scopeLabel: 'Ideas Hub', autoApply: false, active: false, usageCount: 88, expiresAt: new Date('2026-06-30') },
    { code: 'WELCOME10', type: CouponType.PERCENT, value: 10, scope: CouponScope.FIRST_ORDER, scopeLabel: 'First order', autoApply: true, active: true, usageCount: 2910, expiresAt: null },
    { code: 'REFER100', type: CouponType.FIXED, value: 100, scope: CouponScope.REFERRAL, scopeLabel: 'Referrals', autoApply: false, active: false, usageCount: 310, expiresAt: null },
  ];
  for (const c of couponSeed) await prisma.coupon.create({ data: c });

  // ── Entitlements & wishlist for the demo member ──────────────────────────
  const memberOwned = ['luxury-videos-hub', 'ideas-hub', 'shortcuts-hub'];
  for (const slug of memberOwned) {
    await prisma.entitlement.create({ data: { userId: member.id, productId: products[slug] } });
  }
  for (const slug of ['websites-hub', 'creators-research-hub']) {
    await prisma.wishlistItem.create({ data: { userId: member.id, productId: products[slug] } });
  }

  // ── Orders + invoices ────────────────────────────────────────────────────
  const orderSeed = [
    { num: '#GWL-2412', name: 'Priya Mehta', email: 'priya@gmail.com', label: 'Ideas Hub', amount: 149, status: OrderStatus.PAID, date: '2026-06-27' },
    { num: '#GWL-2411', name: 'Arjun Kumar', email: 'arjun@gmail.com', label: 'Creator Mega Bundle', amount: 699, status: OrderStatus.PAID, date: '2026-06-27' },
    { num: '#GWL-2410', name: 'Sneha Rao', email: 'sneha@gmail.com', label: 'Websites Hub', amount: 499, status: OrderStatus.PAID, date: '2026-06-26' },
    { num: '#GWL-2409', name: 'Vikram Joshi', email: 'vikram@gmail.com', label: 'Shortcuts Hub', amount: 199, status: OrderStatus.REFUNDED, date: '2026-06-26' },
    { num: '#GWL-2408', name: 'Neha Gupta', email: 'neha@gmail.com', label: 'Lifetime Membership', amount: 39, status: OrderStatus.PAID, date: '2026-06-25' },
    { num: '#GWL-2407', name: 'Karthik V.', email: 'karthik@gmail.com', label: 'Creator Launch Pass', amount: 49, status: OrderStatus.PENDING, date: '2026-06-25' },
    { num: '#GWL-2406', name: 'Divya S.', email: 'divya@gmail.com', label: 'Creators Research Hub', amount: 999, status: OrderStatus.PAID, date: '2026-06-24' },
  ];
  let invSeq = 341;
  for (const o of orderSeed) {
    const buyer = await prisma.user.findUnique({ where: { email: o.email } });
    const order = await prisma.order.create({
      data: {
        orderNumber: o.num,
        userId: buyer?.id ?? null,
        customerName: o.name,
        customerEmail: o.email,
        amount: o.amount,
        status: o.status,
        createdAt: new Date(o.date),
        items: { create: [{ label: o.label, unitPrice: o.amount, quantity: 1 }] },
      },
    });
    if (o.status === OrderStatus.PAID) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-2026-${String(invSeq++).padStart(4, '0')}`,
          orderId: order.id,
          userId: buyer?.id ?? null,
          amount: o.amount,
          issuedAt: new Date(o.date),
        },
      });
    }
  }

  // Member invoice history (from member dashboard)
  const memberInvoices = [
    { id: 'INV-2026-0288', label: 'Shortcuts Hub', amount: 179, date: '2026-06-15' },
    { id: 'INV-2026-0190', label: 'Creator Launch Pass', amount: 49, date: '2026-06-02' },
    { id: 'INV-2026-0102', label: 'Creator Mega Bundle', amount: 699, date: '2026-05-18' },
    { id: 'INV-2026-0011', label: 'Lifetime Membership', amount: 39, date: '2026-01-12' },
  ];
  for (const mi of memberInvoices) {
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${mi.id}`,
        userId: member.id,
        customerName: member.name,
        customerEmail: member.email,
        amount: mi.amount,
        status: OrderStatus.PAID,
        createdAt: new Date(mi.date),
        items: { create: [{ label: mi.label, unitPrice: mi.amount, quantity: 1 }] },
      },
    });
    await prisma.invoice.create({
      data: { invoiceNumber: mi.id, orderId: order.id, userId: member.id, amount: mi.amount, issuedAt: new Date(mi.date) },
    });
  }

  // ── Bonus products ───────────────────────────────────────────────────────
  await prisma.bonusProduct.createMany({
    data: [
      { name: 'Brand Kit Templates', icon: '🎨', bg: 'linear-gradient(135deg,#1a1233,#0d0a16)', description: 'Logos, color palettes & brand guidelines, member exclusive.' },
      { name: 'Pitch Deck Pack', icon: '📊', bg: 'linear-gradient(135deg,#062018,#040f0b)', description: '12 investor-ready pitch deck templates.' },
      { name: 'Royalty-Free Audio', icon: '🎵', bg: 'linear-gradient(135deg,#2a1206,#160a04)', description: '80 background tracks for reels & shorts.' },
    ],
  });

  // ── Notifications (demo member) ──────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: member.id, icon: '🌐', iconBg: 'rgba(124,139,255,.15)', title: 'Websites Hub is live', body: '141 industry website templates are now available. Download now.', category: NotificationCategory.PRODUCTS, read: false },
      { userId: member.id, icon: '🎁', iconBg: 'rgba(244,197,66,.15)', title: 'New bonus added', body: 'Brand Kit Templates is now in your Bonus Products.', category: NotificationCategory.PRODUCTS, read: false },
      { userId: member.id, icon: '🏷', iconBg: 'rgba(0,200,83,.15)', title: 'Coupon expiring soon', body: 'FLASH30 expires in 3 days — use it on Ideas Hub.', category: NotificationCategory.OFFERS, read: false },
      { userId: member.id, icon: '✅', iconBg: 'rgba(42,150,166,.15)', title: 'Order successful', body: 'Your purchase of Shortcuts Hub is complete.', category: NotificationCategory.SYSTEM, read: true },
      { userId: member.id, icon: '💬', iconBg: 'rgba(124,77,255,.15)', title: 'Support replied', body: "We've responded to your ticket #GWL-1182.", category: NotificationCategory.SYSTEM, read: true },
    ],
  });

  // ── Referrals (demo member) ──────────────────────────────────────────────
  await prisma.referral.createMany({
    data: [
      { referrerId: member.id, refereeName: 'Neha G.', status: ReferralStatus.REWARDED, rewardAmount: 100, createdAt: new Date('2026-06-25') },
      { referrerId: member.id, refereeName: 'Karthik V.', status: ReferralStatus.REWARDED, rewardAmount: 100, createdAt: new Date('2026-06-20') },
      { referrerId: member.id, refereeName: 'Divya S.', status: ReferralStatus.PENDING, rewardAmount: 0, createdAt: new Date('2026-06-26') },
    ],
  });

  // ── Testimonials ─────────────────────────────────────────────────────────
  await prisma.testimonial.createMany({
    data: [
      { name: 'Priya Mehta', initial: 'P', avatarBg: '#2A96A6', stars: 5, text: 'Saved me weeks of work. Luxury Videos Hub is incredible value.', published: true, sortOrder: 0 },
      { name: 'Arjun Kumar', initial: 'A', avatarBg: '#D4A017', stars: 5, text: 'Ideas Hub gave me 3 product ideas I actually launched.', published: true, sortOrder: 1 },
      { name: 'Sneha Rao', initial: 'S', avatarBg: '#7c4dff', stars: 4, text: 'Websites Hub templates are clean and easy to customise.', published: false, sortOrder: 2 },
      { name: 'Neha Gupta', initial: 'N', avatarBg: '#ff5252', stars: 5, text: 'Best ₹39 I ever spent. Lifetime membership is a no-brainer.', published: true, sortOrder: 3 },
    ],
  });

  // ── Announcements ────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { message: '🎉 Founder launch sale — up to 95% off!', type: AnnouncementType.SALE, schedule: 'Now → 30 Jun', active: true, sortOrder: 0 },
      { message: '🔧 Scheduled maintenance Sunday 2am', type: AnnouncementType.MAINTENANCE, schedule: '29 Jun', active: false, sortOrder: 1 },
      { message: '✨ Websites Hub is live — 141 templates', type: AnnouncementType.UPDATE, schedule: 'Now', active: true, sortOrder: 2 },
      { message: '🪔 Diwali mega offer coming soon', type: AnnouncementType.HOLIDAY, schedule: 'Oct 2026', active: false, sortOrder: 3 },
    ],
  });

  // ── FAQs ─────────────────────────────────────────────────────────────────
  await prisma.faq.createMany({
    data: [
      { question: 'Do I need an account to buy?', answer: 'Guest checkout is available; an account unlocks your library and downloads.', category: 'Payments', published: true, sortOrder: 0 },
      { question: 'What does the commercial license cover?', answer: 'You may use all assets in personal and client commercial projects.', category: 'License', published: true, sortOrder: 1 },
      { question: 'How do lifetime updates work?', answer: 'Every future version of a product you own is free, forever.', category: 'Products', published: false, sortOrder: 2 },
      { question: 'Is membership required?', answer: 'No — membership simply unlocks member pricing and bonus drops.', category: 'Membership', published: true, sortOrder: 3 },
      { question: 'How do refunds work?', answer: 'Contact support within 7 days for a no-questions-asked refund.', category: 'Refunds', published: true, sortOrder: 4 },
    ],
  });

  // ── Landing sections ─────────────────────────────────────────────────────
  const landing = ['Hero', 'Why GWL', 'Trust', 'Featured Products', 'Bundles', 'Testimonials', 'Membership'];
  const landingEnabled = [true, true, true, true, true, false, true];
  for (let i = 0; i < landing.length; i++) {
    await prisma.landingSection.create({
      data: { key: landing[i].toLowerCase().replace(/\s+/g, '-'), name: landing[i], enabled: landingEnabled[i], sortOrder: i },
    });
  }

  // ── Media library ────────────────────────────────────────────────────────
  await prisma.mediaFile.createMany({
    data: [
      { name: 'luxury-videos-hub/banner.png', icon: '🖼', iconBg: 'rgba(244,197,66,.12)', sizeLabel: '2.0 MB', sizeBytes: 2.0 * 1024 * 1024, url: '/api/v1/assets/luxury-videos-hub/banner.png', mimeType: 'image/png' },
      { name: 'ideas-hub/banner.png', icon: '🖼', iconBg: 'rgba(42,150,166,.12)', sizeLabel: '1.3 MB', sizeBytes: 1.3 * 1024 * 1024, url: '/api/v1/assets/ideas-hub/banner.png', mimeType: 'image/png' },
      { name: 'websites-hub/banner.png', icon: '🖼', iconBg: 'rgba(124,139,255,.12)', sizeLabel: '2.2 MB', sizeBytes: 2.2 * 1024 * 1024, url: '/api/v1/assets/websites-hub/banner.png', mimeType: 'image/png' },
      { name: 'creators-research-hub/banner.png', icon: '🖼', iconBg: 'rgba(124,77,255,.12)', sizeLabel: '2.1 MB', sizeBytes: 2.1 * 1024 * 1024, url: '/api/v1/assets/creators-research-hub/banner.png', mimeType: 'image/png' },
      { name: 'shortcuts-hub/banner.png', icon: '🖼', iconBg: 'rgba(0,200,83,.12)', sizeLabel: '0.5 MB', sizeBytes: 0.5 * 1024 * 1024, url: '/api/v1/assets/shortcuts-hub/banner.png', mimeType: 'image/png' },
      { name: 'license.pdf', icon: '📄', iconBg: 'rgba(255,123,123,.12)', sizeLabel: '320 KB', sizeBytes: 320 * 1024, mimeType: 'application/pdf' },
      { name: 'master-ai-prompt.pdf', icon: '📄', iconBg: 'rgba(244,197,66,.12)', sizeLabel: '180 KB', sizeBytes: 180 * 1024, mimeType: 'application/pdf' },
      { name: 'luxury-videos-hub/cover.png', icon: '🖼', iconBg: 'rgba(244,197,66,.12)', sizeLabel: '1.1 MB', sizeBytes: 1.1 * 1024 * 1024, url: '/api/v1/assets/luxury-videos-hub/cover.png', mimeType: 'image/png' },
    ],
  });

  // ── RBAC roles + permission matrix ───────────────────────────────────────
  const modules = ['Products', 'Bundles', 'Orders', 'Customers', 'Coupons', 'Content', 'Analytics', 'Settings'];
  const roleDefs: { key: string; name: string; locked: boolean }[] = [
    { key: 'SUPER_ADMIN', name: 'Super Admin', locked: true },
    { key: 'ADMIN', name: 'Admin', locked: false },
    { key: 'MARKETING', name: 'Marketing', locked: false },
    { key: 'SUPPORT', name: 'Support', locked: false },
    { key: 'FINANCE', name: 'Finance', locked: false },
  ];
  const allow = (role: string, m: string): boolean => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return true;
      case 'MARKETING':
        return ['Products', 'Bundles', 'Coupons', 'Content', 'Analytics'].includes(m);
      case 'SUPPORT':
        return ['Orders', 'Customers'].includes(m);
      case 'FINANCE':
        return ['Orders', 'Analytics'].includes(m);
      default:
        return false;
    }
  };
  for (const rd of roleDefs) {
    await prisma.role.create({
      data: {
        key: rd.key,
        name: rd.name,
        locked: rd.locked,
        permissions: { create: modules.map((m) => ({ module: m, allowed: allow(rd.key, m) })) },
      },
    });
  }

  // ── Audit logs ───────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { actorId: admin.id, actorName: 'Admin', action: AuditAction.UPDATE, change: 'Ideas Hub price ₹199 → ₹149', ip: '103.21.x.x' },
      { actorName: 'Riya Sharma', action: AuditAction.CREATE, change: 'New coupon FLASH30', ip: '103.21.x.x' },
      { actorId: admin.id, actorName: 'Admin', action: AuditAction.PUBLISH, change: 'Websites Hub v1.0', ip: '103.21.x.x' },
      { actorName: 'Mohit Verma', action: AuditAction.UPDATE, change: 'Order #GWL-2409 → Refunded', ip: '49.37.x.x' },
      { actorId: admin.id, actorName: 'Admin', action: AuditAction.DELETE, change: "Removed draft 'Test product'", ip: '103.21.x.x' },
      { actorName: 'Riya Sharma', action: AuditAction.UPDATE, change: 'Hero headline edited', ip: '103.21.x.x' },
      { actorName: 'Farah Khan', action: AuditAction.CREATE, change: 'Invited new team member', ip: '122.15.x.x' },
    ],
  });

  // ── Settings ─────────────────────────────────────────────────────────────
  const settings: { group: string; key: string; value: string; label: string }[] = [
    { group: 'general', key: 'storeName', value: 'GWL Creators Hub', label: 'Store name' },
    { group: 'general', key: 'supportEmail', value: 'hi@gwlhub.com', label: 'Support email' },
    { group: 'general', key: 'currency', value: 'INR (₹)', label: 'Currency' },
    { group: 'general', key: 'timezone', value: 'Asia/Kolkata', label: 'Timezone' },
    { group: 'payments', key: 'gateway', value: 'Razorpay', label: 'Gateway' },
    { group: 'payments', key: 'razorpayKeyId', value: 'rzp_live_xxxxx', label: 'Razorpay Key ID' },
    { group: 'payments', key: 'payoutAccount', value: 'HDFC ****1234', label: 'Payout account' },
    { group: 'payments', key: 'gstNumber', value: '29ABCDE1234F1Z5', label: 'GST number' },
    { group: 'email', key: 'smtpHost', value: 'smtp.gwlhub.com', label: 'SMTP host' },
    { group: 'email', key: 'fromName', value: 'GWL Creators Hub', label: 'From name' },
    { group: 'email', key: 'fromEmail', value: 'no-reply@gwlhub.com', label: 'From email' },
    { group: 'email', key: 'replyTo', value: 'hi@gwlhub.com', label: 'Reply-to' },
    { group: 'membership', key: 'price', value: '₹39', label: 'Membership price' },
    { group: 'membership', key: 'discount', value: '20%', label: 'Member discount' },
    { group: 'membership', key: 'signupExpiry', value: '24 hours', label: 'Signup link expiry' },
    { group: 'membership', key: 'autoCoupon', value: 'MEMBER20', label: 'Auto-apply coupon' },
    { group: 'security', key: 'sessionTimeout', value: '30 min', label: 'Session timeout' },
    { group: 'security', key: 'allowedIps', value: 'Any', label: 'Allowed IPs' },
    { group: 'security', key: 'admin2fa', value: 'Enabled', label: 'Admin 2FA' },
    { group: 'security', key: 'passwordPolicy', value: 'Strong', label: 'Password policy' },
    { group: 'toggles', key: 'maintenanceMode', value: 'true', label: 'Maintenance mode' },
    { group: 'toggles', key: 'guestCheckout', value: 'true', label: 'Guest checkout' },
    { group: 'toggles', key: 'autoApplyMemberCoupon', value: 'false', label: 'Auto-apply member coupon' },
    { group: 'toggles', key: 'emailOrderReceipts', value: 'true', label: 'Email order receipts' },
    { group: 'seo', key: 'title', value: 'GWL Creators Hub — Premium digital products', label: 'SEO title' },
    { group: 'seo', key: 'description', value: 'Premium digital-products marketplace for creators.', label: 'Meta description' },
    { group: 'seo', key: 'keywords', value: 'creator products, digital downloads, luxury videos, website templates, business ideas', label: 'Keywords' },
  ];
  for (const s of settings) await prisma.setting.create({ data: s });

  console.log('✅ Seed complete.');
  console.log('   Member: member@gmail.com / 1234');
  console.log('   Admin:  admin@gmail.com / 12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
