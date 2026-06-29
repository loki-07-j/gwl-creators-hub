import { Router } from 'express';
import { assetController } from '../controllers/asset.controller';

// Mounted at `${apiPrefix}/assets`; the rest of the path is the asset key.
const router = Router();
router.get('*', assetController.serve);

export default router;
