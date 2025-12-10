/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server';
import { GET, PUT, DELETE } from './route';
import { prisma } from '@/lib/prisma';
import { Product } from '@/lib/types';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  product: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };
};

describe('/api/products route handlers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns products with status 200', async () => {
    mockedPrisma.product.findMany.mockResolvedValueOnce([
      {
        id: '1',
        name: 'Test',
        description: '',
        price: 10,
        imageUrl: '/products/p1.jpg',
        gallery: [],
        category: 'Dresses',
        sizes: ['M'],
        color: 'Pink',
        isHot: false,
        isLatest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await GET();
    expect(res).toBeInstanceOf(NextResponse);

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.products).toHaveLength(1);
    expect(json.products[0].id).toBe('1');
  });

  it('PUT validates required fields', async () => {
    const fakeRequest = {
      json: jest.fn().mockResolvedValue({
        // missing name/price
      }),
    } as any;

    const res = await PUT(fakeRequest);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing required fields/i);
  });

  it('PUT creates new product when id not provided', async () => {
    const fakeBody = {
      name: 'New Product',
      price: 25,
      description: 'desc',
      imageUrl: '/products/x.jpg',
      gallery: [],
      category: 'Dresses',
      sizes: ['M'],
      color: 'Pink',
      isHot: true,
      isLatest: false,
    };

    const fakeRequest = {
      json: jest.fn().mockResolvedValue(fakeBody),
    } as any;

    const saved = { id: '123', ...fakeBody, createdAt: new Date(), updatedAt: new Date() };

    mockedPrisma.product.create.mockResolvedValueOnce(saved);

    const res = await PUT(fakeRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.product.id).toBe('123');
    expect(mockedPrisma.product.create).toHaveBeenCalled();
  });

  it('DELETE validates ids array and calls deleteMany', async () => {
    const fakeRequestMissing = {
      json: jest.fn().mockResolvedValue({ ids: [] }),
    } as any;

    const resMissing = await DELETE(fakeRequestMissing);
    const bodyMissing = await resMissing.json();
    expect(resMissing.status).toBe(400);
    expect(bodyMissing.error).toMatch(/No product ids provided/i);

    const fakeRequest = {
      json: jest.fn().mockResolvedValue({ ids: ['1', '2'] }),
    } as any;

    mockedPrisma.product.deleteMany.mockResolvedValueOnce({ count: 2 });
    mockedPrisma.product.findMany.mockResolvedValueOnce([]);

    const res = await DELETE(fakeRequest);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.deletedCount).toBe(2);
    expect(mockedPrisma.product.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['1', '2'] } },
    });
  });
});
