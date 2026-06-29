import { Request, Response } from 'express';
import { memberService } from '../services/member.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent } from '../utils/response';

const uid = (req: Request) => req.user!.id;

export const memberController = {
  dashboard: asyncHandler(async (req, res) => ok(res, await memberService.dashboard(uid(req)))),
  products: asyncHandler(async (req, res) => ok(res, await memberService.products(uid(req), req.query.category as string | undefined))),
  catalog: asyncHandler(async (req, res) => ok(res, await memberService.catalog(uid(req), req.query.category as string | undefined))),
  redeem: asyncHandler(async (req: Request, res: Response) => created(res, await memberService.redeem(uid(req), req.body.productId, req.body.code))),
  toggleFavourite: asyncHandler(async (req: Request, res: Response) => ok(res, await memberService.toggleFavourite(uid(req), req.params.productId))),
  downloads: asyncHandler(async (req, res) => ok(res, await memberService.downloads(uid(req)))),
  releases: asyncHandler(async (req, res) => ok(res, await memberService.releases(uid(req)))),
  bonus: asyncHandler(async (_req, res) => ok(res, await memberService.bonus())),
  coupons: asyncHandler(async (_req, res) => ok(res, await memberService.coupons())),

  wishlist: asyncHandler(async (req, res) => ok(res, await memberService.wishlist(uid(req)))),
  addWishlist: asyncHandler(async (req: Request, res: Response) => created(res, await memberService.addWishlist(uid(req), req.body.productId))),
  removeWishlist: asyncHandler(async (req, res) => {
    await memberService.removeWishlist(uid(req), req.params.id);
    return noContent(res);
  }),

  invoices: asyncHandler(async (req, res) => ok(res, await memberService.invoices(uid(req)))),
  membership: asyncHandler(async (req, res) => ok(res, await memberService.membership(uid(req)))),

  notifications: asyncHandler(async (req, res) => ok(res, await memberService.notifications(uid(req), req.query.category as string | undefined))),
  markRead: asyncHandler(async (req, res) => ok(res, await memberService.markNotificationRead(uid(req), req.params.id))),
  markAllRead: asyncHandler(async (req, res) => ok(res, await memberService.markAllRead(uid(req)))),

  referral: asyncHandler(async (req, res) => ok(res, await memberService.referral(uid(req)))),
  createTicket: asyncHandler(async (req: Request, res: Response) => created(res, await memberService.createTicket(uid(req), req.body))),

  getProfile: asyncHandler(async (req, res) => ok(res, await memberService.getProfile(uid(req)))),
  updateProfile: asyncHandler(async (req: Request, res: Response) => ok(res, await memberService.updateProfile(uid(req), req.body))),
};
