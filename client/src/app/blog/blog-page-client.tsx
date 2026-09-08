"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Mobile Tips",
  "Repair Guides",
  "Battery Care",
  "Buying Guide",
  "Used Phone Guide",
  "Sell Your Phone",
  "Troubleshooting",
];

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  publishedAt?: string;
  readingMinutes?: number;
};

export default function BlogPageClient() {
  const [items, setItems] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "9");
    if (q) p.set("q", q);
    if (category !== "All") p.set("category", category);
    const t = setTimeout(() => {
      setLoading(true);
      api<{ items: Post[]; total: number }>(`/api/blog?${p}`)
        .then((d) => {
          setItems(d.items || []);
          setTotal(d.total || 0);
        })
        .catch(() => {
          setItems([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, category, page]);

  const featured = items[0];
  const rest = items.slice(1);
  const pages = Math.max(1, Math.ceil(total / 9));

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="border-b border-border bg-white">
        <div className="container-page py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">HMC Journal</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-3 max-w-xl text-foreground/60">
            Guides for repairing, buying, and selling mobile phones.
          </p>
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search articles…"
              className="h-11 w-full rounded-lg border border-black/10 bg-[#f5f5f7] pl-10 pr-4 text-sm outline-none focus:border-brand/40 focus:bg-white"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold",
                  category === c ? "bg-foreground text-white" : "bg-[#f5f5f7] text-foreground/65"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-foreground/50">No articles found.</p>
        ) : (
          <>
            {featured && page === 1 && (
              <Link
                href={`/blog/${featured.slug}`}
                className="mb-8 grid overflow-hidden rounded-3xl border border-black/[0.06] bg-white lg:grid-cols-2"
              >
                <div className="aspect-[16/10] bg-[#eceef2] lg:aspect-auto lg:min-h-[320px]">
                  {featured.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.featuredImage} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
                    Featured · {featured.category}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">{featured.title}</h2>
                  <p className="mt-3 text-foreground/60">{featured.excerpt}</p>
                  <p className="mt-6 text-xs text-foreground/40">
                    {featured.publishedAt ? formatDate(featured.publishedAt) : ""} ·{" "}
                    {featured.readingMinutes || 4} min read
                  </p>
                </div>
              </Link>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(page === 1 ? rest : items).map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-transform hover:-translate-y-0.5"
                >
                  <div className="aspect-[16/10] bg-[#eceef2]">
                    {post.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.featuredImage} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
                      {post.category}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/55">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-9 rounded-lg border px-3 text-sm font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-foreground/55">
                  Page {page} of {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 rounded-lg border px-3 text-sm font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
