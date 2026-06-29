import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
  // Public URL of the frontend app — used to build links inside emails.
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),

  upload: {
    dir: process.env.UPLOAD_DIR ?? 'uploads',
    maxMb: parseInt(process.env.MAX_UPLOAD_MB ?? '25', 10),
  },

  // Product assets (banners, covers, gallery, docs). Served by the backend.
  // driver=local reads from `dir`; swap to 's3' in future without touching the frontend.
  assets: {
    driver: process.env.ASSET_STORAGE_DRIVER ?? 'local',
    dir: process.env.ASSETS_DIR ?? '../product-content',
    publicPath: '/api/v1/assets', // logical URL prefix the frontend uses
  },

  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'GWL Creators Hub <no-reply@gwlhub.com>',
  },
};
