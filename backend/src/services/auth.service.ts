import { UserRole, AuditAction } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { ApiError } from '../utils/ApiError';
import { comparePassword, hashPassword, generateToken, hashToken } from '../utils/password';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/mailer';
import { recordAudit } from './audit.service';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

function refreshExpiryDate(): Date {
  // mirror JWT_REFRESH_EXPIRES (default 7d) for the DB record
  const ms = parseDuration(env.jwt.refreshExpires);
  return new Date(Date.now() + ms);
}

function parseDuration(d: string): number {
  const m = /^(\d+)([smhd])$/.exec(d.trim());
  if (!m) return 7 * 864e5;
  const n = parseInt(m[1], 10);
  const unit = m[2];
  return n * (unit === 's' ? 1e3 : unit === 'm' ? 6e4 : unit === 'h' ? 36e5 : 864e5);
}

function publicUser(u: {
  id: string; name: string; email: string; role: UserRole;
  membership: string; avatarUrl: string | null; status: string;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    membership: u.membership,
    avatarUrl: u.avatarUrl,
    status: u.status,
  };
}

async function issueTokens(user: { id: string; role: UserRole; email: string; name: string }) {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  const { raw, hash } = generateToken();
  const record = await tokenRepository.create(user.id, hash, refreshExpiryDate());
  const refreshToken = signRefreshToken({ sub: user.id, tokenId: record.id });
  // The opaque raw token is what we actually verify on refresh.
  return { accessToken, refreshToken: raw };
}

export const authService = {
  async login(input: LoginInput, ip?: string) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw ApiError.unauthorized('Incorrect email or password');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Incorrect email or password');

    if (user.status === 'SUSPENDED') throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    if (user.status === 'BLOCKED') throw ApiError.forbidden('Your account has been blocked.');

    // The Sign In page lets the user pick a role tab; enforce it matches.
    if (input.role) {
      const wanted = input.role === 'admin' ? UserRole.ADMIN : UserRole.MEMBER;
      if (user.role !== wanted) {
        throw ApiError.unauthorized('Incorrect email or password for the selected role.');
      }
    }

    const tokens = await issueTokens(user);
    await recordAudit({
      actorId: user.id,
      actorName: user.name,
      action: AuditAction.LOGIN,
      change: `Signed in (${user.role})`,
      ip,
    });

    return { user: publicUser(user), ...tokens };
  },

  async refresh(rawToken: string) {
    if (!rawToken) throw ApiError.unauthorized('Refresh token required');
    const tokenHash = hashToken(rawToken);
    const record = await tokenRepository.findValid(tokenHash);
    if (!record) throw ApiError.unauthorized('Invalid or expired refresh token');

    const user = await userRepository.findById(record.userId);
    if (!user) throw ApiError.unauthorized('User no longer exists');

    // rotate: revoke the used token, issue a fresh pair
    await tokenRepository.revoke(record.id);
    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async logout(rawToken?: string) {
    if (!rawToken) return;
    const record = await tokenRepository.findValid(hashToken(rawToken));
    if (record) await tokenRepository.revoke(record.id);
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return {
      ...publicUser(user),
      memberSince: user.memberSince,
      country: user.country,
      phone: user.phone,
      lifetimeSaved: user.lifetimeSaved,
      referralCode: user.referralCode,
      teamRole: user.teamRole,
    };
  },

  async register(input: RegisterInput, ip?: string) {
    const invite = await prisma.signupInvite.findUnique({ where: { token: input.token } });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      throw ApiError.badRequest('Invite link is invalid or has expired');
    }
    const existing = await userRepository.findByEmail(invite.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({
      name: input.name,
      email: invite.email,
      passwordHash: await hashPassword(input.password),
      role: invite.role,
      status: 'ACTIVE',
      membership: invite.role === UserRole.MEMBER ? 'LIFETIME' : 'NONE',
      memberSince: invite.role === UserRole.MEMBER ? new Date() : null,
      referralCode:
        invite.role === UserRole.MEMBER
          ? `${input.name.split(' ')[0].toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`
          : null,
    });

    await prisma.signupInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
    await recordAudit({
      actorId: user.id,
      actorName: user.name,
      action: AuditAction.CREATE,
      change: `Account created via invite (${user.role})`,
      ip,
    });

    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async createInvite(email: string, role: UserRole, actor: { id: string; name: string }) {
    const { raw } = generateToken(24);
    const invite = await prisma.signupInvite.create({
      data: {
        email: email.toLowerCase(),
        token: raw,
        role,
        expiresAt: new Date(Date.now() + 864e5), // valid for 24 hours
      },
    });
    await recordAudit({
      actorId: actor.id,
      actorName: actor.name,
      action: AuditAction.CREATE,
      change: `Issued signup invite for ${email} (${role})`,
    });
    return { id: invite.id, email: invite.email, role: invite.role, token: invite.token, expiresAt: invite.expiresAt };
  },

  // History of recent signup links. Expired links (>24h) are purged, then the latest 10 returned.
  async listInvites() {
    await prisma.signupInvite.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const invites = await prisma.signupInvite.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    return invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      token: i.token,
      used: !!i.usedAt,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
    }));
  },

  // ── Password reset ──────────────────────────────────────────────────────────
  // NB: passwords are bcrypt-hashed and cannot be recovered, so we never email an
  // existing password — we email a one-time link to set a NEW one.
  async requestPasswordReset(email: string) {
    const generic = { message: 'If an account exists for that email, a password reset link has been sent.' };
    const user = await userRepository.findByEmail(email);
    // Always respond the same way — don't reveal which emails are registered.
    if (!user || user.status === 'BLOCKED') return generic;

    const { raw, hash } = generateToken(24);
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour
    });
    const link = `${env.appUrl}/reset-password/${raw}`;
    const { delivered } = await sendPasswordResetEmail(user.email, link);
    await recordAudit({ actorId: user.id, actorName: user.name, action: AuditAction.UPDATE, change: 'Requested password reset' }).catch(() => null);

    // In dev (no SMTP), surface the link so the flow is testable end-to-end.
    return env.isProd || delivered ? generic : { ...generic, devResetLink: link };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    if (!rawToken || newPassword.length < 4) throw ApiError.badRequest('Password must be at least 4 characters');
    const tokenHash = hashToken(rawToken);
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      // Sign the user out everywhere else by revoking active refresh tokens.
      prisma.refreshToken.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await recordAudit({ actorId: reset.userId, actorName: reset.user.name, action: AuditAction.UPDATE, change: 'Password reset completed' }).catch(() => null);
    return { message: 'Your password has been updated. You can now sign in.' };
  },
};
