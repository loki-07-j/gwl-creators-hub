import rateLimit from 'express-rate-limit';

/** Generous global limiter — protects against abuse without hurting normal use. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please slow down.' } },
});

/** Strict limiter for auth endpoints to blunt credential-stuffing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: { message: 'Too many attempts, try again later.' } },
});
