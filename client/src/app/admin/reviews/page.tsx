"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Filter,
  X,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  productId: string;
  reviewId?: string;
  productName: string;
  productSlug: string;
  name: string;
  rating: number;
  title?: string;
  text: string;
  verified?: boolean;
  createdAt?: string;
  hidden?: boolean;
};

type ProductOption = {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
};

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Products for dropdown
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Add review form state
  const [form, setForm] = useState({
    productId: "",
    name: "",
    rating: 5,
    title: "",
    text: "",
    verified: true,
    date: new Date().toISOString().split("T")[0],
  });

  const loadReviews = () => {
    setLoading(true);
    api<{ items: Review[] }>("/api/admin/reviews")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    if (products.length === 0) {
      setLoadingProducts(true);
      try {
        const d = await api<{ items: ProductOption[] }>("/api/products?limit=100");
        setProducts(d.items || []);
        if (d.items && d.items.length > 0) {
          setForm((prev) => ({ ...prev, productId: d.items[0]._id }));
        }
      } catch {
        toast.error("Failed to load products list");
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Reviewer name and review text are required");
      return;
    }

    setActionLoading("creating");
    try {
      await api("/api/admin/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: form.productId,
          name: form.name.trim(),
          rating: Number(form.rating),
          title: form.title.trim(),
          text: form.text.trim(),
          verified: form.verified,
          createdAt: form.date ? new Date(form.date) : new Date(),
        }),
      });

      toast.success("Review published successfully!");
      setIsAddModalOpen(false);
      // Reset form
      setForm({
        productId: products[0]?._id || "",
        name: "",
        rating: 5,
        title: "",
        text: "",
        verified: true,
        date: new Date().toISOString().split("T")[0],
      });
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to add review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (r: Review) => {
    if (!confirm(`Are you sure you want to delete this review by "${r.name}"?`)) {
      return;
    }
    const targetId = r.reviewId || r.id;
    setActionLoading(r.id);
    try {
      await api(`/api/admin/reviews/${r.productId}/${targetId}`, {
        method: "DELETE",
      });
      toast.success("Review removed");
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((r) => {
      if (ratingFilter !== "all" && Math.round(r.rating) !== Number(ratingFilter)) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesProduct = r.productName?.toLowerCase().includes(q);
        const matchesTitle = r.title?.toLowerCase().includes(q);
        const matchesText = r.text?.toLowerCase().includes(q);
        return matchesName || matchesProduct || matchesTitle || matchesText;
      }
      return true;
    });
  }, [items, ratingFilter, searchQuery]);

  const averageRating = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((acc, cur) => acc + (cur.rating || 0), 0);
    return Math.round((total / items.length) * 10) / 10;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Reviews Management</h1>
              <p className="text-xs text-slate-500">
                Manage product & store feedback, moderate ratings, and add authentic customer testimonials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openAddModal}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm shadow-teal-600/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            + Add Review
          </Button>

          <button
            onClick={loadReviews}
            title="Refresh reviews"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* METRICS & FILTERS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Rating tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRatingFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              ratingFilter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>All Reviews</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                ratingFilter === "all" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {items.length}
            </span>
          </button>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = items.filter((r) => Math.round(r.rating) === stars).length;
            const isActive = ratingFilter === String(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(String(stars))}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center text-xs">
                  {stars} <Star className="h-3 w-3 fill-current ml-0.5 text-current" />
                </span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Avg Rating Pill */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200">
            <span className="text-slate-600 font-normal">Catalog Avg:</span>
            <span className="flex items-center gap-1 font-bold">
              {averageRating} <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-amber-600/70 text-[10px]">({items.length} ratings)</span>
          </div>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative min-w-[240px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reviews by reviewer name, product, headline, or text..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
        />
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <RefreshCw className="mx-auto h-5 w-5 animate-spin text-teal-600 mb-2" />
            Loading reviews...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">No reviews found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;+ Add Review&quot; above to add your first customer review or test testimonial.
            </p>
          </div>
        ) : (
          filteredItems.map((r, i) => (
            <article
              key={r.id || i}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{r.name}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= Math.round(r.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {r.rating.toFixed(1)} / 5
                    </span>
                    {r.createdAt && (
                      <span className="text-[10px] text-slate-400">· {formatDate(r.createdAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${r.productSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline bg-teal-50 px-2.5 py-1 rounded-md"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>{r.productName}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r)}
                    disabled={actionLoading === r.id}
                    title="Delete review"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {r.title && <p className="mt-2 text-xs font-bold text-slate-900">{r.title}</p>}
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{r.text}</p>
            </article>
          ))
        )}
      </div>

      {/* ADD REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  Add Customer Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish a customer review, rating, and testimonial for any catalog device.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {/* PRODUCT SELECTOR */}
              <div>
                <Label className="text-xs">Select Product *</Label>
                {loadingProducts ? (
                  <div className="text-xs text-slate-400 py-1">Loading product catalog...</div>
                ) : (
                  <Select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    required
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.brand ? `(${p.brand})` : ""}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              {/* REVIEWER NAME & RATING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Customer / Reviewer Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Star Rating *</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= form.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {form.rating} / 5 Stars
                    </span>
                  </div>
                </div>
              </div>

              {/* HEADLINE / TITLE */}
              <div>
                <Label className="text-xs">Review Headline (Optional)</Label>
                <Input
                  placeholder="e.g. Excellent refurbished phone, battery like new!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* REVIEW TEXT */}
              <div>
                <Label className="text-xs">Review Comment / Feedback *</Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Write detailed customer feedback, device condition review, delivery experience, etc..."
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                />
              </div>

              {/* VERIFIED & DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs">Review Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={form.verified}
                    onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="verifiedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Verified Buyer Badge
                  </label>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === "creating"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                >
                  {actionLoading === "creating" ? "Saving..." : "Publish Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
