"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

type BrandItem = {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive?: boolean;
  productCount?: number;
};

export default function AdminBrandsPage() {
  const [items, setItems] = useState<BrandItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    api<{ items: BrandItem[] }>(`/api/admin/brands?${p}`)
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q]);

  const handleSyncDefaults = async () => {
    setSyncing(true);
    try {
      await api("/api/admin/brands/seed-defaults", { method: "POST" });
      toast.success("Default brands synced successfully!");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/brands", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          logo: logo.trim() || undefined,
        }),
      });
      setName("");
      setSlug("");
      setLogo("");
      setShowAddForm(false);
      toast.success("Brand created successfully");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create brand");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: BrandItem) => {
    try {
      await api(`/api/admin/brands/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      toast.success(`Brand ${item.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const remove = async (item: BrandItem) => {
    if (
      !confirm(
        `Delete brand "${item.name}"? ${
          item.productCount ? `(${item.productCount} product(s) linked)` : ""
        }`
      )
    ) {
      return;
    }
    try {
      await api(`/api/admin/brands/${item._id}`, { method: "DELETE" });
      toast.success("Brand deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete brand");
    }
  };

  const totalProducts = items.reduce((acc, b) => acc + (b.productCount || 0), 0);
  const brandsWithProducts = items.filter((b) => (b.productCount || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brands</h1>
          <p className="text-sm text-slate-500">
            Manage, index, and organize phone and accessory brands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncDefaults}
            disabled={syncing}
            className="text-xs h-9 gap-1.5"
            title="Ensures major brands (Apple, Samsung, OnePlus, Nothing, etc.) are indexed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Default Brands"}
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs h-9 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? "Cancel" : "Add Brand"}
          </Button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Brands
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Brands in Catalog
          </span>
          <p className="mt-1 text-2xl font-bold text-[#0D9488]">
            {brandsWithProducts} <span className="text-xs font-normal text-slate-500">with products</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Inventory Items
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{totalProducts}</p>
        </div>
      </div>

      {/* ADD BRAND FORM (EXPANDABLE) */}
      {showAddForm && (
        <form
          onSubmit={create}
          className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-[#0D9488]" />
              New Brand Details
            </h3>
            <span className="text-xs text-slate-500">* Required</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Brand Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Slug (Optional)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. sony (auto-generated if empty)"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Logo URL (Optional)
              </label>
              <input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://... logo image link"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              size="sm"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs h-8"
            >
              {saving ? "Saving…" : "Save Brand"}
            </Button>
          </div>
        </form>
      )}

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brands by name or slug…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Catalog Products</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-xs text-slate-700 uppercase">
                        {item.name.slice(0, 2)}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {item.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products?brand=${encodeURIComponent(item.name)}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border transition-colors ${
                        (item.productCount || 0) > 0
                          ? "bg-teal-50 text-[#0D9488] border-teal-200 hover:bg-teal-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                      title={`Click to view all ${item.name} products`}
                    >
                      {item.productCount ?? 0} products
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.isActive === false ? "inactive" : "active"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products?brand=${encodeURIComponent(item.name)}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title={`View ${item.name} products`}
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border transition-colors ${
                          item.isActive === false
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item.isActive === false ? "Activate" : "Deactivate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(item)}
                        className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete brand"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !items.length && (
          <div className="px-4 py-12 text-center text-sm text-slate-400 space-y-2">
            <p>No brands found matching your search query.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncDefaults}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync Default Brands
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
