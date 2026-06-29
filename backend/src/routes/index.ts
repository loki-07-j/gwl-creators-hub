import { Router } from 'express';
import authRoutes from './auth.routes';
import catalogRoutes from './catalog.routes';
import productRoutes from './product.routes';
import memberRoutes from './member.routes';
import adminRoutes from './admin.routes';
import { prisma } from '../config/prisma';

const router = Router();

// Liveness — process is up. Cheap, dependency-free.
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), time: new Date().toISOString() } });
});

// Readiness — only send traffic once the DB is reachable. Suitable for
// load-balancer / orchestrator probes across multiple stateless instances.
router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ready', db: 'up', uptime: process.uptime() } });
  } catch {
    res.status(503).json({ success: false, error: { message: 'Database unavailable' } });
  }
});

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/products', productRoutes);
router.use('/member', memberRoutes);
router.use('/admin', adminRoutes);

export default router;
