'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const emptyProduct: Product = {
  id: '',
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: '',
  sizes: ['S', 'M', 'L'],
  color: '',
};

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>(emptyProduct);

  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products);
    })();
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      id: form.id || crypto.randomUUID(),
      price: Number(form.price),
    };

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setProducts(updated.products);
      setForm(emptyProduct);
    }
  };

  const editProduct = (p: Product) => {
    setForm(p);
  };

  if (status === 'loading') {
    return <p className="text-sm text-gray-600">Checking admin access…</p>;
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin: Products</h1>
        <p className="text-sm text-gray-700">
          You must be signed in as admin to manage products.
        </p>
        <Link
          href="/auth/signin?callbackUrl=/admin/products"
          className="inline-flex px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm"
        >
          Go to Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin: Products</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-4 border border-white/70 grid gap-4 md:grid-cols-2"
        aria-label="Product editor"
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="prod-name" className="block text-xs mb-1">
              Name
            </label>
            <input
              id="prod-name"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="prod-desc" className="block text-xs mb-1">
              Description
            </label>
            <textarea
              id="prod-desc"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={e =>
                setForm(f => ({ ...f, description: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="prod-category" className="block text-xs mb-1">
              Category
            </label>
            <input
              id="prod-category"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Category (e.g. Dresses)"
              value={form.category}
              onChange={e =>
                setForm(f => ({ ...f, category: e.target.value }))
              }
              required
            />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="prod-price" className="block text-xs mb-1">
              Price
            </label>
            <input
              id="prod-price"
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Price"
              value={form.price}
              onChange={e =>
                setForm(f => ({ ...f, price: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="prod-image" className="block text-xs mb-1">
              Image URL
            </label>
            <input
              id="prod-image"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={e =>
                setForm(f => ({ ...f, imageUrl: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="prod-color" className="block text-xs mb-1">
              Color
            </label>
            <input
              id="prod-color"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Color (e.g. Black)"
              value={form.color ?? ''}
              onChange={e =>
                setForm(f => ({ ...f, color: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-4 text-xs mt-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isLatest ?? false}
                onChange={e =>
                  setForm(f => ({ ...f, isLatest: e.target.checked }))
                }
              />
              Latest
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isHot ?? false}
                onChange={e =>
                  setForm(f => ({ ...f, isHot: e.target.checked }))
                }
              />
              Hot
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 inline-flex px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm"
          >
            Save Product
          </button>
        </div>
      </form>
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-4 border border-white/70 space-y-2">
        <h2 className="font-semibold text-sm">Existing Products</h2>
        {products.map(p => (
          <div
            key={p.id}
            className="flex justify-between items-center border-b last:border-b-0 py-2"
          >
            <div>
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-gray-500">
                {p.category} • ${p.price.toFixed(2)} {p.color && `• ${p.color}`}
              </p>
            </div>
            <button
              onClick={() => editProduct(p)}
              className="text-xs text-pink-600 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
