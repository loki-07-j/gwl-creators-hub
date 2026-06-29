import { Request } from 'express';

export interface PageParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  search?: string;
  sortBy?: string;
  sortDir: 'asc' | 'desc';
}

export function parsePagination(req: Request, defaults?: Partial<PageParams>): PageParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.pageSize ?? defaults?.pageSize ?? '20'), 10) || 20),
  );
  const search = (req.query.search ?? req.query.q) as string | undefined;
  const sortBy = (req.query.sortBy as string | undefined) ?? defaults?.sortBy;
  const sortDir = (req.query.sortDir === 'asc' ? 'asc' : req.query.sortDir === 'desc'
    ? 'desc'
    : defaults?.sortDir) ?? 'desc';

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: search?.trim() || undefined,
    sortBy,
    sortDir,
  };
}

export function pageMeta(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
