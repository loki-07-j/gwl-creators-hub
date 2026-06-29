import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { productCreateSchema, productPatchSchema, releaseCreateSchema } from '../validators/product.validator';

const router = Router();

// All product management endpoints are admin-only. Public catalog reads live
// under /catalog.
router.use(authenticate, requireAdmin);

router.get('/', productController.list);
router.post('/', validate(productCreateSchema), productController.create);
router.post('/bulk', productController.bulk);
router.post('/reorder', productController.reorder);
router.get('/:id', productController.getOne);
router.patch('/:id', validate(productPatchSchema), productController.update);
router.delete('/:id', productController.remove);
router.post('/:id/releases', validate(releaseCreateSchema), productController.addRelease);

export default router;
