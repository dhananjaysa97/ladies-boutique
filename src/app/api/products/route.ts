// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/products', err);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}

// Create or update a single product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      imageUrl,
      gallery,
      category,
      sizes,
      color,
      isHot,
      isLatest,
    } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: name or price' },
        { status: 400 }
      );
    }

    const data = {
      name,
      description: description ?? '',
      price,
      imageUrl,
      gallery: gallery ?? [],
      category: category ?? '',
      sizes: sizes ?? [],
      color: color ?? '',
      isHot: !!isHot,
      isLatest: !!isLatest,
    };

    const product = id
      ? await prisma.product.update({
          where: { id },
          data,
        })
      : await prisma.product.create({ data });

    return NextResponse.json({ product }, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/products', err);
    return NextResponse.json(
      { error: 'Failed to save product' },
      { status: 500 }
    );
  }
}

// Delete one or more products
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const ids: string[] | undefined = body?.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product ids provided' },
        { status: 400 }
      );
    }

    // Delete all in one transaction
    const products = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    // For convenience, also return a simplified list with images
    const remaining = await prisma.product.findMany();
    const withImages = remaining.map(p => ({
      ...p,
      images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.imageUrl],
    }));

    return NextResponse.json(
      { deletedCount: products.count, products: withImages },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in DELETE /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
