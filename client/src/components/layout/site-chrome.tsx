"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col [&:has(.home-fullscreen)]:overflow-x-hidden [&:has(.sell-fullscreen)]:min-h-[calc(100dvh-5rem)] [&:has(.sell-fullscreen)]:overflow-x-hidden [&:has(.service-fullscreen)]:min-h-[calc(100dvh-5rem)] [&:has(.service-fullscreen)]:overflow-x-hidden">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
