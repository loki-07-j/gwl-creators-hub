import { Response } from 'express';

export interface Meta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

/** Standard success envelope used by every controller. */
export function ok<T>(res: Response, data: T, meta?: Meta, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created<T>(res: Response, data: T, meta?: Meta) {
  return ok(res, data, meta, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}
