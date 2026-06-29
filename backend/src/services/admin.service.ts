import { OrderStatus, AuditAction, UserStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { recordAudit } from './audit.service';
import { hashPassword } from '../utils/password';

const MEMBER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BLOCKED'] as const;
const RBAC_MODULES = ['Products', 'Bundles', 'Orders', 'Customers', 'Coupons', 'Content', 'Analytics', 'Settings'];
const slugify = (s: string) =>
  s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'ROLE';

export const adminService = {
  async dashboard() {
    const [revenueAgg, orderCount, memberCount, refundCount, products, recentOrders] = await Promise.all([
      prisma.order.aggregate({ where: { status: OrderStatus.PAID }, _sum: { amount: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { membership: 'LIFETIME' } }),
      prisma.order.count({ where: { status: OrderStatus.REFUNDED } }),
      prisma.product.findMany({ orderBy: { priceMember: 'desc' }, take: 4 }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }),
    ]);

    const totalRevenue = revenueAgg._sum.amount ?? 0;
    const refundRate = orderCount ? (refundCount / orderCount) * 100 : 0;

    return {
      kpis: {
        revenue: totalRevenue,
        orders: orderCount,
        newMembers: memberCount,
        refundRate: Number(refundRate.toFixed(1)),
      },
      topProducts: products.map((p) => ({ icon: p.icon, name: p.name, revenue: p.priceMember * 100 })),
      recentOrders: recentOrders.map((o) => ({
        customer: o.customerName,
        product: o.items[0]?.label ?? '—',
        amount: o.amount,
        status: o.status,
      })),
    };
  },

  // ── Members ─────────────────────────────────────────────────────────────────
  async customers(params: { skip: number; take: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
          ],
          role: 'MEMBER' as const,
        }
      : { role: 'MEMBER' as const };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          orders: { where: { status: OrderStatus.PAID }, select: { amount: true } },
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      country: u.country,
      initial: u.name[0]?.toUpperCase() ?? '?',
      orders: u._count.orders,
      spent: u.orders.reduce((s, o) => s + o.amount, 0),
      membership: u.membership,
      type: u.membership === 'LIFETIME' ? 'Member' : 'Guest',
      status: u.status,
      joined: u.createdAt,
    }));

    const memberCount = await prisma.user.count({ where: { membership: 'LIFETIME' } });
    return { items, total, memberCount };
  },

  // ── Member management ───────────────────────────────────────────────────────
  async updateMember(id: string, data: Record<string, any>, actor: { id: string; name: string }) {
    const member = await prisma.user.findFirst({ where: { id, role: 'MEMBER' } });
    if (!member) throw ApiError.notFound('Member not found');

    const patch: Record<string, any> = {};
    for (const key of ['name', 'email', 'phone', 'country'] as const) {
      if (typeof data[key] === 'string') patch[key] = data[key].trim();
    }
    if (data.membership === 'LIFETIME' || data.membership === 'NONE') {
      patch.membership = data.membership;
      if (data.membership === 'LIFETIME' && !member.memberSince) patch.memberSince = new Date();
    }
    if (!patch.name && patch.name !== undefined) throw ApiError.badRequest('Name cannot be empty');

    if (patch.email && patch.email !== member.email) {
      const clash = await prisma.user.findUnique({ where: { email: patch.email } });
      if (clash) throw ApiError.conflict('Another account already uses that email');
    }

    const updated = await prisma.user.update({ where: { id }, data: patch });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Updated member ${updated.name}` });
    return updated;
  },

  async setMemberStatus(id: string, status: string, actor: { id: string; name: string }) {
    const next = status.toUpperCase();
    if (!MEMBER_STATUSES.includes(next as any)) throw ApiError.badRequest('Invalid status');
    const member = await prisma.user.findFirst({ where: { id, role: 'MEMBER' } });
    if (!member) throw ApiError.notFound('Member not found');
    const updated = await prisma.user.update({ where: { id }, data: { status: next as UserStatus } });
    const label = next === 'ACTIVE' ? 'Activated' : next === 'SUSPENDED' ? 'Deactivated' : 'Permanently blocked';
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `${label} member ${updated.name}` });
    return { id: updated.id, status: updated.status };
  },

  async deleteMember(id: string, actor: { id: string; name: string }) {
    const member = await prisma.user.findFirst({ where: { id, role: 'MEMBER' } });
    if (!member) throw ApiError.notFound('Member not found');
    // Orders/invoices keep history (userId set null on delete); entitlements, wishlist,
    // notifications, referrals and tokens cascade away with the account.
    await prisma.user.delete({ where: { id } });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.DELETE, change: `Deleted member ${member.name} (${member.email})` });
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  async audit(params: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count(),
    ]);
    return { items, total };
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  async settings(group?: string) {
    const settings = await prisma.setting.findMany({
      where: group ? { group } : {},
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    if (group) return settings;
    // group into a map
    return settings.reduce<Record<string, typeof settings>>((acc, s) => {
      (acc[s.group] ??= []).push(s);
      return acc;
    }, {});
  },

  async updateSettings(group: string, values: Record<string, string>, actor: { id: string; name: string }) {
    const updates = Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { group_key: { group, key } },
        create: { group, key, value: String(value) },
        update: { value: String(value) },
      }),
    );
    await prisma.$transaction(updates);
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Updated ${group} settings` });
    return adminService.settings(group);
  },

  // ── RBAC ──────────────────────────────────────────────────────────────────
  async rbac() {
    const [roles, team] = await Promise.all([
      prisma.role.findMany({ include: { permissions: true }, orderBy: [{ locked: 'desc' }, { name: 'asc' }] }),
      prisma.user.findMany({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } }),
    ]);
    const modules = RBAC_MODULES;
    return {
      modules,
      roles: roles.map((r) => ({ id: r.id, key: r.key, name: r.name, locked: r.locked })),
      matrix: roles.map((r) => ({
        roleId: r.id,
        roleKey: r.key,
        cells: modules.map((m) => ({
          module: m,
          allowed: r.permissions.find((p) => p.module === m)?.allowed ?? false,
          locked: r.locked,
        })),
      })),
      team: team.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        initial: u.name[0]?.toUpperCase() ?? '?',
        role: u.teamRole,
        status: u.status,
      })),
    };
  },

  async setPermission(roleId: string, module: string, allowed: boolean, actor: { id: string; name: string }) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw ApiError.notFound('Role not found');
    if (role.locked) throw ApiError.forbidden('Super Admin has full access');
    const perm = await prisma.permission.upsert({
      where: { roleId_module: { roleId, module } },
      create: { roleId, module, allowed },
      update: { allowed },
    });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `${allowed ? 'Granted' : 'Revoked'} ${module} for ${role.name}` });
    return perm;
  },

  // ── Role CRUD (a role = a team access profile) ──────────────────────────────
  async createRole(name: string, actor: { id: string; name: string }) {
    const clean = (name ?? '').trim();
    if (clean.length < 2) throw ApiError.badRequest('Role name must be at least 2 characters');

    let key = slugify(clean);
    const existing = await prisma.role.findMany({ where: { key: { startsWith: key } }, select: { key: true } });
    if (existing.some((r) => r.key === key)) key = `${key}_${existing.length + 1}`;

    const role = await prisma.role.create({
      data: {
        key,
        name: clean,
        locked: false,
        permissions: { create: RBAC_MODULES.map((m) => ({ module: m, allowed: false })) },
      },
      include: { permissions: true },
    });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.CREATE, change: `Created role ${role.name}` });
    return role;
  },

  async updateRole(id: string, name: string, actor: { id: string; name: string }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw ApiError.notFound('Role not found');
    if (role.locked) throw ApiError.forbidden('This role cannot be renamed');
    const clean = (name ?? '').trim();
    if (clean.length < 2) throw ApiError.badRequest('Role name must be at least 2 characters');
    const updated = await prisma.role.update({ where: { id }, data: { name: clean } });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Renamed role to ${updated.name}` });
    return updated;
  },

  async deleteRole(id: string, actor: { id: string; name: string }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw ApiError.notFound('Role not found');
    if (role.locked) throw ApiError.forbidden('This role cannot be deleted');
    const inUse = await prisma.user.count({ where: { teamRole: role.key } });
    if (inUse > 0) throw ApiError.conflict(`${inUse} team member(s) still use this role`);
    await prisma.role.delete({ where: { id } });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.DELETE, change: `Deleted role ${role.name}` });
  },

  // ── Team members (admin users) ──────────────────────────────────────────────
  async createTeamMember(data: Record<string, any>, actor: { id: string; name: string }) {
    const name = (data.name ?? '').trim();
    const email = (data.email ?? '').trim().toLowerCase();
    const password = data.password ?? '';
    if (name.length < 2) throw ApiError.badRequest('Name is required');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw ApiError.badRequest('A valid email is required');
    if (password.length < 4) throw ApiError.badRequest('Password must be at least 4 characters');
    if (await prisma.user.findUnique({ where: { email } })) throw ApiError.conflict('That email is already in use');
    const role = await prisma.role.findUnique({ where: { key: data.teamRole } });
    if (!role) throw ApiError.badRequest('Pick a valid role');

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: 'ADMIN', teamRole: role.key, status: 'ACTIVE' },
    });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.CREATE, change: `Added team member ${name} (${role.name})` });
    return { id: user.id, name: user.name, email: user.email, teamRole: user.teamRole, status: user.status };
  },

  async updateTeamMember(id: string, data: Record<string, any>, actor: { id: string; name: string }) {
    const member = await prisma.user.findFirst({ where: { id, role: 'ADMIN' } });
    if (!member) throw ApiError.notFound('Team member not found');

    const patch: Record<string, any> = {};
    if (typeof data.name === 'string' && data.name.trim()) patch.name = data.name.trim();
    if (typeof data.email === 'string' && data.email.trim()) {
      const email = data.email.trim().toLowerCase();
      if (email !== member.email) {
        if (await prisma.user.findUnique({ where: { email } })) throw ApiError.conflict('That email is already in use');
        patch.email = email;
      }
    }
    if (typeof data.teamRole === 'string') {
      const role = await prisma.role.findUnique({ where: { key: data.teamRole } });
      if (!role) throw ApiError.badRequest('Pick a valid role');
      if (member.teamRole === 'SUPER_ADMIN' && role.key !== 'SUPER_ADMIN') throw ApiError.forbidden('The Super Admin role cannot be changed');
      patch.teamRole = role.key;
    }
    if (typeof data.status === 'string' && ['ACTIVE', 'SUSPENDED', 'INVITED'].includes(data.status)) patch.status = data.status as UserStatus;
    if (data.password && String(data.password).length >= 4) patch.passwordHash = await hashPassword(String(data.password));

    const updated = await prisma.user.update({ where: { id }, data: patch });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Updated team member ${updated.name}` });
    return { id: updated.id, name: updated.name, email: updated.email, teamRole: updated.teamRole, status: updated.status };
  },

  async deleteTeamMember(id: string, actor: { id: string; name: string }) {
    const member = await prisma.user.findFirst({ where: { id, role: 'ADMIN' } });
    if (!member) throw ApiError.notFound('Team member not found');
    if (member.id === actor.id) throw ApiError.badRequest('You cannot remove your own account');
    if (member.teamRole === 'SUPER_ADMIN') throw ApiError.forbidden('The Super Admin cannot be removed');
    await prisma.user.delete({ where: { id } });
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.DELETE, change: `Removed team member ${member.name}` });
  },
};
