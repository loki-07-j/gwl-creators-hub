import { ProductStatus, AuditAction } from '@prisma/client';
import { productRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { recordAudit } from './audit.service';

export const productService = {
  list(params: Parameters<typeof productRepository.list>[0]) {
    return productRepository.list(params);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async create(data: any, actor: { id: string; name: string }) {
    const product = await productRepository.create(data);
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.CREATE, change: `Created product ${product.name}` });
    return product;
  },

  async update(id: string, data: any, actor: { id: string; name: string }) {
    await productService.getById(id);
    const wasPublish = data.status === ProductStatus.PUBLISHED;
    const product = await productRepository.update(id, data);
    await recordAudit({
      actorId: actor.id,
      actorName: actor.name,
      action: wasPublish ? AuditAction.PUBLISH : AuditAction.UPDATE,
      change: wasPublish ? `Published ${product.name} ${product.version}` : `Updated product ${product.name}`,
    });
    return product;
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const product = await productService.getById(id);
    await productRepository.delete(id);
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.DELETE, change: `Deleted product ${product.name}` });
  },

  async bulk(action: string, ids: string[], actor: { id: string; name: string }) {
    if (!ids.length) throw ApiError.badRequest('No products selected');
    const map: Record<string, ProductStatus | 'DELETE'> = {
      publish: ProductStatus.PUBLISHED,
      archive: ProductStatus.ARCHIVED,
      draft: ProductStatus.DRAFT,
      delete: 'DELETE',
    };
    const op = map[action];
    if (!op) throw ApiError.badRequest('Unknown bulk action');
    if (op === 'DELETE') {
      await Promise.all(ids.map((id) => productRepository.delete(id).catch(() => null)));
    } else {
      await Promise.all(ids.map((id) => productRepository.update(id, { status: op }).catch(() => null)));
    }
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Bulk ${action} on ${ids.length} product(s)` });
    return { affected: ids.length };
  },

  addRelease(productId: string, data: any) {
    return productRepository.addRelease(productId, data);
  },

  async reorder(ids: string[], actor: { id: string; name: string }) {
    if (!Array.isArray(ids) || ids.length === 0) throw ApiError.badRequest('No product order provided');
    await productRepository.reorder(ids);
    await recordAudit({ actorId: actor.id, actorName: actor.name, action: AuditAction.UPDATE, change: `Reordered ${ids.length} products` });
    return { reordered: ids.length };
  },
};
