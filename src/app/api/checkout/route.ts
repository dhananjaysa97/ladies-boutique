import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Checkout will not work.');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20' as any,
    })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured on the server.' },
      { status: 500 }
    );
  }

  const { items } = await req.json();

  const lineItems =
    (items as any[]).map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.product.name },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    })) ?? [];

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get('origin') ||
    'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
