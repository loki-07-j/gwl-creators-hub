/**
 * Storage-provider abstraction for product assets.
 *
 * The HTTP layer only ever talks to this interface, never the filesystem
 * directly. Today the only implementation is {@link LocalAssetStorage} which
 * reads from the committed `product-content/` folder. To migrate to AWS S3 (or
 * any other provider) later, add a new implementation that returns a
 * `redirectUrl` (e.g. a pre-signed URL) — the asset API contract and every
 * frontend URL stay exactly the same.
 */
export interface AssetLocation {
  /** Absolute filesystem path to stream (local provider). */
  filePath?: string;
  /** A URL to redirect the client to (e.g. S3 pre-signed URL). */
  redirectUrl?: string;
  /** Optional explicit content-type. */
  contentType?: string;
}

export interface AssetStorage {
  /** Resolve a logical asset key (e.g. "ideas-hub/banner.png") to a location, or null if missing. */
  getAsset(key: string): Promise<AssetLocation | null>;
}
