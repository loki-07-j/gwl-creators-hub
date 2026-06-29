import { api, unwrap } from '@/lib/api';

export const adminApi = {
  dashboard: () => unwrap(api.get('/admin/dashboard')),

  // Products (managed via /products)
  listProducts: (params?: Record<string, unknown>) =>
    api.get('/products', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta })),
  getProduct: (id: string) => unwrap(api.get(`/products/${id}`)),
  createProduct: (body: Record<string, unknown>) => unwrap(api.post('/products', body)),
  updateProduct: (id: string, body: Record<string, unknown>) => unwrap(api.patch(`/products/${id}`, body)),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  bulkProducts: (action: string, ids: string[]) => unwrap(api.post('/products/bulk', { action, ids })),
  reorderProducts: (ids: string[]) => unwrap(api.post('/products/reorder', { ids })),

  // Members (registered customers)
  listCustomers: (params?: Record<string, unknown>) =>
    api.get('/admin/customers', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta })),
  updateMember: (id: string, body: Record<string, unknown>) => unwrap(api.patch(`/admin/customers/${id}`, body)),
  setMemberStatus: (id: string, status: string) => unwrap(api.patch(`/admin/customers/${id}/status`, { status })),
  deleteMember: (id: string) => api.delete(`/admin/customers/${id}`),

  // Coupons / Bundles / CMS
  coupons: () => unwrap(api.get('/admin/coupons')),
  createCoupon: (b: Record<string, unknown>) => unwrap(api.post('/admin/coupons', b)),
  updateCoupon: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/coupons/${id}`, b)),
  toggleCoupon: (id: string) => unwrap(api.post(`/admin/coupons/${id}/toggle`)),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),

  bundles: () => unwrap(api.get('/admin/bundles')),
  createBundle: (b: Record<string, unknown>) => unwrap(api.post('/admin/bundles', b)),
  updateBundle: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/bundles/${id}`, b)),
  toggleBundle: (id: string) => unwrap(api.post(`/admin/bundles/${id}/toggle`)),
  deleteBundle: (id: string) => api.delete(`/admin/bundles/${id}`),

  testimonials: () => unwrap(api.get('/admin/testimonials')),
  createTestimonial: (b: Record<string, unknown>) => unwrap(api.post('/admin/testimonials', b)),
  updateTestimonial: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/testimonials/${id}`, b)),
  toggleTestimonial: (id: string) => unwrap(api.post(`/admin/testimonials/${id}/toggle`)),
  deleteTestimonial: (id: string) => api.delete(`/admin/testimonials/${id}`),

  announcements: () => unwrap(api.get('/admin/announcements')),
  createAnnouncement: (b: Record<string, unknown>) => unwrap(api.post('/admin/announcements', b)),
  updateAnnouncement: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/announcements/${id}`, b)),
  toggleAnnouncement: (id: string) => unwrap(api.post(`/admin/announcements/${id}/toggle`)),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

  faqs: () => unwrap(api.get('/admin/faqs')),
  createFaq: (b: Record<string, unknown>) => unwrap(api.post('/admin/faqs', b)),
  updateFaq: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/faqs/${id}`, b)),
  toggleFaq: (id: string) => unwrap(api.post(`/admin/faqs/${id}/toggle`)),
  deleteFaq: (id: string) => api.delete(`/admin/faqs/${id}`),

  landing: () => unwrap(api.get('/admin/landing')),
  toggleLanding: (id: string) => unwrap(api.post(`/admin/landing/${id}/toggle`)),

  rbac: () => unwrap(api.get('/admin/rbac')),
  setPermission: (roleId: string, module: string, allowed: boolean) =>
    unwrap(api.post('/admin/rbac/permission', { roleId, module, allowed })),
  createRole: (name: string) => unwrap(api.post('/admin/rbac/roles', { name })),
  updateRole: (id: string, name: string) => unwrap(api.patch(`/admin/rbac/roles/${id}`, { name })),
  deleteRole: (id: string) => api.delete(`/admin/rbac/roles/${id}`),
  createTeamMember: (b: Record<string, unknown>) => unwrap(api.post('/admin/rbac/team', b)),
  updateTeamMember: (id: string, b: Record<string, unknown>) => unwrap(api.patch(`/admin/rbac/team/${id}`, b)),
  deleteTeamMember: (id: string) => api.delete(`/admin/rbac/team/${id}`),

  audit: (params?: Record<string, unknown>) =>
    api.get('/admin/audit', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta })),

  settings: (group?: string) => unwrap(api.get('/admin/settings', { params: { group } })),
  updateSettings: (group: string, values: Record<string, string>) =>
    unwrap(api.patch(`/admin/settings/${group}`, values)),

  createInvite: (email: string, role: 'MEMBER' | 'ADMIN') => unwrap(api.post('/auth/invites', { email, role })),
  listInvites: () => unwrap(api.get('/auth/invites')),
};
