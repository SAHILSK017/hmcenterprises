"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);

  useEffect(() => {
    api<{ items: AdminUser[] }>("/api/admin/users")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Admin users</h2>
        <p className="text-sm text-slate-500">
          Staff accounts with admin role. Fine-grained roles can be expanded later.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              {["Name", "Email", "Phone", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="py-10 text-center text-sm text-slate-400">No admin users found.</p>}
      </div>
    </div>
  );
}
