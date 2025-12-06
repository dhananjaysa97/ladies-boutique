import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let items: any = body?.items;

    // Normalize items into an array
    if (!Array.isArray(items)) {
      if (items && typeof items === 'object') {
        items = Object.values(items);
      } else {
        items = [];
      }
    }

    // Normalize each item into { name, price, quantity }
    const normalized = (items as any[]).map((raw, idx) => {
      // handle cases where raw might be null/undefined
      if (!raw || typeof raw !== 'object') {
        return null;
      }

      // support both shapes:
      // 1) { name, price, quantity }
      // 2) { product: { name, price, ... }, quantity }
      const source = raw.product ?? raw;

      const name = source?.name ?? `Item ${idx + 1}`;
      const priceRaw = source?.price ?? raw.price;
      const quantityRaw = raw.quantity ?? 1;

      const price = Number(priceRaw);
      const quantity = Number(quantityRaw);

      if (!Number.isFinite(price) || price <= 0) {
        // skip invalid price items
        return null;
      }

      return {
        name: String(name),
        price,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    }).filter(Boolean) as { name: string; price: number; quantity: number }[];

    if (!normalized.length) {
      return NextResponse.json(
        { error: 'No valid items to checkout' },
        { status: 400 }
      );
    }

    const lineItems = normalized.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error('Error creating checkout session', err);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
