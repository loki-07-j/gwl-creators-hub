import { api, unwrap } from '@/lib/api';

export const catalogApi = {
  products: () => unwrap(api.get('/catalog/products')),
  bundles: () => unwrap(api.get('/catalog/bundles')),
  testimonials: () => unwrap(api.get('/catalog/testimonials')),
  faqs: () => unwrap(api.get('/catalog/faqs')),
  announcements: () => unwrap(api.get('/catalog/announcements')),
  landing: () => unwrap(api.get('/catalog/landing')),
};
