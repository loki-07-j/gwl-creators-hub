import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { authService } from '../services/auth.service';
import { ok, created } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const REFRESH_COOKIE = 'refreshToken';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: 7 * 864e5,
    path: '/',
  });
}

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body, req.ip);
    setRefreshCookie(res, result.refreshToken);
    return ok(res, { user: result.user, accessToken: result.accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const raw = req.cookies?.refreshToken ?? req.body?.refreshToken;
    const result = await authService.refresh(raw);
    setRefreshCookie(res, result.refreshToken);
    return ok(res, { user: result.user, accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.cookies?.refreshToken ?? req.body?.refreshToken);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return ok(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const me = await authService.me(req.user!.id);
    return ok(res, me);
  }),

  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, req.ip);
    setRefreshCookie(res, result.refreshToken);
    return created(res, { user: result.user, accessToken: result.accessToken });
  }),

  createInvite: asyncHandler(async (req: Request, res: Response) => {
    const role = req.body.role === 'ADMIN' ? UserRole.ADMIN : UserRole.MEMBER;
    const invite = await authService.createInvite(req.body.email, role, req.user!);
    return created(res, invite);
  }),

  listInvites: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await authService.listInvites());
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await authService.requestPasswordReset(req.body.email));
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await authService.resetPassword(req.body.token, req.body.password));
  }),
};
