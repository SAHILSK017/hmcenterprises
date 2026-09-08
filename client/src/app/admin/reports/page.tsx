"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

type Report = {
  range: number;
  sales: { orders: number; revenue: number };
  repairsByStatus: Array<{ _id: string; count: number }>;
  sellsByStatus: Array<{ _id: string; count: number }>;
  topProducts: Array<{ name: string; brand: string; soldCount: number; price: number; stock: number }>;
};

export default function AdminReportsPage() {
  const [range, setRange] = useState("30");
  const [data, setData] = useState<Report | null>(null);

  useEffect(() => {
    api<Report>(`/api/admin/reports?range=${range}`)
      .then(setData)
      .catch(() => setData(null));
  }, [range]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="text-sm text-slate-500">Sales, repairs, and buyback performance.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card label="Orders" value={data?.sales.orders ?? "—"} />
        <Card label="Revenue" value={data ? formatCurrency(data.sales.revenue) : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusList title="Repairs by status" rows={data?.repairsByStatus || []} />
        <StatusList title="Sell requests by status" rows={data?.sellsByStatus || []} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold">Top products by sold count</h3>
        <ul className="mt-3 divide-y">
          {(data?.topProducts || []).map((p) => (
            <li key={p.name} className="flex justify-between py-2 text-sm">
              <span>
                {p.name} <span className="text-slate-400">· {p.brand}</span>
              </span>
              <span className="font-semibold">{p.soldCount || 0} sold</span>
            </li>
          ))}
          {!data?.topProducts?.length && (
            <p className="py-6 text-center text-sm text-slate-400">No product sales data yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusList({ title, rows }: { title: string; rows: Array<{ _id: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r._id} className="flex justify-between text-sm">
            <span className="capitalize text-slate-600">{r._id || "unknown"}</span>
            <span className="font-semibold">{r.count}</span>
          </li>
        ))}
        {!rows.length && <p className="py-4 text-center text-sm text-slate-400">No data in range.</p>}
      </ul>
    </div>
  );
}
