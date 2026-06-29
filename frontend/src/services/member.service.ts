import { api, unwrap } from '@/lib/api';

export const memberApi = {
  dashboard: () => unwrap(api.get('/member/dashboard')),
  products: (category?: string) => unwrap(api.get('/member/products', { params: { category } })),
  catalog: (category?: string) => unwrap(api.get('/member/catalog', { params: { category } })),
  redeem: (productId: string, code: string) => unwrap(api.post('/member/redeem', { productId, code })),
  toggleFavourite: (productId: string) => unwrap(api.post(`/member/favourites/${productId}/toggle`)),
  downloads: () => unwrap(api.get('/member/downloads')),
  releases: () => unwrap(api.get('/member/releases')),
  bonus: () => unwrap(api.get('/member/bonus')),
  coupons: () => unwrap(api.get('/member/coupons')),
  wishlist: () => unwrap(api.get('/member/wishlist')),
  removeWishlist: (id: string) => api.delete(`/member/wishlist/${id}`),
  invoices: () => unwrap(api.get('/member/invoices')),
  membership: () => unwrap(api.get('/member/membership')),
  notifications: (category?: string) => unwrap(api.get('/member/notifications', { params: { category } })),
  markRead: (id: string) => api.post(`/member/notifications/${id}/read`),
  markAllRead: () => api.post('/member/notifications/read-all'),
  referral: () => unwrap(api.get('/member/referral')),
  createTicket: (body: { type?: string; product?: string; message: string }) =>
    unwrap(api.post('/member/support', body)),
  getProfile: () => unwrap(api.get('/member/profile')),
  updateProfile: (body: Record<string, unknown>) => unwrap(api.patch('/member/profile', body)),
};
