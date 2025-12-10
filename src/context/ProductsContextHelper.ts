import { Product, ProductFilterState, LatestProductsMode, HotProductsMode } from '@/lib/types';

export function parseDate(d: string | Date | null | undefined): Date {
  if (!d) return new Date(0);
  return d instanceof Date ? d : new Date(d);
}

// Build derived collections from allProducts
export function buildProductsCollections(products: Product[]) {
  const productsMap: Record<string, Product> = {};

  for (const p of products) {
    if (p.id) {
      productsMap[p.id] = p;
    }
  }

  const hotProducts = products.filter(p => p.isHot);

  const latestProducts = products
    .filter(p => p.isLatest)
    .slice()
    .sort(
      (a, b) =>
        parseDate(b.createdAt as any).getTime() -
        parseDate(a.createdAt as any).getTime()
    );

  return { productsMap, hotProducts, latestProducts };
}

export function upsertProductInList(list: Product[], saved: Product): Product[] {
  const idx = list.findIndex(x => x.id === saved.id);

  if (idx === -1) {
    // Add new to front
    return [saved, ...list];
  }

  const copy = [...list];
  copy[idx] = saved;
  return copy;
}

export const applyProductFilters = (
  filters: ProductFilterState,
  latestProducts: Product[],
  hotProducts: Product[],
  allProducts: Product[]
): Product[] => {
  const baseList: Product[] =
    filters.mode === LatestProductsMode
      ? latestProducts
      : filters.mode === HotProductsMode
      ? hotProducts
      : allProducts ?? [];

  const q = filters.searchTerm.trim().toLowerCase();

  return baseList.filter((p) => {
    // 1) Search text filter
    if (q) {
      const name = p.name?.toLowerCase() ?? '';
      const desc = p.description?.toLowerCase() ?? '';
      const cat = p.category?.toLowerCase() ?? '';

      const matchesSearch =
        name.includes(q) || desc.includes(q) || cat.includes(q);

      if (!matchesSearch) return false;
    }

    // 2) Size filter
    if (filters.sizes.length > 0) {
      const hasSize = p.sizes?.some((s: any) => filters.sizes.includes(s));
      if (!hasSize) return false;
    }

    // 3) Color filter
    if (filters.colors.length > 0) {
      if (!p.color) return false;
      const normalized = p.color.toLowerCase();
      const match = filters.colors.some((c: string) =>
        normalized.includes(c.toLowerCase())
      );
      if (!match) return false;
    }

    // 4) Price filter
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;

    // ✅ Passed all filters
    return true;
  });
};
