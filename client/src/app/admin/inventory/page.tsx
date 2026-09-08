"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  _id: string;
  name: string;
  sku?: string;
  brand: string;
  stock: number;
  available: number;
  minimumStock: number;
  status: string;
  price: number;
};

export default function AdminInventoryPage() {
  const [summary, setSummary] = useState({
    totalStock: 0,
    stockValue: 0,
    lowStock: 0,
    outOfStock: 0,
    products: 0,
  });
  const [items, setItems] = useState<Row[]>([]);
  const [adjustId, setAdjustId] = useState("");
  const [qty, setQty] = useState("1");
  const [type, setType] = useState("in");
  const [reason, setReason] = useState("");

  const load = () =>
    api<{ summary: typeof summary; items: Row[] }>("/api/admin/inventory")
      .then((d) => {
        setSummary(d.summary);
        setItems(d.items || []);
      })
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const adjust = async () => {
    if (!adjustId) return toast.error("Select a product");
    try {
      await api("/api/admin/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId: adjustId,
          quantity: Number(qty),
          type,
          reason,
        }),
      });
      toast.success("Stock updated");
      setReason("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Adjust failed");
    }
  };

  const cards = [
    { label: "Total stock", value: summary.totalStock },
    { label: "Stock value", value: formatCurrency(summary.stockValue) },
    { label: "Low stock", value: summary.lowStock },
    { label: "Out of stock", value: summary.outOfStock },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Inventory</h2>
        <p className="text-sm text-slate-500">Stock levels and adjustments.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold">Stock adjustment</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          <select
            value={adjustId}
            onChange={(e) => setAdjustId(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-2 text-sm sm:col-span-2"
          >
            <option value="">Select product</option>
            {items.map((i) => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg border px-2 text-sm">
            <option value="in">Stock in</option>
            <option value="out">Stock out</option>
            <option value="damage">Damage</option>
            <option value="return">Return</option>
            <option value="adjust">Adjust</option>
          </select>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-10 rounded-lg border px-3 text-sm"
            placeholder="Qty"
          />
          <Button onClick={adjust}>Apply</Button>
        </div>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason / reference note"
          className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              {["Product", "SKU", "Available", "Min", "Status", "Value"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id} className="border-t">
                <td className="px-4 py-3 font-semibold">
                  {i.name}
                  <p className="text-[11px] font-normal text-slate-400">{i.brand}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">{i.sku || "—"}</td>
                <td className="px-4 py-3 font-semibold">{i.available}</td>
                <td className="px-4 py-3">{i.minimumStock}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={i.status} />
                </td>
                <td className="px-4 py-3">{formatCurrency(i.available * i.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
