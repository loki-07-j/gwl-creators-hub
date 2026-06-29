import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { ticketSchema, profileSchema, wishlistAddSchema } from '../validators/member.validator';

const router = Router();
router.use(authenticate); // any signed-in user (members)

router.get('/dashboard', memberController.dashboard);
router.get('/products', memberController.products);
router.get('/catalog', memberController.catalog);
router.post('/redeem', memberController.redeem);
router.post('/favourites/:productId/toggle', memberController.toggleFavourite);
router.get('/downloads', memberController.downloads);
router.get('/releases', memberController.releases);
router.get('/bonus', memberController.bonus);
router.get('/coupons', memberController.coupons);

router.get('/wishlist', memberController.wishlist);
router.post('/wishlist', validate(wishlistAddSchema), memberController.addWishlist);
router.delete('/wishlist/:id', memberController.removeWishlist);

router.get('/invoices', memberController.invoices);
router.get('/membership', memberController.membership);

router.get('/notifications', memberController.notifications);
router.post('/notifications/read-all', memberController.markAllRead);
router.post('/notifications/:id/read', memberController.markRead);

router.get('/referral', memberController.referral);
router.post('/support', validate(ticketSchema), memberController.createTicket);

router.get('/profile', memberController.getProfile);
router.patch('/profile', validate(profileSchema), memberController.updateProfile);

export default router;
