"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  Smartphone,
  Wrench,
  ExternalLink,
  ImageIcon,
  Send,
  Check,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { REPAIR_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Repair = {
  _id: string;
  repairId: string;
  name: string;
  phone: string;
  email?: string;
  preferredContact?: "whatsapp" | "call" | "either";
  brand: string;
  model: string;
  problemCategory?: string;
  problemDescription: string;
  status: string;
  diagnosis?: string;
  quoteAmount?: number;
  estimatedDays?: number;
  images?: Array<{ url: string; publicId: string }>;
  statusHistory?: Array<{ status: string; note?: string; changedAt: string }>;
  messages?: Array<{
    _id?: string;
    direction: string;
    channel: string;
    body: string;
    deliveryStatus?: string;
    createdAt: string;
  }>;
  createdAt: string;
  completedAt?: string;
};

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Repair | null>(null);
  const [status, setStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const load = () =>
    api<Repair>(`/api/repairs/${id}`).then((x) => {
      setItem(x);
      setStatus(x.status);
      setDiagnosis(x.diagnosis || "");
      setAmount(x.quoteAmount ? String(x.quoteAmount) : "");
      setDays(x.estimatedDays ? String(x.estimatedDays) : "");
    });

  useEffect(() => {
    void load().catch(() => toast.error("Failed to load repair details"));
  }, [id]);

  const update = async (body: object) => {
    setSaving(true);
    try {
      await api(`/api/repairs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.success("Repair updated successfully");
      setStatusNote("");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete repair request "${item?.repairId}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await api(`/api/repairs/${id}`, { method: "DELETE" });
      toast.success("Repair request deleted");
      router.push("/admin/repairs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete repair");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !item) return;
    setSendingMsg(true);
    try {
      await api("/api/whatsapp", {
        method: "POST",
        body: JSON.stringify({
          to: item.phone,
          message: message.trim(),
          relatedModel: "RepairRequest",
          relatedId: item._id,
        }),
      });
      toast.success("WhatsApp message queued");
      setMessage("");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSendingMsg(false);
    }
  };

  if (!item) {
    return (
      <div className="w-full py-12 text-center text-sm text-slate-400">
        Loading repair details…
      </div>
    );
  }

  const cleanPhone = item.phone.replace(/\D/g, "");
  const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${item.name}, regarding your HMC Mobile repair request *${item.repairId}* for ${item.brand} ${item.model}:`
  )}`;

  return (
    <div className="w-full space-y-6">
      {/* TOP HEADER WITH NAVIGATION & QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/admin/repairs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D9488] mb-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all repairs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {item.repairId}
            </h1>
            <StatusBadge status={item.status} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Submitted on {formatDate(item.createdAt)} · {item.brand} {item.model}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Chat on WhatsApp
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

          {item.status !== "completed" && (
            <Button
              onClick={() => update({ status: "completed", note: "Marked as completed by admin" })}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-9"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as Completed
            </Button>
          )}

          <Button
            variant="danger"
            onClick={handleDelete}
            className="gap-1.5 text-xs h-9"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* FULL SCREEN 2-COLUMN / 3-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN COLUMN (LEFT 2 COLS) */}
        <div className="space-y-6 lg:col-span-2">
          {/* DEVICE & PROBLEM DETAILS */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Smartphone className="h-4 w-4 text-[#0D9488]" />
                  Device & Reported Issue
                </CardTitle>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.brand}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Device Model
                  </span>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {item.brand} {item.model}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Problem Category
                  </span>
                  <p className="mt-1 text-base font-bold capitalize text-[#0D9488]">
                    {item.problemCategory ? item.problemCategory.replace(/_/g, " ") : "General inspection"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Customer Issue Description
                </Label>
                <div className="mt-1.5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {item.problemDescription || "No detailed description provided."}
                </div>
              </div>

              {/* UPLOADED PHOTOS */}
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                  Uploaded Photos ({item.images?.length || 0})
                </Label>
                {item.images && item.images.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {item.images.map((img, i) => (
                      <a
                        key={i}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs hover:opacity-95"
                      >
                        <img
                          src={img.url}
                          alt={`Device photo ${i + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          View Full Size ↗
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400 italic">
                    No device photos were uploaded by the customer for this request.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DIAGNOSIS & QUOTE MANAGEMENT */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Wrench className="h-4 w-4 text-[#0D9488]" />
                Diagnosis & Quotation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="diagnosis" className="text-xs font-semibold text-slate-600">
                  Technician Diagnosis Notes
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Describe parts needing replacement, technical findings, or repair plan…"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 min-h-[90px] text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="amount" className="text-xs font-semibold text-slate-600">
                    Quote Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g. 2499"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 text-sm font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="days" className="text-xs font-semibold text-slate-600">
                    Estimated Days to Complete
                  </Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="e.g. 1 or 2"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {item.quoteAmount ? (
                  <div className="text-sm">
                    <span className="text-xs text-slate-400">Current Quote: </span>
                    <span className="font-bold text-[#0D9488]">
                      {formatCurrency(item.quoteAmount)}
                    </span>
                    {item.estimatedDays && (
                      <span className="text-xs text-slate-500">
                        {" "}· {item.estimatedDays} day{item.estimatedDays > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No quote has been sent yet.</span>
                )}

                <Button
                  onClick={() =>
                    update({
                      diagnosis: diagnosis.trim(),
                      quoteAmount: amount ? Number(amount) : undefined,
                      estimatedDays: days ? Number(days) : undefined,
                    })
                  }
                  disabled={saving}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs h-9 font-semibold"
                >
                  Save & Send Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* STATUS TIMELINE & HISTORY */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Clock className="h-4 w-4 text-[#0D9488]" />
                Status Timeline & Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {item.statusHistory && item.statusHistory.length > 0 ? (
                <ol className="relative border-l border-slate-200 ml-3 space-y-4">
                  {item.statusHistory.map((h, idx) => (
                    <li key={idx} className="ml-5">
                      <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 ring-4 ring-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm capitalize text-slate-900">
                          {STATUS_LABELS[h.status] || h.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(h.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {h.note && (
                        <p className="mt-0.5 text-xs text-slate-600 bg-slate-50 rounded-md p-2 border border-slate-100 inline-block">
                          {h.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-slate-400">No status updates logged yet.</p>
              )}
            </CardContent>
          </Card>

          {/* WHATSAPP MESSAGE CENTER */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                Customer WhatsApp Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {item.messages && item.messages.length > 0 && (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {item.messages.map((m, i) => (
                    <div
                      key={m._id || i}
                      className={`rounded-xl p-3 text-xs leading-relaxed ${
                        m.direction === "outbound"
                          ? "bg-emerald-50/80 border border-emerald-100 text-emerald-950 ml-6"
                          : "bg-slate-50 border border-slate-100 text-slate-800 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-semibold text-[11px] opacity-75">
                        <span>{m.direction === "outbound" ? "Sent to Customer" : "Received"}</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p>{m.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="customMessage" className="text-xs font-semibold text-slate-600">
                  Compose WhatsApp Message
                </Label>
                <Textarea
                  id="customMessage"
                  placeholder={`Hi ${item.name}, update on your ${item.brand} ${item.model}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 min-h-[80px] text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMsg || !message.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendingMsg ? "Sending…" : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR COLUMN (RIGHT 1 COL) */}
        <div className="space-y-6">
          {/* CUSTOMER CONTACT CARD */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Phone className="h-4 w-4 text-[#0D9488]" />
                Customer Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-400">Full Name</span>
                <p className="font-bold text-slate-900 text-base">{item.name}</p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">Phone Number</span>
                <div className="mt-1 flex items-center justify-between">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-mono font-semibold text-slate-800 hover:text-[#0D9488]"
                  >
                    +91 {cleanPhone}
                  </a>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {item.email && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">Email Address</span>
                  <p className="font-medium text-slate-800 break-all">{item.email}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">Preferred Contact Mode</span>
                <p className="mt-0.5 font-semibold capitalize text-slate-800 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#0D9488]" />
                  {item.preferredContact ? item.preferredContact : "WhatsApp"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* STATUS CONTROLLER */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                Update Repair Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div>
                <Label htmlFor="statusSelect" className="text-xs font-semibold text-slate-600">
                  Current Status
                </Label>
                <Select
                  id="statusSelect"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 font-semibold"
                >
                  {REPAIR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] || s.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="statusNote" className="text-xs font-semibold text-slate-600">
                  Status Change Note (Optional)
                </Label>
                <Input
                  id="statusNote"
                  placeholder="e.g. Device received at workshop"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <Button
                onClick={() => update({ status, note: statusNote.trim() || undefined })}
                disabled={saving || status === item.status && !statusNote}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-semibold"
              >
                {saving ? "Updating…" : "Save Status Change"}
              </Button>

              {item.status !== "completed" && (
                <Button
                  onClick={() => update({ status: "completed", note: "Marked as completed" })}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Completed
                </Button>
              )}
            </CardContent>
          </Card>

          {/* REPAIR SUMMARY DETAILS */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FileText className="h-4 w-4 text-[#0D9488]" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Reference ID:</span>
                <span className="font-mono font-bold text-slate-900">{item.repairId}</span>
              </div>
              <div className="flex justify-between">
                <span>Submitted Date:</span>
                <span className="font-medium text-slate-800">{formatDate(item.createdAt)}</span>
              </div>
              {item.completedAt && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Completed At:</span>
                  <span>{formatDate(item.completedAt)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 font-medium">
                <span>Public Tracking Link:</span>
                <Link
                  href={`/track/${item.repairId}`}
                  target="_blank"
                  className="text-[#0071e3] hover:underline inline-flex items-center gap-1"
                >
                  Open ↗
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
