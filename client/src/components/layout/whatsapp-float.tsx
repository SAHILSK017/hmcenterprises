"use client";

import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const WHATSAPP_NUMBER = "918130155540";
const MESSAGE = encodeURIComponent("Hi HMC Mobile, I need help with my phone.");

export function WhatsAppFloat() {
  return (
    <Link
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevation-lg transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-[#25D366]/30"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-8 w-8 fill-white text-white" />
    </Link>
  );
}
