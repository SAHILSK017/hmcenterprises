"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Log = {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: unknown;
  createdAt: string;
  actor?: { name?: string; email?: string };
};

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState<Log[]>([]);

  useEffect(() => {
    api<{ items: Log[] }>("/api/admin/audit-logs")
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Audit logs</h2>
        <p className="text-sm text-slate-500">Tracked admin actions across the system.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              {["When", "Admin", "Action", "Resource", "Record"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3">{l.actor?.name || "System"}</td>
                <td className="px-4 py-3 font-semibold">{l.action}</td>
                <td className="px-4 py-3">{l.resource}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.resourceId || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <p className="py-12 text-center text-sm text-slate-400">
            No audit entries yet. Repair updates and inventory adjustments are logged here.
          </p>
        )}
      </div>
    </div>
  );
}
