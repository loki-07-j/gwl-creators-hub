import path from 'path';
import fs from 'fs/promises';
import { AssetLocation, AssetStorage } from './types';

/** Serves product assets from a local directory (the committed `product-content/`). */
export class LocalAssetStorage implements AssetStorage {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
  }

  async getAsset(key: string): Promise<AssetLocation | null> {
    // Normalise and block path traversal — the resolved path must stay inside baseDir.
    const cleanKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    const fullPath = path.resolve(this.baseDir, cleanKey);
    const rel = path.relative(this.baseDir, fullPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;

    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) return null;
    } catch {
      return null;
    }
    return { filePath: fullPath };
  }
}
