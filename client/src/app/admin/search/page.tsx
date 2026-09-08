"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

type Item = {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!q) {
      setItems([]);
      return;
    }
    api<{ items: Item[] }>(`/api/admin/search?q=${encodeURIComponent(q)}`)
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, [q]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Search</h2>
        <p className="text-sm text-slate-500">
          Results for <span className="font-semibold text-slate-800">“{q}”</span>
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.href}
            className="block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-[#0071e3]/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0071e3]">{item.type}</p>
            <p className="mt-0.5 text-sm font-bold">{item.title}</p>
            <p className="text-xs text-slate-500">{item.subtitle}</p>
          </Link>
        ))}
        {q && !items.length && (
          <p className="rounded-xl border border-dashed py-12 text-center text-sm text-slate-400">
            No matches found.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Searching…</p>}>
      <SearchInner />
    </Suspense>
  );
}
