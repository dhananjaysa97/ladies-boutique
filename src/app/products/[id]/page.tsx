import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/data/products';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: "Product not found | Leena's Boutique",
    };
  }

  const title = `${product.name} | Leena's Boutique`;
  const description = product.description.slice(0, 150);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: product.imageUrl }],
      // ❌ removed: type: 'product'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    return notFound();
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.imageUrl],
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
