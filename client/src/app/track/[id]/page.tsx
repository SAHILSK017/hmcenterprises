"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, ImageIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { api } from "@/lib/api";
import { PageSection } from "@/components/layout/page-section";

type Request = {
  repairId?: string;
  sellId?: string;
  orderId?: string;
  status: string;
  name?: string;
  brand?: string;
  model?: string;
  total?: number;
  items?: Array<{ name: string; quantity: number; price: number; image?: string }>;
  shippingAddress?: { fullName?: string; city?: string; line1?: string; state?: string; pincode?: string; whatsapp?: string };
  images?: { url: string }[];
  statusHistory?: { status: string; note?: string; changedAt: string }[];
  diagnosis?: string;
  quoteAmount?: number;
  estimatedDays?: number;
  offers?: { _id: string; amount: number; note?: string; response: string }[];
};

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Request | null>(null);
  const [error, setError] = useState("");
  const endpoint = id.toUpperCase().startsWith("SELL-")
    ? "sells"
    : id.toUpperCase().startsWith("REP-")
      ? "repairs"
      : id.toUpperCase().startsWith("ORD-")
        ? "orders"
        : "";

  useEffect(() => {
    if (!endpoint) return;
    api<Request>(`/api/${endpoint}/${id}`)
      .then(setItem)
      .catch((e) => setError(e.message || "Request not found"));
  }, [endpoint, id]);

  if (!endpoint) {
    return (
      <PageSection innerClassName="flex justify-center">
        <Card className="mx-auto w-full max-w-lg text-center">
          <CardContent className="py-12">Enter a valid Order, Repair, or Sell ID.</CardContent>
        </Card>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection innerClassName="flex justify-center">
        <Card className="mx-auto w-full max-w-lg text-center">
          <CardContent className="py-12">
            <h1 className="font-display text-xl font-bold">We couldn&apos;t find that request</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </PageSection>
    );
  }

  if (!item) {
    return (
      <PageSection innerClassName="flex justify-center">
        <div className="w-full max-w-3xl animate-pulse space-y-5">
          <div className="h-32 rounded-[var(--radius-lg)] bg-muted" />
          <div className="h-64 rounded-[var(--radius-lg)] bg-muted" />
        </div>
      </PageSection>
    );
  }

  const offer = item.offers?.at(-1);

  return (
    <PageSection centered={false} innerClassName="py-0">
      <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Tracking request</p>
                <CardTitle>{item.orderId || item.repairId || item.sellId}</CardTitle>
                <p className="mt-1">
                  {item.items?.length
                    ? item.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")
                    : item.brand && item.model
                      ? `${item.brand} ${item.model}`
                      : "Order Request"}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </CardHeader>
        </Card>

        {item.total !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-brand">{formatCurrency(item.total)}</p>
              {item.shippingAddress && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Delivery to: {item.shippingAddress.line1}, {item.shippingAddress.city} ·{" "}
                  {item.shippingAddress.fullName} ({item.shippingAddress.whatsapp})
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {(item.quoteAmount || offer) && (
          <Card>
            <CardHeader>
              <CardTitle>{item.quoteAmount ? "Repair quote" : "Our offer"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-brand">
                {formatCurrency(item.quoteAmount || offer!.amount)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.diagnosis || offer?.note}
                {item.estimatedDays ? ` · Estimated ${item.estimatedDays} days` : ""}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {item.statusHistory?.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="flex gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium">{STATUS_LABELS[entry.status] || entry.status}</p>
                    {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
                    <time className="text-xs text-muted-foreground">
                      {new Date(entry.changedAt).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {item.images?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.images.map((image, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={image.url}
                  alt={`${item.brand} ${item.model}`}
                  className="aspect-square rounded-[var(--radius)] object-cover"
                />
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" /> No photos attached
          </div>
        )}
      </div>
    </PageSection>
  );
}
