import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, upsertProduct } from '@/data/products';
import { Product } from '@/lib/types';

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Product;
  const saved = await upsertProduct(body);
  const products = await getAllProducts();
  return NextResponse.json({ product: saved, products });
}
