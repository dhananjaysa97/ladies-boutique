import TrackVisitClient from '@/components/TrackVisitClient';
import Image from 'next/image';
import {ProductGrid} from '@/components/ProductGrid';
import {LatestProductsMode} from '@/lib/types'

export default async function HomePage() {
  
  return (
    <div className="space-y-2">
      <TrackVisitClient />
      <section className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50 to-amber-50 p-2 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-3">
          <div className='flex gap-5'>
            <Image alt="Glam By Leenas Boutique" className='flex-none' src="/products/LeenusBoutiqueLogo.jpg" width={100} height={100}/>
            <p className="grow text-sm md:text-base text-gray-700 max-w-xl">
            Discover dresses, tops, ethnic wear, and loungewear handpicked for comfort and elegance.
          </p>
          </div>
          
          <p className="text-xs font-semibold tracking-wide text-pink-600 uppercase">
            New Season · New You
          </p>
          <h1 className="text-2xl md:text-2xl font-bold text-gray-900">
            Curated styles for every moment.
          </h1>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Express Shipping</p>
            <p>Fast dispatch so your outfits arrive right on time.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Handpicked Fabrics</p>
            <p>Soft, breathable materials for all-day comfort.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Secure Checkout</p>
            <p>Powered by Stripe for smooth and safe payments.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Easy Returns</p>
            <p>Hassle-free exchanges on eligible orders.</p>
          </div>
        </div>
      </section>
      <section>
        <ProductGrid mode={LatestProductsMode} title='Latest Collection' />
      </section>
    </div>
  );
}
