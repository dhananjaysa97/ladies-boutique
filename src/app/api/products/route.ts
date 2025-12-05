// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 👇 Make sure Prisma runs in Node runtime, not Edge
export const runtime = 'nodejs';

// 👇 Do NOT try to pre-render /api/products at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Error in GET /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      category,
      imageUrl,
      sizes,
      isHot,
      isLatest,
      color,
      description, // 👈 grab description from body
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        // make sure price is a number
        price: typeof price === 'string' ? parseFloat(price) : price,
        category,
        imageUrl,
        sizes,
        isHot: !!isHot,
        isLatest: !!isLatest,
        color,
        // 👇 required in your Prisma model
        description: description ?? '', // or provide a default string
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/products', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

