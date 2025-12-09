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
      title: 'Product not found | Leena\'s Boutique',
    };
  }

  const title = `${product.name} | Leena's Boutique`;
  const description = product.description.slice(0, 150);
  const imageUrl =
    (product.images && product.images[0]) ||
    product.imageUrl ||
    '/products/placeholder.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const imageUrl =
    (product.images && product.images[0]) ||
    product.imageUrl ||
    '/products/placeholder.jpg';

  const productWithFallback = {
    ...product,
    imageUrl,
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productWithFallback.name,
    description: productWithFallback.description,
    image: [imageUrl],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: productWithFallback.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={productWithFallback} />
    </>
  );
}
