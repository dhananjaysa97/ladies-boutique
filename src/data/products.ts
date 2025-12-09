import { prisma } from '@/lib/prisma';
import { Product, Size, SavedProduct } from '@/lib/types';

function mapPrismaProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    category: p.category,
    sizes: (p.sizes ?? []) as Size[],
    color: p.color ?? undefined,
    isHot: p.isHot,
    isLatest: p.isLatest,
    images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.imageUrl],
    operationMode: SavedProduct
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(mapPrismaProduct);
}

export async function getLatestProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isLatest: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapPrismaProduct);
}

export async function getHotProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isHot: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapPrismaProduct);
}

export async function upsertProduct(product: Product): Promise<Product> {
  const saved = await prisma.product.upsert({
    where: { id: product.id },
    create: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      sizes: product.sizes,
      color: product.color ?? null,
      isHot: product.isHot ?? false,
      isLatest: product.isLatest ?? false,
    },
    update: {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      sizes: product.sizes,
      color: product.color ?? null,
      isHot: product.isHot ?? false,
      isLatest: product.isLatest ?? false,
    },
  });

  return mapPrismaProduct(saved);
}

export async function getProductById(id: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({
    where: { id },
  });
  return p ? mapPrismaProduct(p) : null;
}
