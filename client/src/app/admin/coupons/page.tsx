"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Coupon = {
  _id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  expiresAt?: string;
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "10",
    minOrderAmount: "0",
  });

  const load = () =>
    api<{ items: Coupon[] }>("/api/admin/coupons")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      await api("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrderAmount: Number(form.minOrderAmount) || 0,
        }),
      });
      toast.success("Coupon created");
      setForm({ code: "", type: "percentage", value: "10", minOrderAmount: "0" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const deactivate = async (id: string) => {
    try {
      await api(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    try {
      await api(`/api/admin/coupons/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Coupons</h2>
        <p className="text-sm text-slate-500">Discount codes for checkout.</p>
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
        <input
          placeholder="CODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="h-10 rounded-lg border px-3 text-sm"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-10 rounded-lg border px-3 text-sm"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed ₹</option>
        </select>
        <input
          type="number"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="h-10 rounded-lg border px-3 text-sm"
          placeholder="Value"
        />
        <input
          type="number"
          value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          className="h-10 rounded-lg border px-3 text-sm"
          placeholder="Min order"
        />
        <Button onClick={create}>Create</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              {["Code", "Type", "Value", "Used", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-4 py-3 font-bold">{c.code}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">
                  {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                </td>
                <td className="px-4 py-3">
                  {c.usedCount || 0}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.isActive === false ? "inactive" : "active"} />
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="mr-3 text-xs font-semibold text-[#0071e3]" onClick={() => deactivate(c._id)}>
                    Deactivate
                  </button>
                  <button type="button" className="text-xs font-semibold text-red-600" onClick={() => remove(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="py-10 text-center text-sm text-slate-400">No coupons yet.</p>}
      </div>
    </div>
  );
}
