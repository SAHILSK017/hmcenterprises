"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Device = {
  _id: string;
  name: string;
  brand: string;
  model?: string;
  sku?: string;
  imei?: string;
  stock: number;
  price: number;
  condition: string;
  batteryHealth?: number;
  productType?: string;
  isActive?: boolean;
};

export default function AdminImeiPage() {
  const [items, setItems] = useState<Device[]>([]);

  useEffect(() => {
    api<{ items: Device[] }>("/api/admin/imei-devices")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">IMEI devices</h2>
        <p className="text-sm text-slate-500">
          Used / refurbished unit tracking. IMEI is admin-only and never shown on the public site.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              {["Device", "IMEI", "Condition", "Battery", "Price", "Stock", "Status"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-slate-400">
                    {d.brand} {d.model || ""}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{d.imei || "—"}</td>
                <td className="px-4 py-3">{d.condition}</td>
                <td className="px-4 py-3">{d.batteryHealth ? `${d.batteryHealth}%` : "—"}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(d.price)}</td>
                <td className="px-4 py-3">{d.stock}</td>
                <td className="px-4 py-3 text-xs">{d.isActive === false ? "Inactive" : "Ready"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <p className="py-12 text-center text-sm text-slate-400">
            No used/refurbished devices with IMEI yet.{" "}
            <Link href="/admin/products/new" className="text-[#0071e3]">
              Add product
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
