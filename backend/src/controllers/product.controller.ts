import { Request, Response } from 'express';
import { ProductStatus } from '@prisma/client';
import { productService } from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent } from '../utils/response';
import { parsePagination, pageMeta } from '../utils/pagination';

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req, { pageSize: 20, sortBy: 'sortOrder', sortDir: 'asc' });
    const status = req.query.status as ProductStatus | undefined;
    const { items, total } = await productService.list({
      skip: p.skip,
      take: p.take,
      search: p.search,
      category: req.query.category as string | undefined,
      status,
      sortBy: p.sortBy,
      sortDir: p.sortDir,
    });
    return ok(res, items, pageMeta(total, p.page, p.pageSize));
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    return ok(res, product);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getBySlug(req.params.slug);
    return ok(res, product);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body, req.user!);
    return created(res, product);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body, req.user!);
    return ok(res, product);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productService.remove(req.params.id, req.user!);
    return noContent(res);
  }),

  bulk: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.bulk(req.body.action, req.body.ids ?? [], req.user!);
    return ok(res, result);
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.reorder(req.body.ids ?? [], req.user!);
    return ok(res, result);
  }),

  addRelease: asyncHandler(async (req: Request, res: Response) => {
    const release = await productService.addRelease(req.params.id, req.body);
    return created(res, release);
  }),
};
