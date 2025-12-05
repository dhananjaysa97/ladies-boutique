// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ensure Node runtime (Prisma doesn't work on Edge)
export const runtime = 'nodejs';
// Avoid static optimization trying to pre-render this
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Error in GET /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// CREATE new product (if you're using POST anywhere)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      category,
      imageUrl,
      sizes,
      isHot,
      isLatest,
      color,
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        id, // optional, you can omit this if it's autoincrement Int
        name,
        description: description ?? '',
        price: typeof price === 'string' ? parseFloat(price) : price,
        category,
        imageUrl,
        sizes,
        isHot: !!isHot,
        isLatest: !!isLatest,
        color,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// UPDATE / UPSERT product from your admin page (this is the one your page.tsx calls)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const images: string[] = Array.isArray(body.images) && body.images.length > 0 
      ? body.images : body.imageUrl ? [body.imageUrl] : [];

      const primaryImage = images.length > 0 ? images[0] : body.imageUrl || '';

      body.gallery = images;

    const {
      id,
      name,
      description,
      price,
      category,
      imageUrl,
      sizes,
      isHot,
      isLatest,
      color,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing product id' },
        { status: 400 },
      );
    }

    const updated = await prisma.product.upsert({
      where: { id },
      update: {
        name,
        description: description ?? '',
        price: typeof price === 'string' ? parseFloat(price) : price,
        category,
        imageUrl,
        sizes,
        isHot: !!isHot,
        isLatest: !!isLatest,
        color,
      },
      create: {
        id,
        name,
        description: description ?? '',
        price: typeof price === 'string' ? parseFloat(price) : price,
        category,
        imageUrl,
        sizes,
        isHot: !!isHot,
        isLatest: !!isLatest,
        color,
      },
    });

    // Return full list so your admin page can refresh
    const products = await prisma.product.findMany();

    return NextResponse.json({ product: updated, products }, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    const products = await prisma.product.findMany();
    const withImages = products.map(p => ({
  ...p,
  images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.imageUrl],
}));
    return NextResponse.json({ withImages }, { status: 200 });
  } catch (err) {
    console.error('Error in DELETE /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

