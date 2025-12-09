import { Product } from "@/lib/types";

export async function handleRemoveProduct(product: Product, removeProduct: (id: string) => void) {
  const confirmed = window.confirm(`Delete product "${product.name}"?`);
  if (!confirmed) return;

  try {
    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [product.id] }),
    });

    if (!res.ok) {
      alert("Failed to delete product");
      return;
    }

    // Remove from UI global context
    removeProduct(product.id);

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete product");
  }
}
