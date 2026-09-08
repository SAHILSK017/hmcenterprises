"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { useReducedMotion, useWebGLSupport } from "@/hooks/use-motion-preference";
import { scrollToExplode } from "@/lib/phone-components";
import { DEFAULT_PHONE_GLB } from "@/lib/phone-glb";
import { useGlbAvailable } from "./phone-glb-model";
import { PhoneFallbackVisual } from "./exploded-phone";

const ExplodedPhoneCanvas = dynamic(
  () => import("./exploded-phone").then((m) => m.ExplodedPhoneCanvas),
  { ssr: false, loading: () => <PhoneFallbackVisual className="h-full w-full" variant="hero" /> }
);

const TECH_LABELS = [
  { label: "Display", top: "22%", left: "62%", showWhen: 0.35 },
  { label: "Camera", top: "12%", left: "68%", showWhen: 0.5 },
  { label: "Battery", top: "58%", left: "55%", showWhen: 0.45 },
  { label: "Motherboard", top: "38%", left: "50%", showWhen: 0.55 },
  { label: "Charging Port", top: "72%", left: "58%", showWhen: 0.6 },
] as const;

function useHeroScrollExplode(sectionRef: React.RefObject<HTMLElement | null>) {
  const [scrollExplode, setScrollExplode] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height * 0.85)));
      setScrollExplode(scrollToExplode(progress));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef]);

  return scrollExplode;
}

export interface HeroPhone3DProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function HeroPhone3D({ sectionRef, className }: HeroPhone3DProps) {
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const use3D = webgl && !reducedMotion;
  const glbAvailable = useGlbAvailable(DEFAULT_PHONE_GLB);
  const glbUrl = glbAvailable ? DEFAULT_PHONE_GLB : null;

  const scrollExplode = useHeroScrollExplode(sectionRef);
  const [autoExplode, setAutoExplode] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [userScrolling, setUserScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setUserScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setUserScrolling(false), 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const state = { value: 0 };
    tweenRef.current = gsap.timeline({ repeat: -1, paused: false })
      .to(state, {
        value: 0,
        duration: 2.2,
        ease: "none",
      })
      .to(state, {
        value: 1,
        duration: 3.2,
        ease: "power2.inOut",
        onUpdate: () => setAutoExplode(state.value),
      })
      .to({}, { duration: 1.4 })
      .to(state, {
        value: 0,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => setAutoExplode(state.value),
      })
      .to(state, {
        value: 0,
        duration: 1.8,
        ease: "none",
        onUpdate: () => setAutoExplode(state.value),
      });

    return () => {
      tweenRef.current?.kill();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!tweenRef.current) return;
    if (userScrolling || scrollExplode > 0.05) {
      tweenRef.current.pause();
    } else {
      tweenRef.current.play();
    }
  }, [userScrolling, scrollExplode]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  const onPointerLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

  const explode = reducedMotion ? 0 : (scrollExplode > 0.08 ? scrollExplode : autoExplode);

  if (!use3D) {
    return (
      <div className={className}>
        <PhoneFallbackVisual className="h-full w-full" variant="hero" />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full ${className ?? ""}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden
    >
      <ExplodedPhoneCanvas
        explode={explode}
        selectedId={null}
        onSelect={() => {}}
        autoRotate={!userScrolling && scrollExplode < 0.05}
        reducedMotion={reducedMotion}
        glbUrl={glbUrl}
        variant="hero"
        mouseOffset={mouse}
        className="absolute inset-0 h-full w-full"
      />

      {TECH_LABELS.map(({ label, top, left, showWhen }) => {
        const opacity = Math.max(0, Math.min(1, (explode - showWhen) / 0.25));
        if (opacity <= 0) return null;
        return (
          <span
            key={label}
            className="pointer-events-none absolute z-10 rounded-full border border-brand/25 bg-background/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm"
            style={{ top, left, opacity, transform: `translateY(${(1 - opacity) * 8}px)` }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
