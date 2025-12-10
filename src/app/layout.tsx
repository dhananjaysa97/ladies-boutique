import './globals.css';
import type { Metadata } from 'next';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { AuthProvider } from '@/components/AuthProvider';
import { getAllProductsCached } from '@/data/products';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Leena's Boutique",
  description:
    'Online ladies clothing store with curated styles, ethnic wear, and loungewear.',
  openGraph: {
    title: "Leena's Boutique",
    description: 'Curated online ladies clothing store.',
    type: 'website', // this one *is* valid
  },
  twitter: {
    card: 'summary_large_image',
    title: "Leena's Boutique",
    description: 'Curated online ladies clothing store.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getAllProductsCached();

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ProductsProvider initialProducts={products}>
            <NavBar />
            <main className="main-shell" aria-label="Main content">
              <div className="main-card">{children}</div>
            </main>
            <Footer />
            </ProductsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
