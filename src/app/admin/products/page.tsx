'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CreateProduct, Product } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import EditProductComponent from '@/components/EditProduct';
import ModalComponent from '@/components/ModalComponent';
import { useProductsContext } from '@/context/ProductsContext';


type SortKey = 'name' | 'price' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
   const { allProducts } = useProductsContext();
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const copyProduct = (p: Product) => {
    // Copy everything but clear the id so it becomes a "new" product
    const { id, createdAt, ...newProduct } = p;
    setSelectedProduct({
      ...newProduct,
      id: '',
    } as Product);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === allProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allProducts.map(p => p.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    // if (!confirm(`Delete ${selectedIds.length} product(s)?`)) return;

    // const res = await fetch('/api/products', {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ids: selectedIds }),
    // });

    // if (res.ok) {
    //   const data = await res.json();
    //   setProducts(data.products);
    //   setSelectedIds([]);
    // } else {
    //   console.error('Failed to delete products', await res.text());
    // }
  };

  const handleRemoveImage = async (product: Product) => {
    if (!product.imageUrl) return;

    // if (
    //   !confirm(
    //     `Remove image for "${product.name}" from Blob and clear it from this product?`
    //   )
    // ) {
    //   return;
    // }

    // try {
    //   // 1) Remove from Blob (best-effort)
    //   await fetch('/api/upload-image', {
    //     method: 'DELETE',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url: product.imageUrl }),
    //   });

    //   // 2) Clear imageUrl in DB
    //   const payload = {
    //     ...product,
    //     imageUrl: '',
    //   };

    //   const res = await fetch('/api/products', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   });

    //   if (res.ok) {
    //     const data = await res.json();
    //     setProducts(data.products);
    //   } else {
    //     console.error('Failed to clear product image', await res.text());
    //   }
    // } catch (err) {
    //   console.error('Error removing image', err);
    // }
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
    const copy = [...allProducts];
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
  }, [allProducts, sortKey, sortDir]);

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
      { selectedProduct 
        ? <ModalComponent 
            isOpen={!selectedProduct === false}
            onClose={() => setSelectedProduct(undefined)}
          >
          <EditProductComponent 
            selectedProduct={selectedProduct} 
            onClose={() => setSelectedProduct(undefined)}
            /> 
        </ModalComponent>
        : null
         }

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
                      allProducts.length > 0 &&
                      selectedIds.length === allProducts.length
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
                          onClick={() => setSelectedProduct(p)}
                          className="text-[11px] text-pink-600 hover:underline"
                        >
                          Edit
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
