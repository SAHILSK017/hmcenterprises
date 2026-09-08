"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Calendar, Phone, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { PageSection } from "@/components/layout/page-section";

interface RepairRow {
  _id: string;
  repairId: string;
  brand: string;
  model: string;
  issues?: string[];
  issueDescription?: string;
  status: string;
  name: string;
  phone: string;
  quoteAmount?: number;
  diagnosis?: string;
  createdAt: string;
}

export default function AccountRepairsPage() {
  const [repairs, setRepairs] = useState<RepairRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: RepairRow[] }>("/api/repairs/mine")
      .then((data) => setRepairs(data.items || []))
      .catch(() => setRepairs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <h1 className="font-display text-2xl font-bold mb-6">My repairs</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      </PageSection>
    );
  }

  if (!repairs.length) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <h1 className="font-display text-2xl font-bold mb-6">My repairs</h1>
        <EmptyState
          icon={<Wrench className="h-10 w-10 text-teal-600" />}
          title="No repairs linked yet"
          description="Book a repair while signed in, or track any request with your Repair ID."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/mobile-repair">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">Book repair</Button>
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
          <h1 className="font-display text-2xl font-bold">My repairs</h1>
          <p className="text-sm text-foreground-muted">
            Track diagnostics, quotes, and repair progress for all your devices.
          </p>
        </div>
        <Link href="/mobile-repair">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
            <Wrench className="h-4 w-4" />
            Book New Repair
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {repairs.map((repair) => {
          const issueText =
            repair.issues?.length
              ? repair.issues.join(", ")
              : repair.issueDescription || "General inspection";

          return (
            <div
              key={repair._id || repair.repairId}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-teal-500/40 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-teal-600 dark:text-teal-400">
                      {repair.repairId}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs font-semibold">
                      {STATUS_LABELS[repair.status] ?? repair.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <h3 className="mt-1 text-lg font-bold">
                    {repair.brand} {repair.model}
                  </h3>
                  <p className="text-sm text-foreground-muted mt-0.5">
                    Issue: <span className="font-medium text-foreground">{issueText}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(repair.createdAt)}</span>
                  </div>
                  {repair.quoteAmount ? (
                    <p className="mt-1 text-base font-bold text-teal-600 dark:text-teal-400">
                      Quote: {formatCurrency(repair.quoteAmount)}
                    </p>
                  ) : null}
                </div>
              </div>

              {repair.diagnosis && (
                <div className="mt-3 rounded-xl bg-muted/60 p-3 text-xs text-foreground-muted">
                  <span className="font-semibold text-foreground">Diagnosis:</span> {repair.diagnosis}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border/50 pt-3 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Contact: {repair.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/track/${repair.repairId}`} className="gap-1.5">
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
                        `Hello HMC Mobile, I want an update on my repair request *${repair.repairId}* for ${repair.brand} ${repair.model}.`
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
