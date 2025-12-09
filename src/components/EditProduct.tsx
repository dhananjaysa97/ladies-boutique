"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Product, CreateProduct } from "@/lib/types";
import { useProductsContext } from "@/context/ProductsContext";

let emptyProduct: Product = {
  id: "",
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  category: "",
  sizes: ["S", "M", "L"],
  color: "",
  isHot: false,
  isLatest: false,
  gallery: [],
  images: [],
  operationMode: CreateProduct
};

const handleEditProduct = (p: Product) => {
  const images =
    p.gallery && p.gallery.length > 0
      ? p.gallery
      : p.imageUrl
      ? [p.imageUrl]
      : [];

  emptyProduct = {
    ...p,
    images,
    gallery: images,
  };
};

export default function EditProductComponent({ selectedProduct, onClose }: 
    { selectedProduct: Product; onClose: () => void; }) {
  handleEditProduct(selectedProduct);
  const {upsertProduct, createProduct} = useProductsContext();

  const [form, setForm] = useState<Product>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      // setUploading(true);

      const uploadForm = new FormData();
      uploadForm.append("file", imageFile);

      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        console.error("Image upload failed", await uploadRes.text());
        // setUploading(false);
        return;
      }

      const { url } = await uploadRes.json();

      // Attach to current product in the form (local state)
      setForm((prev) => {
        const currentImages =
          (prev as any).images && (prev as any).images.length
            ? [...(prev as any).images]
            : prev.imageUrl
            ? [prev.imageUrl]
            : [];

        const updatedImages = [...currentImages, url];

        return {
          ...prev,
          imageUrl: prev.imageUrl || url, // if no primary image yet, use this one
          images: updatedImages, // for UI / product detail
          gallery: updatedImages, // if you use gallery in Prisma
        } as any;
      });

      // Clear file selection and preview
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Error attaching image", err);
    } finally {
      // setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // setUploading(true);

      const submitEvent = e.nativeEvent as SubmitEvent;
  const submitter = submitEvent.submitter as HTMLElement | null;
  const action = submitter?.getAttribute("value");

  console.log("Clicked button:", action);

      let finalImages =
        form.images && form.images.length > 0
          ? [...form.images]
          : form.imageUrl
          ? [form.imageUrl]
          : [];

      const primaryImage =
        finalImages.length > 0 ? finalImages[0] : form.imageUrl || "";

      const newProduct = {
        ...form,
        id: action === "save" ? form.id : crypto.randomUUID(),
        price: Number(form.price),
        imageUrl: primaryImage,
        images: finalImages,
        gallery: finalImages,
        operationMode : CreateProduct
      };
      
      upsertProduct(newProduct);
      await createProduct(newProduct);
    } catch (err) {
      console.error("Error saving product", err);
    } finally {
      // setUploading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur rounded-1xl shadow-sm p-1 border border-white/70"
        aria-label="Product editor"
      >
        <div className="block  gap-2 p-1">
          {/* First three rows with two columns */}
          <div className="grid grid-cols-2 gap-1 mx-1 my-2 ">
            <div>
              <label htmlFor="prod-name" className="block text-xs mb-1">
                Name
              </label>
              <input
                id="prod-name"
                className="w-full border rounded-lg px-2 py-2 text-sm"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="prod-price" className="block text-xs mb-1">
                Price:
              </label>
              <input
                id="prod-price"
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 mx-1 my-2">
            <div>
              <label htmlFor="prod-category" className="block text-xs mb-1">
                Category
              </label>
              <input
                id="prod-category"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Category (e.g. Dresses)"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
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
                value={form.color ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-1 mx-1 my-2">
            <label htmlFor="prod-desc" className="block text-xs mb-1">
              Description:
            </label>
            <textarea
              id="prod-desc"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex bg-green-400 gap-1 items-center mx-1 my-2">
            <label
              htmlFor="prod-image-url"
              className="text-xs font-bold mb-1 items-center justify-center"
            >
              Image URL:
            </label>
            <input
              id="prod-image-url"
              className="max-w-xl border rounded-lg px-1 py-1 text-sm grow"
              placeholder="Image URL (optional if you upload)"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-1 my-3">
            <label htmlFor="prod-image-file" className="w-fit text-xs m-1">
              Upload image:
            </label>
            <input
              id="prod-image-file"
              type="file"
              accept="image/*"
              className="
                  text-xs 
                file:bg-blue-300 
                  file:rounded 
                  file:border-0
                  "
              onChange={(e) => {
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

            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={handleAttachImageToProduct}
                disabled={!imageFile  || !form.id}
                className="px-3 py-1 rounded-full bg-pink-500 text-white text-xs disabled:opacity-50"
              >
                Save image to product
              </button>
            </div>
          </div>

          {/* Remaining four rows with a single column */}

          <div className="grid grid-cols-1 gap-4">
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
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.src = "/products/placeholder.jpg";
                        }}
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            images: f.images?.filter((_, i) => i !== idx) ?? [],
                            gallery:
                              f.images?.filter((_, i) => i !== idx) ?? [],
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
          <div className="grid grid-cols-4 gap-2 justify-center items-center">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isLatest ?? false}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isLatest: e.target.checked }))
                  }
                />
                Latest
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isHot ?? false}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isHot: e.target.checked }))
                  }
                />
                Hot
              </label>
            </div>
            <button
              type="submit"
              name="action"
              value="save"
              className="mt-2 inline-flex px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save to Existing
            </button>
            <button
              type="submit"
              name="action"
              value="addNew"
              className="mt-2 inline-flex px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add as New
            </button>
            <button
              type="button"
              onClick={() => { 
                setForm({
        id: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        category: "",
        sizes: ["S", "M", "L"],
        color: "",
        isHot: false,
        isLatest: false,
        gallery: [],
        images: [],
        operationMode: CreateProduct,
      });
                onClose();
              }}
              className="mt-2 inline-flex px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-pink-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
