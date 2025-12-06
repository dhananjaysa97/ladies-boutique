'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  isHot: false,
  isLatest: false,
    gallery: [],
  images: [],
};

type SortKey = 'name' | 'price' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Load existing products once when authenticated
  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products);
    })();
  }, [status]);

  // Build preview URL when a file is selected
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const handleAttachImageToProduct = async () => {
  if (!imageFile) return;
  try {
    setUploading(true);

    const uploadForm = new FormData();
    uploadForm.append('file', imageFile);

    const uploadRes = await fetch('/api/upload-image', {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      console.error('Image upload failed', await uploadRes.text());
      setUploading(false);
      return;
    }

    const { url } = await uploadRes.json();

    // Attach to current product in the form (local state)
    setForm(prev => {
      const currentImages = (prev as any).images && (prev as any).images.length
        ? [...(prev as any).images]
        : prev.imageUrl
        ? [prev.imageUrl]
        : [];

      const updatedImages = [...currentImages, url];

      return {
        ...prev,
        imageUrl: prev.imageUrl || url, // if no primary image yet, use this one
        images: updatedImages,         // for UI / product detail
        gallery: updatedImages,        // if you use gallery in Prisma
      } as any;
    });

    // Clear file selection and preview
    setImageFile(null);
    setPreviewUrl(null);
  } catch (err) {
    console.error('Error attaching image', err);
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);

      let finalImages =
      form.images && form.images.length > 0
        ? [...form.images]
        : form.imageUrl
        ? [form.imageUrl]
        : [];

        const primaryImage =
      finalImages.length > 0 ? finalImages[0] : form.imageUrl || '';

      const payload = {
      ...form,
      id: form.id || crypto.randomUUID(),
      price: Number(form.price),
      imageUrl: primaryImage,
      images: finalImages,
      gallery: finalImages,
    };

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Failed to save product', await res.text());
      setUploading(false);
      return;
    }


    const updated = await res.json();
    setProducts(updated.products);
    setForm(emptyProduct);
    setImageFile(null);
    setPreviewUrl(null);
    } catch (err) {
    console.error('Error saving product', err);
  } finally {
      setUploading(false);
    }
  };

  const editProduct = (p: Product) => {
    const images =
    p.gallery && p.gallery.length > 0
      ? p.gallery
      : p.imageUrl
      ? [p.imageUrl]
      : [];

  setForm({
    ...p,
    images,
    gallery: images,
  });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const copyProduct = (p: Product) => {
    // Copy everything but clear the id so it becomes a "new" product
    const { id, createdAt, ...rest } = p;
    setForm({
      ...rest,
      id: '',
    } as Product);
    setImageFile(null);
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} product(s)?`)) return;

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setSelectedIds([]);
    } else {
      console.error('Failed to delete products', await res.text());
    }
  };

  const handleRemoveImage = async (product: Product) => {
    if (!product.imageUrl) return;

    if (
      !confirm(
        `Remove image for "${product.name}" from Blob and clear it from this product?`
      )
    ) {
      return;
    }

    try {
      // 1) Remove from Blob (best-effort)
      await fetch('/api/upload-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: product.imageUrl }),
      });

      // 2) Clear imageUrl in DB
      const payload = {
        ...product,
        imageUrl: '',
      };

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      } else {
        console.error('Failed to clear product image', await res.text());
      }
    } catch (err) {
      console.error('Error removing image', err);
    }
  };

  const changeSort = (key: SortKey) => {
    setSortKey(prevKey => {
      if (prevKey === key) {
        setSortDir(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      } else {
        setSortDir('asc');
        return key;
      }
    });
  };

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;

      if (sortKey === 'price') {
        return (a.price - b.price) * dir;
      }

      if (sortKey === 'createdAt') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (da - db) * dir;
      }

      // name
      return a.name.localeCompare(b.name) * dir;
    });
    return copy;
  }, [products, sortKey, sortDir]);

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

      {/* Editor form */}
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

          {/* Image URL + file upload + preview */}
          <div>
            <label htmlFor="prod-image" className="block text-xs mb-1">
              Image URL
            </label>
            <input
              id="prod-image"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
              placeholder="Image URL (optional if you upload)"
              value={form.imageUrl}
              onChange={e =>
                setForm(f => ({ ...f, imageUrl: e.target.value }))
              }
            />

            <label htmlFor="prod-image-file" className="block text-xs mb-1">
    Or upload image file
  </label>
  <div className="flex items-center gap-2">
    <input
      id="prod-image-file"
      type="file"
      accept="image/*"
      className="text-xs"
      onChange={e => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        if (file) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }
      }}
    />
    <button
      type="button"
      onClick={handleAttachImageToProduct}
      disabled={!imageFile || uploading || !form.id}
      className="px-3 py-1 rounded-full bg-pink-500 text-white text-xs disabled:opacity-50"
    >
      Save image to product
    </button>
  </div>

  {/* temporary preview of the file before attach */}
  {previewUrl && (
    <div className="mt-2 w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
      <img
        src={previewUrl}
        alt="New image preview"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )}

            
  {/* Gallery previews with X buttons */}
  {form.images && form.images.length > 0 && (
    <div className="mt-3">
      <p className="text-[11px] text-gray-500 mb-1">
        Gallery images (click ✕ to remove):
      </p>
      <div className="flex flex-wrap gap-2">
        {form.images.map((url, idx) => (
          <div
            key={url + idx}
            className="relative w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            <img
              src={url}
              alt={`Image ${idx + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={e => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = '/products/placeholder.jpg';
              }}
            />
            <button
              type="button"
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center"
              onClick={() =>
                setForm(f => ({
                  ...f,
                  images: f.images?.filter((_, i) => i !== idx) ?? [],
                  gallery: f.images?.filter((_, i) => i !== idx) ?? [],
                }))
              }
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
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
            disabled={uploading}
            className="mt-2 inline-flex px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Save Product'}
          </button>
        </div>
      </form>

      {/* Product list with preview, date, sort, checkboxes */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-4 border border-white/70 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Existing Products</h2>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete Selected
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b text-[11px] text-gray-600">
                <th className="py-2 px-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedIds.length === products.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all products"
                  />
                </th>
                <th className="py-2 px-2 text-left">Image</th>
                <th
                  className="py-2 px-2 text-left cursor-pointer"
                  onClick={() => changeSort('name')}
                >
                  Name
                  {sortKey === 'name' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
                <th
                  className="py-2 px-2 text-left cursor-pointer"
                  onClick={() => changeSort('price')}
                >
                  Price
                  {sortKey === 'price'
                    ? sortDir === 'asc'
                      ? ' ↑'
                      : ' ↓'
                    : ''}
                </th>
                <th
                  className="py-2 px-2 text-left cursor-pointer"
                  onClick={() => changeSort('createdAt')}
                >
                  Date Added
                  {sortKey === 'createdAt'
                    ? sortDir === 'asc'
                      ? ' ↑'
                      : ' ↓'
                    : ''}
                </th>
                <th className="py-2 px-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(p => {
                const created =
                  p.createdAt &&
                  !Number.isNaN(new Date(p.createdAt as any).getTime())
                    ? new Date(p.createdAt as any).toLocaleDateString()
                    : '-';

                return (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="py-2 px-2 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="py-2 px-2 align-middle">
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={p.imageUrl || '/products/placeholder.jpg'}
                          alt={p.name}
                          className="max-w-full max-h-full object-contain"
                          onError={e => {
                            const img = e.currentTarget;
                            img.onerror = null;
                            img.src = '/products/placeholder.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{p.name}</span>
                        <span className="text-[11px] text-gray-500">
                          {p.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 align-middle">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 align-middle">{created}</td>
                    <td className="py-2 px-2 align-middle">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => editProduct(p)}
                          className="text-[11px] text-pink-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => copyProduct(p)}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(p)}
                          className="text-[11px] text-gray-600 hover:underline"
                        >
                          Remove image
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-gray-500 text-xs"
                  >
                    No products yet. Add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
