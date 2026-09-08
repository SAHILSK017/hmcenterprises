"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Headphones,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

type CategoryItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  productCount?: number;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    api<{ items: CategoryItem[] }>(`/api/admin/categories?${p}`)
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
      await api("/api/admin/categories/seed-defaults", { method: "POST" });
      toast.success("Default categories synced and products linked!");
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
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      setName("");
      setSlug("");
      setDescription("");
      setShowAddForm(false);
      toast.success("Category created successfully");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: CategoryItem) => {
    try {
      await api(`/api/admin/categories/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      toast.success(`Category ${item.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const remove = async (item: CategoryItem) => {
    if (
      !confirm(
        `Delete category "${item.name}"? ${
          item.productCount ? `(${item.productCount} product(s) linked)` : ""
        }`
      )
    ) {
      return;
    }
    try {
      await api(`/api/admin/categories/${item._id}`, { method: "DELETE" });
      toast.success("Category deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete category");
    }
  };

  const getCategoryIcon = (s: string) => {
    const key = s.toLowerCase();
    if (key.includes("mac") || key.includes("laptop")) {
      return <Laptop className="h-4 w-4 text-purple-600" />;
    }
    if (key.includes("old") || key.includes("used") || key.includes("refurbished")) {
      return <RotateCcw className="h-4 w-4 text-amber-600" />;
    }
    if (key.includes("acc") || key.includes("audio")) {
      return <Headphones className="h-4 w-4 text-blue-600" />;
    }
    return <Smartphone className="h-4 w-4 text-emerald-600" />;
  };

  const totalProducts = items.reduce((acc, c) => acc + (c.productCount || 0), 0);
  const activeCount = items.filter((c) => c.isActive !== false).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Organize, index, and manage your product catalog categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncDefaults}
            disabled={syncing}
            className="text-xs h-9 gap-1.5"
            title="Ensures Phone, Old Phone, Accessories, and Mac exist and links unassigned products"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Default Categories"}
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs h-9 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? "Cancel" : "Add Category"}
          </Button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total Categories
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Categorized Products
          </span>
          <p className="mt-1 text-2xl font-bold text-[#0D9488]">{totalProducts}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Active Status
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {activeCount} / {items.length}
          </p>
        </div>
      </div>

      {/* ADD CATEGORY CARD (EXPANDABLE) */}
      {showAddForm && (
        <form
          onSubmit={create}
          className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#0D9488]" />
              New Category Details
            </h3>
            <span className="text-xs text-slate-500">* Required</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smartwatches"
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
                placeholder="e.g. smartwatches (auto-generated if empty)"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Description (Optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of products in this category"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"
            />
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
              {saving ? "Saving…" : "Save Category"}
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
            placeholder="Search categories by name, slug, or description…"
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
                <th className="px-4 py-3 font-semibold">Category Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Linked Products</th>
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
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                        {getCategoryIcon(item.slug)}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    /{item.slug}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                    {item.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products?category=${item.slug}`}
                      className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-[#0D9488] border border-teal-200 hover:bg-teal-100 transition-colors"
                      title="Click to view and filter products in this category"
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
                        href={`/admin/products?category=${item.slug}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title="View products"
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
                        title="Delete category"
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
            <p>No categories found matching your query.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncDefaults}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync Default Categories (Phone, Old Phone, Accessories, Mac)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
