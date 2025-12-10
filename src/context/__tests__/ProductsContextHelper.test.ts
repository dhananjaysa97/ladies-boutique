// src/context/__tests__/ProductsContextHelper.test.ts
import {
  parseDate,
  buildProductsCollections,
  upsertProductInList,
  applyProductFilters,
} from '@/context/ProductsContextHelper';
import {
  Product,
  ProductFilterState,
  defaultProductFilterState,
  AllProductsMode,
  HotProductsMode,
  LatestProductsMode,
} from '@/lib/types';

const baseProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Test Dress',
  description: 'A beautiful pink dress',
  price: 49.99,
  imageUrl: '/products/test.jpg',
  category: 'Dresses',
  sizes: ['S', 'M'],
  color: 'Pink',
  isHot: false,
  isLatest: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  operationMode: 'create',
  ...overrides,
});

describe('parseDate', () => {
  it('returns epoch date when given nullish', () => {
    const d1 = parseDate(null);
    const d2 = parseDate(undefined);
    expect(d1.getTime()).toBe(0);
    expect(d2.getTime()).toBe(0);
  });

  it('returns same date for Date input', () => {
    const dt = new Date('2024-05-10T00:00:00Z');
    expect(parseDate(dt)).toBe(dt);
  });

  it('parses string into Date', () => {
    const dt = parseDate('2024-05-10T00:00:00Z');
    expect(dt).toBeInstanceOf(Date);
    expect(dt.getUTCFullYear()).toBe(2024);
  });
});

describe('buildProductsCollections', () => {
  it('builds productsMap, hotProducts and latestProducts', () => {
    const p1 = baseProduct({ id: '1', isHot: true, createdAt: '2024-01-02', isLatest: true });
    const p2 = baseProduct({ id: '2', isHot: false, createdAt: '2024-01-03', isLatest: true });
    const p3 = baseProduct({ id: '3', isHot: true, isLatest: false });

    const { productsMap, hotProducts, latestProducts } = buildProductsCollections([p1, p2, p3]);

    expect(productsMap['1']).toEqual(p1);
    expect(productsMap['2']).toEqual(p2);
    expect(productsMap['3']).toEqual(p3);

    // Hot = isHot === true
    expect(hotProducts.map(p => p.id).sort()).toEqual(['1', '3'].sort());

    // Latest sorted by createdAt desc
    expect(latestProducts.map(p => p.id)).toEqual(['2', '1']);
  });
});

describe('upsertProductInList', () => {
  it('adds new product to front when id not found', () => {
    const p1 = baseProduct({ id: '1' });
    const p2 = baseProduct({ id: '2' });
    const list = [p1];

    const res = upsertProductInList(list, p2);
    expect(res).toHaveLength(2);
    expect(res[0]).toEqual(p2);
  });

  it('replaces existing product when id already present', () => {
    const p1 = baseProduct({ id: '1', name: 'Old' });
    const updated = baseProduct({ id: '1', name: 'New' });

    const res = upsertProductInList([p1], updated);
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('New');
  });
});

const baseFilters: ProductFilterState = {
  ...defaultProductFilterState,
};

describe('applyProductFilters', () => {
  const p1 = baseProduct({
    id: '1',
    name: 'Pink Dress',
    description: 'Floral pattern',
    category: 'Dresses',
    color: 'Pink',
    price: 50,
    isHot: true,
    isLatest: false,
  });
  const p2 = baseProduct({
    id: '2',
    name: 'Blue Jeans',
    description: 'Denim',
    category: 'Jeans',
    color: 'Blue',
    price: 80,
    isHot: false,
    isLatest: true,
  });

  const all = [p1, p2];

  it('uses allProducts when mode = all', () => {
    const filters = { ...baseFilters, mode: AllProductsMode };
    const result = applyProductFilters(filters, [p2], [p1], all);
    expect(result.map(p => p.id).sort()).toEqual(['1', '2'].sort());
  });

  it('uses latestProducts when mode = latest', () => {
    const filters = { ...baseFilters, mode: LatestProductsMode };
    const result = applyProductFilters(filters, [p2], [p1], all);
    expect(result.map(p => p.id)).toEqual(['2']);
  });

  it('uses hotProducts when mode = hot', () => {
    const filters = { ...baseFilters, mode: HotProductsMode };
    const result = applyProductFilters(filters, [p2], [p1], all);
    expect(result.map(p => p.id)).toEqual(['1']);
  });

  it('filters by searchTerm (name/desc/category)', () => {
    const filters = { ...baseFilters, mode: AllProductsMode, searchTerm: 'jeans' };
    const result = applyProductFilters(filters, [p2], [p1], all);
    expect(result.map(p => p.id)).toEqual(['2']);
  });

  it('filters by sizes', () => {
    const pSmallOnly = baseProduct({ id: '3', sizes: ['S'] });
    const allProds = [p1, p2, pSmallOnly];
    const filters: ProductFilterState = {
      ...baseFilters,
      mode: AllProductsMode,
      sizes: ['S'],
    };

    const result = applyProductFilters(filters, [], [], allProds);
    expect(result.map(p => p.id).sort()).toEqual(['1', '2', '3'].sort()); // all have S in default
  });

  it('filters by colors', () => {
    const filters: ProductFilterState = {
      ...baseFilters,
      colors: ['Pink'],
    };
    const result = applyProductFilters(filters, [], [], all);
    expect(result.map(p => p.id)).toEqual(['1']);
  });

  it('filters by minPrice/maxPrice', () => {
    const filters: ProductFilterState = {
      ...baseFilters,
      minPrice: 60,
      maxPrice: 100,
    };
    const result = applyProductFilters(filters, [], [], all);
    expect(result.map(p => p.id)).toEqual(['2']);
  });
});
