import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let items: any = body?.items;

    // Normalize items into an array
    if (!Array.isArray(items)) {
      if (items && typeof items === 'object') {
        items = Object.values(items);
      } else {
        items = [];
      }
    }

    const lineItems = items
      .map((raw: any, idx: number) => {
        // support both:
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
          price_data: {
            currency: 'usd',
            product_data: {
              name,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        };
      })
      .filter(Boolean) as { price_data: any; quantity: number }[];

    if (!lineItems.length) {
      return NextResponse.json(
        { error: 'No valid items for checkout' },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
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
