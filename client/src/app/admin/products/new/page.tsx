"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "Apple",
    model: "",
    sku: "",
    productType: "new",
    condition: "new",
    price: "",
    compareAtPrice: "",
    stock: "1",
    warrantyMonths: "12",
    description: "",
    imageUrl: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const imageUrl =
        form.imageUrl ||
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80";
      await api("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          model: form.model || form.name,
          sku: form.sku || undefined,
          productType: form.productType,
          condition: form.condition,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          stock: Number(form.stock) || 0,
          warrantyMonths: Number(form.warrantyMonths) || 0,
          description: form.description || `${form.name} available at HMC Mobile.`,
          images: [{ url: imageUrl, publicId: "manual-upload", isPrimary: true }],
          highlights: [],
        }),
      });
      toast.success("Product created");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-xl font-bold">Add product</h2>
        <p className="text-sm text-slate-500">Create a catalog item with pricing and stock.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {(
          [
            ["name", "Product name", "text"],
            ["brand", "Brand", "text"],
            ["model", "Model", "text"],
            ["sku", "SKU", "text"],
            ["price", "Selling price", "number"],
            ["compareAtPrice", "MRP", "number"],
            ["stock", "Stock", "number"],
            ["warrantyMonths", "Warranty (months)", "number"],
            ["imageUrl", "Primary image URL", "url"],
          ] as const
        ).map(([key, label, type]) => (
          <div key={key}>
            <label className="text-[11px] font-bold uppercase text-slate-400">{label}</label>
            <input
              required={key === "name" || key === "brand" || key === "price"}
              type={type}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400">Type</label>
            <select
              value={form.productType}
              onChange={(e) => set("productType", e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              {["new", "used", "refurbished", "accessory"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              {["new", "refurbished", "used_like_new", "used_good", "used_fair"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1 min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating…" : "Create product"}
        </Button>
      </form>
    </div>
  );
}
