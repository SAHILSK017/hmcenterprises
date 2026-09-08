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
  Clock,
  Smartphone,
  ExternalLink,
  ImageIcon,
  Send,
  Check,
  X,
  ShieldCheck,
  FileText,
  BadgeIndianRupee,
  Calendar,
  Layers,
  Box,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { SELL_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Checklist = {
  screen?: string;
  battery?: string;
  body?: string;
  camera?: string;
  charging?: string;
  accessories?: string[];
  billAvailable?: boolean;
  warrantyValid?: boolean;
  displayWorking?: boolean;
  biometricsWorking?: boolean;
  cameraWorking?: boolean;
  batteryOriginal?: boolean;
  powersOn?: boolean;
};

type Offer = {
  _id?: string;
  amount: number;
  note?: string;
  offeredAt?: string;
  expiresAt?: string;
  response?: "pending" | "accepted" | "rejected";
  respondedAt?: string;
};

type Sell = {
  _id: string;
  sellId: string;
  name: string;
  phone: string;
  email?: string;
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  color?: string;
  imei?: string;
  purchaseYear?: string;
  overallCondition: string;
  checklist?: Checklist;
  expectedPrice?: number;
  finalPrice?: number;
  images?: Array<{ url: string; publicId: string }>;
  status: string;
  statusHistory?: Array<{ status: string; note?: string; changedAt: string }>;
  offers?: Offer[];
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

export default function SellDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Sell | null>(null);
  const [status, setStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [amount, setAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const load = () =>
    api<Sell>(`/api/sells/${id}`).then((x) => {
      setItem(x);
      setStatus(x.status);
      if (x.offers && x.offers.length > 0) {
        const last = x.offers[x.offers.length - 1];
        setAmount(String(last.amount));
        setOfferNote(last.note || "");
      }
    });

  useEffect(() => {
    void load().catch(() => toast.error("Failed to load sell request details"));
  }, [id]);

  const update = async (body: object) => {
    setSaving(true);
    try {
      await api(`/api/sells/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.success("Sell request updated successfully");
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
        `Are you sure you want to delete sell request "${item?.sellId}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await api(`/api/sells/${id}`, { method: "DELETE" });
      toast.success("Sell request deleted");
      router.push("/admin/sells");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sell request");
    }
  };

  const handleSendOffer = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid offer amount");
      return;
    }
    setSendingOffer(true);
    try {
      const expiresAt =
        expiryDays && expiryDays !== "none"
          ? new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

      await api(`/api/sells/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          offer: {
            amount: Number(amount),
            note: offerNote.trim() || undefined,
            expiresAt,
          },
        }),
      });
      toast.success("Offer submitted successfully!");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setSendingOffer(false);
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
          relatedModel: "SellRequest",
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
        Loading sell request details…
      </div>
    );
  }

  const cleanPhone = item.phone.replace(/\D/g, "");
  const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${item.name}, regarding your HMC Mobile sell request *${item.sellId}* for ${item.brand} ${item.model} (${item.storage}):`
  )}`;

  const conditionLabels: Record<string, { label: string; class: string }> = {
    excellent: {
      label: "Like New / Excellent",
      class: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    good: {
      label: "Good Condition",
      class: "bg-teal-50 text-teal-800 border-teal-200",
    },
    fair: {
      label: "Average / Fair",
      class: "bg-amber-50 text-amber-800 border-amber-200",
    },
    poor: {
      label: "Damaged / Heavy Wear",
      class: "bg-rose-50 text-rose-800 border-rose-200",
    },
  };

  const cond = conditionLabels[item.overallCondition.toLowerCase()] || {
    label: item.overallCondition,
    class: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const latestOffer = item.offers?.[item.offers.length - 1];

  return (
    <div className="w-full space-y-6">
      {/* TOP HEADER WITH NAVIGATION & QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/admin/sells"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D9488] mb-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all sell requests
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {item.sellId}
            </h1>
            <StatusBadge status={item.status} />
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cond.class}`}
            >
              {cond.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Submitted on {formatDate(item.createdAt)} · {item.brand} {item.model}{" "}
            {item.storage && `(${item.storage})`}
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
              onClick={() =>
                update({ status: "completed", note: "Marked as completed by admin" })
              }
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
          {/* DEVICE SPECIFICATIONS CARD */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Smartphone className="h-4 w-4 text-[#0D9488]" />
                  Device Specifications
                </CardTitle>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.brand}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Brand & Model
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {item.brand} {item.model}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Storage Capacity
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#0D9488]">
                    {item.storage || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    RAM / Memory
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {item.ram || "Standard"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Device Color
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900 capitalize">
                    {item.color || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Purchase Year
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {item.purchaseYear || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    IMEI / Serial Number
                  </span>
                  <p className="mt-1 text-xs font-mono font-bold text-slate-800 break-all">
                    {item.imei || "—"}
                  </p>
                </div>
              </div>

              {/* EXPECTED VS OFFERED BANNER */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-xl border border-teal-100 bg-teal-50/50 p-3.5">
                <div>
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                    Customer Expected Price
                  </span>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">
                    {item.expectedPrice != null ? formatCurrency(item.expectedPrice) : "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                    {item.finalPrice ? "Agreed Final Price" : "Latest Offer Sent"}
                  </span>
                  <p className="mt-0.5 text-lg font-bold text-emerald-700">
                    {item.finalPrice
                      ? formatCurrency(item.finalPrice)
                      : latestOffer
                      ? formatCurrency(latestOffer.amount)
                      : "No offer made yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HARDWARE CONDITION & INSPECTION CHECKLIST CARD */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                Hardware Condition & Inspection Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* FUNCTIONAL CHECKS MATRIX */}
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Functional Checks
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {[
                    { label: "Powers On", val: item.checklist?.powersOn },
                    { label: "Display / Touch", val: item.checklist?.displayWorking },
                    { label: "Biometrics (Face/Touch)", val: item.checklist?.biometricsWorking },
                    { label: "Camera Functional", val: item.checklist?.cameraWorking },
                    { label: "Original Battery", val: item.checklist?.batteryOriginal },
                    { label: "Bill Available", val: item.checklist?.billAvailable },
                    { label: "Valid Warranty", val: item.checklist?.warrantyValid },
                  ].map((chk, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-xs ${
                        chk.val === true
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                          : chk.val === false
                          ? "border-rose-200 bg-rose-50/60 text-rose-900"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="font-medium">{chk.label}</span>
                      {chk.val === true ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Yes
                        </span>
                      ) : chk.val === false ? (
                        <span className="flex items-center gap-1 font-bold text-rose-700">
                          <X className="h-3.5 w-3.5 stroke-[2.5]" /> No / Fault
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PHYSICAL COMPONENT INSPECTION */}
              <div className="border-t border-slate-100 pt-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Physical Component Condition
                </Label>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <span className="text-slate-400 block font-medium">Screen Condition</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {item.checklist?.screen?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <span className="text-slate-400 block font-medium">Body / Frame</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {item.checklist?.body?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <span className="text-slate-400 block font-medium">Battery Status</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {item.checklist?.battery?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <span className="text-slate-400 block font-medium">Charging Port</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {item.checklist?.charging?.replace(/_/g, " ") || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACCESSORIES INCLUDED */}
              <div className="border-t border-slate-100 pt-3">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-slate-400" />
                  Included Accessories
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.checklist?.accessories && item.checklist.accessories.length > 0 ? (
                    item.checklist.accessories.map((acc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 capitalize shadow-2xs"
                      >
                        <Check className="h-3 w-3 text-emerald-600" />
                        {acc.replace(/_/g, " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No additional accessories reported by customer (Device only).
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UPLOADED PHOTOS GALLERY */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <ImageIcon className="h-4 w-4 text-[#0D9488]" />
                  Uploaded Device Photos ({item.images?.length || 0})
                </CardTitle>
                <span className="text-xs text-slate-400">Click to preview full size</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {item.images && item.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
                        alt={`Device image ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        View Full Size ↗
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No device photos were uploaded for this sell request.
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRICE OFFER & COUNTER-OFFER MANAGEMENT */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <BadgeIndianRupee className="h-4 w-4 text-emerald-600" />
                Make or Update Buyback Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="offerAmount" className="text-xs font-semibold text-slate-600">
                    Offer Amount (₹) *
                  </Label>
                  <Input
                    id="offerAmount"
                    type="number"
                    placeholder="e.g. 18500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDays" className="text-xs font-semibold text-slate-600">
                    Offer Validity
                  </Label>
                  <Select
                    id="expiryDays"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="mt-1 text-sm font-medium"
                  >
                    <option value="3">Valid for 3 Days</option>
                    <option value="7">Valid for 7 Days</option>
                    <option value="14">Valid for 14 Days</option>
                    <option value="none">No Expiration</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="offerNote" className="text-xs font-semibold text-slate-600">
                  Offer Note / Breakdown (Optional)
                </Label>
                <Textarea
                  id="offerNote"
                  placeholder="e.g. Deducted ₹1,000 for minor body wear, display is rated excellent. Instant UPI payout on handover."
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="mt-1 min-h-[75px] text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {latestOffer ? (
                  <div className="text-xs text-slate-500">
                    Latest offer:{" "}
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(latestOffer.amount)}
                    </span>{" "}
                    ({latestOffer.response || "pending"})
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No offer recorded yet.</span>
                )}

                <Button
                  onClick={handleSendOffer}
                  disabled={sendingOffer || !amount}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold"
                >
                  {sendingOffer ? "Sending…" : "Send / Update Offer"}
                </Button>
              </div>

              {/* PREVIOUS OFFERS LIST */}
              {item.offers && item.offers.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                    Offer History
                  </span>
                  <div className="space-y-2">
                    {item.offers.map((off, idx) => (
                      <div
                        key={off._id || idx}
                        className="flex flex-wrap items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {formatCurrency(off.amount)}
                          </span>
                          {off.note && (
                            <p className="text-slate-600 text-[11px] mt-0.5">{off.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              off.response === "accepted"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : off.response === "rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {off.response || "pending"}
                          </span>
                          {off.offeredAt && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {new Date(off.offeredAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STATUS TIMELINE & ACTIVITY LOG */}
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
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
                  placeholder={`Hi ${item.name}, regarding your ${item.brand} ${item.model}...`}
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
            </CardContent>
          </Card>

          {/* STATUS CONTROLLER */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                Update Sell Status
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
                  {SELL_STATUSES.map((s) => (
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
                  placeholder="e.g. Device received for physical inspection"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <Button
                onClick={() => update({ status, note: statusNote.trim() || undefined })}
                disabled={saving || (status === item.status && !statusNote)}
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

          {/* SUMMARY DETAILS CARD */}
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
                <span className="font-mono font-bold text-slate-900">{item.sellId}</span>
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
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span>Customer Expected:</span>
                <span className="font-semibold text-slate-800">
                  {item.expectedPrice != null ? formatCurrency(item.expectedPrice) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Latest Buyback Offer:</span>
                <span className="font-semibold text-emerald-700">
                  {latestOffer != null ? formatCurrency(latestOffer.amount) : "—"}
                </span>
              </div>
              {item.finalPrice && (
                <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-100 pt-2">
                  <span>Final Agreed Price:</span>
                  <span>{formatCurrency(item.finalPrice)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
