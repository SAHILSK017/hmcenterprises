"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Customer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const p = q ? `?q=${encodeURIComponent(q)}` : "";
      api<{ items: Customer[] }>(`/api/admin/customers${p}`)
        .then((d) => setItems(d.items || []))
        .catch(() => setItems([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Customers</h2>
        <p className="text-sm text-slate-500">Customer profiles linked to orders and service requests.</p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, phone…"
        className="h-10 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 text-sm"
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              {["Name", "Contact", "Joined", ""].map((h) => (
                <th key={h || "a"} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {c.phone}
                  <br />
                  <span className="text-xs">{c.email}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c._id}`} className="text-xs font-semibold text-[#0071e3]">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="py-12 text-center text-sm text-slate-400">No customers found.</p>}
      </div>
    </div>
  );
}
