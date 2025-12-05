import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    await prisma.visit.create({
      data: { path },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /api/track-visit', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
