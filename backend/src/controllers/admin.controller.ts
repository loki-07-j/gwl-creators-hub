import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent } from '../utils/response';
import { parsePagination, pageMeta } from '../utils/pagination';
import { env } from '../config/env';

export const adminController = {
  dashboard: asyncHandler(async (_req, res) => ok(res, await adminService.dashboard())),

  customers: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req, { pageSize: 20 });
    const { items, total, memberCount } = await adminService.customers({ skip: p.skip, take: p.take, search: p.search });
    return ok(res, items, { ...pageMeta(total, p.page, p.pageSize), memberCount });
  }),

  updateMember: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.updateMember(req.params.id, req.body, req.user!)),
  ),

  setMemberStatus: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.setMemberStatus(req.params.id, req.body.status, req.user!)),
  ),

  deleteMember: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteMember(req.params.id, req.user!);
    return noContent(res);
  }),

  audit: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req, { pageSize: 30 });
    const { items, total } = await adminService.audit({ skip: p.skip, take: p.take });
    return ok(res, items, pageMeta(total, p.page, p.pageSize));
  }),

  settings: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.settings(req.query.group as string | undefined)),
  ),

  updateSettings: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.updateSettings(req.params.group, req.body, req.user!)),
  ),

  rbac: asyncHandler(async (_req, res) => ok(res, await adminService.rbac())),

  setPermission: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.setPermission(req.body.roleId, req.body.module, req.body.allowed, req.user!)),
  ),

  createRole: asyncHandler(async (req: Request, res: Response) =>
    created(res, await adminService.createRole(req.body.name, req.user!)),
  ),

  updateRole: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.updateRole(req.params.id, req.body.name, req.user!)),
  ),

  deleteRole: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteRole(req.params.id, req.user!);
    return noContent(res);
  }),

  createTeamMember: asyncHandler(async (req: Request, res: Response) =>
    created(res, await adminService.createTeamMember(req.body, req.user!)),
  ),

  updateTeamMember: asyncHandler(async (req: Request, res: Response) =>
    ok(res, await adminService.updateTeamMember(req.params.id, req.body, req.user!)),
  ),

  deleteTeamMember: asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteTeamMember(req.params.id, req.user!);
    return noContent(res);
  }),

  // exposes API base so the front-end can resolve uploaded file URLs
  config: asyncHandler(async (_req, res) => ok(res, { apiPrefix: env.apiPrefix })),
};
