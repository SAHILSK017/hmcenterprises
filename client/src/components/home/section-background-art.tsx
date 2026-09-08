"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionArtVariant =
  | "intro"
  | "repair"
  | "buy"
  | "sell"
  | "trust"
  | "services";

function IntroArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <rect x="148" y="80" width="104" height="200" rx="18" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <rect x="158" y="95" width="84" height="160" rx="8" fill="currentColor" opacity="0.06" />
      <rect x="120" y="120" width="72" height="148" rx="14" stroke="currentColor" strokeWidth="1.5" opacity="0.2" transform="rotate(-12 156 194)" />
      <rect x="208" y="110" width="72" height="148" rx="14" stroke="currentColor" strokeWidth="1.5" opacity="0.2" transform="rotate(12 244 184)" />
      <path d="M80 280 Q200 220 320 280" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

function RepairArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <rect x="130" y="70" width="140" height="260" rx="22" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <rect x="145" y="90" width="110" height="200" rx="10" fill="currentColor" opacity="0.05" />
      <path d="M175 130 L225 180 M225 130 L175 180" stroke="currentColor" strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />
      <path
        d="M280 120 L320 80 L340 100 L300 140 Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
        strokeLinejoin="round"
      />
      <circle cx="310" cy="95" r="28" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M70 240 L110 200 L130 220 L90 260 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <rect x="85" y="255" width="50" height="8" rx="4" fill="currentColor" opacity="0.15" transform="rotate(-45 110 259)" />
      <circle cx="155" cy="310" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="175" cy="310" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="195" cy="310" r="6" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function BuyArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <path d="M60 140 L340 140 L320 320 L80 320 Z" stroke="currentColor" strokeWidth="2" opacity="0.25" strokeLinejoin="round" />
      <path d="M100 140 L120 80 L280 80 L300 140" stroke="currentColor" strokeWidth="2" opacity="0.25" strokeLinejoin="round" />
      <rect x="130" y="170" width="55" height="100" rx="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="200" y="170" width="55" height="100" rx="10" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="270" y="170" width="55" height="100" rx="10" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <circle cx="157" cy="200" r="8" fill="currentColor" opacity="0.15" />
      <circle cx="227" cy="200" r="8" fill="currentColor" opacity="0.12" />
      <path d="M180 300 L220 300" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
      <rect x="170" y="250" width="60" height="8" rx="4" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

function SellArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <rect x="90" y="100" width="110" height="200" rx="18" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <rect x="105" y="120" width="80" height="150" rx="8" fill="currentColor" opacity="0.05" />
      <path d="M210 200 H290" stroke="currentColor" strokeWidth="2.5" opacity="0.25" strokeLinecap="round" markerEnd="url(#arrow)" />
      <circle cx="310" cy="200" r="55" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <text x="310" y="212" textAnchor="middle" fill="currentColor" fontSize="36" fontWeight="600" opacity="0.3">
        ₹
      </text>
      <rect x="250" y="280" width="120" height="50" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M270 305 H350 M270 315 H330" stroke="currentColor" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.3" />
        </marker>
      </defs>
    </svg>
  );
}

function TrustArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M200 60 L320 110 V210 C320 280 200 340 200 340 C200 340 80 280 80 210 V110 Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
        strokeLinejoin="round"
      />
      <path d="M160 210 L185 235 L245 175" stroke="currentColor" strokeWidth="3" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeDasharray="8 8" />
      <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" opacity="0.06" />
    </svg>
  );
}

function ServicesArt() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" aria-hidden>
      <rect x="60" y="80" width="100" height="120" rx="16" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <rect x="150" y="120" width="100" height="120" rx="16" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="240" y="80" width="100" height="120" rx="16" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <circle cx="110" cy="130" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <path d="M95 160 L125 160 M110 145 V175" stroke="currentColor" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
      <rect x="175" y="155" width="50" height="70" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="265" y="130" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M80 260 Q200 220 320 260" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <rect x="120" y="280" width="160" height="60" rx="12" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
    </svg>
  );
}

const ART: Record<SectionArtVariant, () => React.JSX.Element> = {
  intro: IntroArt,
  repair: RepairArt,
  buy: BuyArt,
  sell: SellArt,
  trust: TrustArt,
  services: ServicesArt,
};

interface SectionBackgroundProps {
  variant: SectionArtVariant;
  position?: "left" | "right" | "center";
  className?: string;
  opacity?: number;
}

export function SectionBackground({
  variant,
  position = "right",
  className,
  opacity = 1,
}: SectionBackgroundProps) {
  const Art = ART[variant];
  const positionClass =
    position === "left"
      ? "left-0 -translate-x-[15%]"
      : position === "center"
        ? "left-1/2 -translate-x-1/2"
        : "right-0 translate-x-[10%]";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 z-0 w-[min(55vw,520px)] text-brand select-none",
        positionClass,
        className
      )}
      style={{ opacity }}
      aria-hidden
    >
      <div className="flex h-full items-center justify-center p-8">
        <Art />
      </div>
    </div>
  );
}

interface SectionShellProps {
  variant: SectionArtVariant;
  artPosition?: "left" | "right" | "center";
  artOpacity?: number;
  className?: string;
  children: ReactNode;
}

export function SectionShell({
  variant,
  artPosition,
  className,
  artOpacity = 0.12,
  children,
}: SectionShellProps) {
  const defaultPosition =
    variant === "buy" ? "left" : variant === "sell" || variant === "trust" ? "right" : "right";

  return (
    <section className={cn("section-block relative overflow-hidden border-t border-border", className)}>
      <SectionBackground variant={variant} position={artPosition ?? defaultPosition} opacity={artOpacity} />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(0,113,227,0.04),transparent)]"
        aria-hidden
      />
      <div className="container-page relative z-10 w-full">{children}</div>
    </section>
  );
}
