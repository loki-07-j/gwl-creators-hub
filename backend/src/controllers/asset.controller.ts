import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { assetStorage } from '../services/storage';

/**
 * Public, read-only product-asset gateway. The frontend requests assets by
 * logical key (e.g. /api/v1/assets/ideas-hub/banner.png); the storage provider
 * decides where they actually live (local folder today, S3 tomorrow).
 */
export const assetController = {
  serve: asyncHandler(async (req: Request, res: Response) => {
    const key = decodeURIComponent(req.path.replace(/^\/+/, ''));
    if (!key) throw ApiError.notFound('Asset not found');

    const location = await assetStorage.getAsset(key);
    if (!location) throw ApiError.notFound('Asset not found');

    if (location.redirectUrl) return res.redirect(location.redirectUrl);
    return res.sendFile(location.filePath!, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  }),
};
