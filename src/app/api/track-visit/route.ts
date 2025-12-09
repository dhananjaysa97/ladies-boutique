import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, sessionId, userAgent } = body;

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await prisma.visit.create({
      data: {
        path,
        sessionId,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error tracking visit', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
