import { Request, Response } from 'express';
import { contentService as s } from '../services/content.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent } from '../utils/response';

const actor = (req: Request) => req.user!;

export const contentController = {
  // Coupons
  listCoupons: asyncHandler(async (_req, res) => ok(res, await s.listCoupons())),
  createCoupon: asyncHandler(async (req, res) => created(res, await s.createCoupon(req.body, actor(req)))),
  updateCoupon: asyncHandler(async (req, res) => ok(res, await s.updateCoupon(req.params.id, req.body))),
  toggleCoupon: asyncHandler(async (req, res) => ok(res, await s.toggleCoupon(req.params.id))),
  deleteCoupon: asyncHandler(async (req, res) => { await s.deleteCoupon(req.params.id); return noContent(res); }),

  // Bundles
  listBundles: asyncHandler(async (_req, res) => ok(res, await s.listBundles())),
  createBundle: asyncHandler(async (req, res) => created(res, await s.createBundle(req.body, actor(req)))),
  updateBundle: asyncHandler(async (req, res) => ok(res, await s.updateBundle(req.params.id, req.body))),
  toggleBundle: asyncHandler(async (req, res) => ok(res, await s.toggleBundle(req.params.id))),
  deleteBundle: asyncHandler(async (req, res) => { await s.deleteBundle(req.params.id); return noContent(res); }),

  // Testimonials
  listTestimonials: asyncHandler(async (_req, res) => ok(res, await s.listTestimonials())),
  createTestimonial: asyncHandler(async (req, res) => created(res, await s.createTestimonial(req.body))),
  updateTestimonial: asyncHandler(async (req, res) => ok(res, await s.updateTestimonial(req.params.id, req.body))),
  toggleTestimonial: asyncHandler(async (req, res) => ok(res, await s.toggleTestimonial(req.params.id))),
  deleteTestimonial: asyncHandler(async (req, res) => { await s.deleteTestimonial(req.params.id); return noContent(res); }),

  // Announcements
  listAnnouncements: asyncHandler(async (_req, res) => ok(res, await s.listAnnouncements())),
  createAnnouncement: asyncHandler(async (req, res) => created(res, await s.createAnnouncement(req.body))),
  updateAnnouncement: asyncHandler(async (req, res) => ok(res, await s.updateAnnouncement(req.params.id, req.body))),
  toggleAnnouncement: asyncHandler(async (req, res) => ok(res, await s.toggleAnnouncement(req.params.id))),
  deleteAnnouncement: asyncHandler(async (req, res) => { await s.deleteAnnouncement(req.params.id); return noContent(res); }),

  // FAQs
  listFaqs: asyncHandler(async (_req, res) => ok(res, await s.listFaqs())),
  createFaq: asyncHandler(async (req, res) => created(res, await s.createFaq(req.body))),
  updateFaq: asyncHandler(async (req, res) => ok(res, await s.updateFaq(req.params.id, req.body))),
  toggleFaq: asyncHandler(async (req, res) => ok(res, await s.toggleFaq(req.params.id))),
  deleteFaq: asyncHandler(async (req, res) => { await s.deleteFaq(req.params.id); return noContent(res); }),

  // Landing
  listLanding: asyncHandler(async (_req, res) => ok(res, await s.listLanding())),
  toggleLanding: asyncHandler(async (req, res) => ok(res, await s.toggleLanding(req.params.id))),
};
