import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export const productRepository = {
  async list(params: {
    skip: number;
    take: number;
    search?: string;
    category?: string;
    status?: ProductStatus;
    sortBy?: string;
    sortDir: 'asc' | 'desc';
  }) {
    const where: Prisma.ProductWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.category && params.category !== 'all' ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { category: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput = params.sortBy
      ? { [params.sortBy]: params.sortDir }
      : { sortOrder: 'asc' };

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip: params.skip, take: params.take, orderBy }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { releases: { orderBy: { releasedAt: 'desc' } } } });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: { releases: { orderBy: { releasedAt: 'desc' } } } });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  addRelease(productId: string, data: Omit<Prisma.ProductReleaseCreateInput, 'product'>) {
    return prisma.productRelease.create({ data: { ...data, product: { connect: { id: productId } } } });
  },

  reorder(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) => prisma.product.update({ where: { id }, data: { sortOrder: index } })),
    );
  },
};
