import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller';

const router = Router();

router.get('/products', catalogController.products);
router.get('/products/:slug', catalogController.productBySlug);
router.get('/bundles', catalogController.bundles);
router.get('/testimonials', catalogController.testimonials);
router.get('/faqs', catalogController.faqs);
router.get('/announcements', catalogController.announcements);
router.get('/landing', catalogController.landing);

export default router;
