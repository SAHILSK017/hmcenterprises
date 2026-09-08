"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type MarketplaceProduct } from "@/lib/shop";
import {
  ShopFiltersPanel,
  type ShopFiltersState,
} from "@/components/shop/shop-filters-panel";
import { MarketplaceProductCard } from "@/components/shop/marketplace-product-card";

const EMPTY_FILTERS: ShopFiltersState = {
  brands: [],
  conditions: [],
  categories: [],
  rams: [],
  storages: [],
  warranties: [],
};

const DEFAULT_FILTERS: ShopFiltersState = {
  ...EMPTY_FILTERS,
  categories: ["phone"],
};

function filtersFromParams(params: URLSearchParams): ShopFiltersState {
  const rawCats = params.get("category")?.split(",").filter(Boolean) || [];
  const normalizedCats = rawCats.map((c) => {
    if (c === "new") return "phone";
    if (c === "used" || c === "refurbished") return "old-phone";
    if (c === "accessory") return "accessories";
    return c;
  });

  const fromUrl = {
    brands: params.get("brand")?.split(",").filter(Boolean) || [],
    conditions: params.get("condition")?.split(",").filter(Boolean) || [],
    categories: normalizedCats,
    rams: params.get("ram")?.split(",").filter(Boolean) || [],
    storages: params.get("storage")?.split(",").filter(Boolean) || [],
    warranties: (params.get("warranty")?.split(",").filter(Boolean) || []).map(Number),
    batteryMin: params.get("batteryMin") ? Number(params.get("batteryMin")) : undefined,
    ratingMin: params.get("ratingMin") ? Number(params.get("ratingMin")) : undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    pricePreset: params.get("pricePreset") || undefined,
  };
  // Default shop landing: Phone selected when no category is in the URL
  if (!params.has("category")) {
    return { ...fromUrl, categories: ["phone"] };
  }
  return fromUrl;
}

function buildQuery(filters: ShopFiltersState, q: string, sort: string, page: number) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (sort && sort !== "popularity") p.set("sort", sort);
  if (page > 1) p.set("page", String(page));
  if (filters.brands.length) p.set("brand", filters.brands.join(","));
  if (filters.conditions.length) p.set("condition", filters.conditions.join(","));
  if (filters.categories.length) p.set("category", filters.categories.join(","));
  if (filters.rams.length) p.set("ram", filters.rams.join(","));
  if (filters.storages.length) p.set("storage", filters.storages.join(","));
  if (filters.warranties.length) p.set("warranty", filters.warranties.join(","));
  if (filters.batteryMin != null) p.set("batteryMin", String(filters.batteryMin));
  if (filters.ratingMin != null) p.set("ratingMin", String(filters.ratingMin));
  if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
  if (filters.pricePreset) p.set("pricePreset", filters.pricePreset);
  return p;
}

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ShopFiltersState>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString()))
  );
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "popularity");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MarketplaceProduct[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const syncUrl = useCallback(
    (nextFilters: ShopFiltersState, nextQ: string, nextSort: string, nextPage: number) => {
      const p = buildQuery(nextFilters, nextQ, nextSort, nextPage);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const p = buildQuery(filters, q, sort, page);
    p.set("limit", "12");
    const timer = setTimeout(() => {
      setLoading(true);
      api<{ items: MarketplaceProduct[]; total: number }>(`/api/products?${p}`)
        .then((d) => {
          setItems(d.items || []);
          setTotal(d.total || 0);
        })
        .catch(() => {
          setItems([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 250);
    syncUrl(filters, q, sort, page);
    return () => clearTimeout(timer);
  }, [filters, q, sort, page, syncUrl]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      api<{ items: MarketplaceProduct[] }>(`/api/products/suggest?q=${encodeURIComponent(q.trim())}`)
        .then((d) => setSuggestions(d.items || []))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeSection = filters.categories.length === 1 ? filters.categories[0] : "";
  const resultsLabel =
    activeSection === "accessory"
      ? "accessories"
      : activeSection === "mac"
        ? "Mac devices"
        : activeSection === "new"
          ? "new phones"
          : activeSection === "refurbished"
            ? "refurbished phones"
            : "products";

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((s) => s.value === sort)?.label || "Popularity",
    [sort]
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <div className="border-b border-[#E2E8F0] bg-white shadow-xs">
        <div className="container-page py-4 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="relative min-w-0 w-full max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder="Search phones, Mac, brands, models, SKU…"
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm font-medium outline-none focus:border-[#0D9488] focus:bg-white transition-colors"
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
                  {suggestions.map((s) => (
                    <Link
                      key={s._id}
                      href={`/product/${s.slug}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0FDFA]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.images?.[0]?.url}
                        alt=""
                        className="h-10 w-10 rounded bg-[#F8FAFC] object-contain"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#111827]">{s.name}</p>
                        <p className="text-xs font-semibold text-[#64748B]">
                          {s.brand} · {formatCurrency(s.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "new", label: "New Phone", activeBg: "bg-[#0D9488] text-white shadow-[0_4px_14px_rgba(13,148,136,0.28)]" },
                  { id: "refurbished", label: "Refurbished Phone", activeBg: "bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.28)]" },
                  { id: "mac", label: "Mac", activeBg: "bg-[#0D9488] text-white shadow-[0_4px_14px_rgba(13,148,136,0.28)]" },
                  { id: "accessory", label: "Accessories", activeBg: "bg-[#00B8D9] text-white shadow-[0_4px_14px_rgba(0,184,217,0.28)]" },
                ] as const
              ).map((tab) => {
                const active = filters.categories.length === 1 && filters.categories[0] === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        categories: active ? [] : [tab.id],
                      }));
                      setPage(1);
                    }}
                    className={cn(
                      "h-11 rounded-xl px-4 text-sm font-bold transition-all",
                      active
                        ? tab.activeBg
                        : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0D9488]/40 hover:text-[#0D9488]"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-4 lg:py-6">
        <div className="mb-3 flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-sm font-semibold"
          >
            <Filter className="h-4 w-4" /> FILTER
          </button>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-sm font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4" /> SORT
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
          <div className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-black/[0.06] bg-white p-4">
              <ShopFiltersPanel
                value={filters}
                onChange={(next) => {
                  setFilters(next);
                  setPage(1);
                }}
                onClear={clearFilters}
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-3">
              <p className="text-sm text-foreground/60">
                Showing <span className="font-semibold text-foreground">{total}</span> {resultsLabel}
              </p>
              <label className="hidden items-center gap-2 text-sm text-foreground/60 lg:flex">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-foreground outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm font-semibold text-foreground/70 lg:hidden">{sortLabel}</p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-xl bg-white" />
                ))}
              </div>
            ) : items.length ? (
              <div className="space-y-3">
                {items.map((product) => (
                  <MarketplaceProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
                <p className="text-lg font-bold">No products match these filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-[#0D9488]"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-foreground/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold">Filters</p>
              <button type="button" onClick={() => setFilterOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <ShopFiltersPanel
              value={filters}
              onChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
              onClear={clearFilters}
            />
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="mt-3 h-11 w-full rounded-lg bg-[#0D9488] text-sm font-bold text-white"
            >
              Show {total} results
            </button>
          </div>
        </div>
      )}

      {sortOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSortOpen(false)}
            aria-label="Close sort"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">Sort by</p>
              <button type="button" onClick={() => setSortOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setSort(o.value);
                    setPage(1);
                    setSortOpen(false);
                  }}
                  className={cn(
                    "flex w-full rounded-lg px-3 py-3 text-left text-sm",
                    sort === o.value
                      ? "bg-[#0D9488]/10 font-bold text-[#0D9488]"
                      : "hover:bg-[#f5f5f7]"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
