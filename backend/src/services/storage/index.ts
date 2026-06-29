import path from 'path';
import { env } from '../../config/env';
import { AssetStorage } from './types';
import { LocalAssetStorage } from './localAssetStorage';

/**
 * The active asset storage provider, chosen by ASSET_STORAGE_DRIVER.
 *
 * Future: `case 's3': return new S3AssetStorage(env.assets.bucket, …)`.
 * Nothing else in the app (controllers, routes, frontend URLs) changes.
 */
function createAssetStorage(): AssetStorage {
  switch (env.assets.driver) {
    case 'local':
    default:
      return new LocalAssetStorage(path.resolve(process.cwd(), env.assets.dir));
  }
}

export const assetStorage = createAssetStorage();
export type { AssetStorage, AssetLocation } from './types';
