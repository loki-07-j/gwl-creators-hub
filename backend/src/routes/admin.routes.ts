import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { contentController as c } from '../controllers/content.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Members (registered customers)
router.get('/customers', adminController.customers);
router.patch('/customers/:id', adminController.updateMember);
router.patch('/customers/:id/status', adminController.setMemberStatus);
router.delete('/customers/:id', adminController.deleteMember);

// Coupons
router.get('/coupons', c.listCoupons);
router.post('/coupons', c.createCoupon);
router.patch('/coupons/:id', c.updateCoupon);
router.post('/coupons/:id/toggle', c.toggleCoupon);
router.delete('/coupons/:id', c.deleteCoupon);

// Bundles
router.get('/bundles', c.listBundles);
router.post('/bundles', c.createBundle);
router.patch('/bundles/:id', c.updateBundle);
router.post('/bundles/:id/toggle', c.toggleBundle);
router.delete('/bundles/:id', c.deleteBundle);

// Testimonials
router.get('/testimonials', c.listTestimonials);
router.post('/testimonials', c.createTestimonial);
router.patch('/testimonials/:id', c.updateTestimonial);
router.post('/testimonials/:id/toggle', c.toggleTestimonial);
router.delete('/testimonials/:id', c.deleteTestimonial);

// Announcements
router.get('/announcements', c.listAnnouncements);
router.post('/announcements', c.createAnnouncement);
router.patch('/announcements/:id', c.updateAnnouncement);
router.post('/announcements/:id/toggle', c.toggleAnnouncement);
router.delete('/announcements/:id', c.deleteAnnouncement);

// FAQs
router.get('/faqs', c.listFaqs);
router.post('/faqs', c.createFaq);
router.patch('/faqs/:id', c.updateFaq);
router.post('/faqs/:id/toggle', c.toggleFaq);
router.delete('/faqs/:id', c.deleteFaq);

// Landing CMS
router.get('/landing', c.listLanding);
router.post('/landing/:id/toggle', c.toggleLanding);

// RBAC + role CRUD
router.get('/rbac', adminController.rbac);
router.post('/rbac/permission', adminController.setPermission);
router.post('/rbac/roles', adminController.createRole);
router.patch('/rbac/roles/:id', adminController.updateRole);
router.delete('/rbac/roles/:id', adminController.deleteRole);
router.post('/rbac/team', adminController.createTeamMember);
router.patch('/rbac/team/:id', adminController.updateTeamMember);
router.delete('/rbac/team/:id', adminController.deleteTeamMember);

// Audit logs
router.get('/audit', adminController.audit);

// Settings & SEO (seo is just a settings group)
router.get('/settings', adminController.settings);
router.patch('/settings/:group', adminController.updateSettings);

export default router;
