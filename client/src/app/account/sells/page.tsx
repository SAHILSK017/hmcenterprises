"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, Calendar, Phone, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { PageSection } from "@/components/layout/page-section";

interface SellRow {
  _id: string;
  sellId: string;
  brand: string;
  model: string;
  overallCondition: string;
  expectedPrice?: number;
  status: string;
  name: string;
  phone: string;
  offers?: Array<{ amount: number; note?: string }>;
  createdAt: string;
}

export default function AccountSellsPage() {
  const [sells, setSells] = useState<SellRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: SellRow[] }>("/api/sells/mine")
      .then((data) => setSells(data.items || []))
      .catch(() => setSells([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <h1 className="font-display text-2xl font-bold mb-6">My sell requests</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      </PageSection>
    );
  }

  if (!sells.length) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <h1 className="font-display text-2xl font-bold mb-6">My sell requests</h1>
        <EmptyState
          icon={<Smartphone className="h-10 w-10 text-teal-600" />}
          title="No sell requests yet"
          description="Submit your device for a buyback offer, then track it with your Sell ID."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sell-your-phone">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Sell phone</Button>
              </Link>
              <Link href="/track">
                <Button variant="outline">Track ID</Button>
              </Link>
            </div>
          }
        />
      </PageSection>
    );
  }

  return (
    <PageSection centered={false} innerClassName="py-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My sell requests</h1>
          <p className="text-sm text-foreground-muted">
            Track evaluation, pricing offers, and buyback requests for your old devices.
          </p>
        </div>
        <Link href="/sell-your-phone">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
            <Smartphone className="h-4 w-4" />
            Sell Another Device
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {sells.map((sell) => {
          const latestOffer = sell.offers?.at(-1);

          return (
            <div
              key={sell._id || sell.sellId}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-teal-500/40 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-teal-600 dark:text-teal-400">
                      {sell.sellId}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs font-semibold">
                      {STATUS_LABELS[sell.status] ?? sell.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <h3 className="mt-1 text-lg font-bold">
                    {sell.brand} {sell.model}
                  </h3>
                  <p className="text-sm text-foreground-muted mt-0.5">
                    Condition: <span className="font-medium capitalize text-foreground">{sell.overallCondition}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(sell.createdAt)}</span>
                  </div>
                  {latestOffer ? (
                    <p className="mt-1 text-base font-bold text-emerald-600">
                      Offer: {formatCurrency(latestOffer.amount)}
                    </p>
                  ) : sell.expectedPrice ? (
                    <p className="mt-1 text-sm font-semibold text-foreground-muted">
                      Expected: {formatCurrency(sell.expectedPrice)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border/50 pt-3 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Contact: {sell.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/track/${sell.sellId}`} className="gap-1.5">
                      Track Live Status
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                    asChild
                  >
                    <a
                      href={`https://wa.me/918130155540?text=${encodeURIComponent(
                        `Hello HMC Mobile, I want an update on my sell request *${sell.sellId}* for ${sell.brand} ${sell.model}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp Support
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}
