"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Smartphone,
  RotateCcw,
  Headphones,
  Laptop,
  Search,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Product = {
  _id: string;
  name: string;
  brand: string;
  sku?: string;
  price: number;
  stock: number;
  condition: string;
  productType?: string;
  category?: { _id: string; name: string; slug: string };
  isActive?: boolean;
  images?: Array<{ url: string; isPrimary?: boolean }>;
};

type CategoryCounts = {
  all: number;
  phone: number;
  oldPhone: number;
  accessories: number;
  mac: number;
};

type ApiResponse = {
  items: Product[];
  total: number;
  categoryCounts?: CategoryCounts;
};

const POPULAR_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Google",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Nothing",
  "boAt",
  "Spigen",
  "Motorola",
];

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "";

  const [items, setItems] = useState<Product[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [q, setQ] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("");
  const [counts, setCounts] = useState<CategoryCounts>({
    all: 0,
    phone: 0,
    oldPhone: 0,
    accessories: 0,
    mac: 0,
  });
  const [loading, setLoading] = useState(true);

  // Sync state if URL query params change
  useEffect(() => {
    const urlCat = searchParams.get("category");
    const urlBrand = searchParams.get("brand");
    if (urlCat) setCategory(urlCat);
    if (urlBrand) setBrand(urlBrand);
  }, [searchParams]);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set("limit", "100");
    if (q) p.set("q", q);
    if (category && category !== "all") p.set("category", category);
    if (brand && brand !== "all") p.set("brand", brand);
    if (stock) p.set("stock", stock);
    if (status) p.set("status", status);

    api<ApiResponse>(`/api/products/admin/all?${p}`)
      .then((d) => {
        setItems(d.items || []);
        if (d.categoryCounts) {
          setCounts(d.categoryCounts);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q, category, brand, stock, status]);

  const toggleActive = async (p: Product) => {
    try {
      await api(`/api/products/admin/${p._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      toast.success(p.isActive ? "Deactivated" : "Activated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await api(`/api/products/admin/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const clearFilters = () => {
    setCategory("all");
    setBrand("");
    setQ("");
    setStock("");
    setStatus("");
  };

  const hasActiveFilters =
    category !== "all" || brand !== "" || q !== "" || stock !== "" || status !== "";

  const getProductCategory = (p: Product) => {
    if (p.category?.name) return p.category.name;
    if (p.productType === "mac" || /mac|imac/i.test(p.name)) return "Mac";
    if (p.productType === "accessory") return "Accessories";
    if (p.condition === "new") return "Phone";
    return "Old Phone";
  };

  const getCategoryBadgeClass = (catName: string) => {
    const k = catName.toLowerCase();
    if (k.includes("mac")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (k.includes("old") || k.includes("used"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (k.includes("acc")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-teal-50 text-teal-700 border-teal-200";
  };

  return (
    <div className="space-y-4">
      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Catalog inventory, pricing, brand & category index.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-[#0D9488] hover:bg-[#0F766E] text-white gap-1.5 text-xs h-9">
            <Plus className="h-3.5 w-3.5" />
            Add product
          </Button>
        </Link>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            category === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          All Products
          {counts.all > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                category === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {counts.all}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCategory("phone")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            category === "phone"
              ? "bg-[#0D9488] text-white"
              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Phones (New)
          {counts.phone > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                category === "phone" ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-800"
              }`}
            >
              {counts.phone}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCategory("old-phone")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            category === "old-phone"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Old Phones (Used / Refurbished)
          {counts.oldPhone > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                category === "old-phone" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {counts.oldPhone}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCategory("accessories")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            category === "accessories"
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          <Headphones className="h-3.5 w-3.5" />
          Accessories
          {counts.accessories > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                category === "accessories" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              {counts.accessories}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCategory("mac")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            category === "mac"
              ? "bg-purple-600 text-white"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          Mac
          {counts.mac > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                category === "mac" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"
              }`}
            >
              {counts.mac}
            </span>
          )}
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, SKU, brand, model…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs"
          />
        </div>

        {/* BRAND FILTER */}
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
        >
          <option value="">All Brands</option>
          {POPULAR_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* STOCK FILTER */}
        <select
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
        >
          <option value="">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock (&le; 3)</option>
          <option value="out">Out of stock</option>
        </select>

        {/* STATUS FILTER */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            title="Reset all filters"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Type / Condition</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const img = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url;
                const catName = getProductCategory(p);

                return (
                  <tr
                    key={p._id}
                    className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <Smartphone className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {p.sku || "No SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getCategoryBadgeClass(
                          catName
                        )}`}
                      >
                        {catName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <button
                        type="button"
                        onClick={() => setBrand(p.brand)}
                        className="hover:underline hover:text-[#0D9488]"
                        title={`Filter by brand ${p.brand}`}
                      >
                        {p.brand}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.productType || p.condition} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      {p.stock <= 0 ? (
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                          Out of stock
                        </span>
                      ) : p.stock <= 3 ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          {p.stock} left
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-800">
                          {p.stock} in stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.isActive === false ? "inactive" : "active"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(p)}
                          className="text-xs font-semibold text-[#0071e3] hover:underline"
                        >
                          {p.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p._id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && !items.length && (
          <div className="py-12 text-center text-sm text-slate-400 space-y-2">
            <p>No products found matching your active filters.</p>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={clearFilters} className="text-xs">
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-slate-400">Loading catalog…</div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
