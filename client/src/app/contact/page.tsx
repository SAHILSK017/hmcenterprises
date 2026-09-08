import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";
import { RealWhatsAppIcon, WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { PageSection } from "@/components/layout/page-section";

export default function ContactPage() {
  const WHATSAPP_URL =
    "https://wa.me/918130155540?text=" +
    encodeURIComponent("Hi HMC Mobile, I want to inquire about phone repair/selling/purchase.");

  return (
    <PageSection>
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">Contact Us</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
          Get in touch with HMC Mobile
        </h1>
        <p className="mt-3 text-base text-foreground-muted">
          Visit our physical store in Hisar, connect on WhatsApp, or speak with our phone specialists.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* STORE ADDRESS CARD */}
          <div className="glass-panel rounded-3xl p-6 border border-border/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Store & Workshop Address</h3>
            <address className="not-italic mt-2 text-sm text-foreground-muted leading-relaxed">
              Shop No, ALG-II, Pushpa Complex,
              <br />
              Hisar, Haryana – 125001
            </address>
            <div className="mt-4 pt-4 border-t border-border/60">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground font-semibold bg-muted px-2.5 py-1 rounded-md">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                GSTIN: 06EFBPK5242G1ZO
              </span>
              <p className="text-[11px] text-foreground-muted mt-1">HMC ENTERPRISES · Registered in Haryana</p>
            </div>
          </div>

          {/* WHATSAPP SUPPORT CARD */}
          <div className="glass-panel rounded-3xl p-6 border border-border/80 bg-emerald-50/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#25D366] mb-4">
              <RealWhatsAppIcon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">WhatsApp Direct Support</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Fastest response for repair quotes, selling evaluations, and product questions.
            </p>
            <div className="mt-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#20BE5C] transition-all"
              >
                <WhatsAppIcon className="h-4 w-4 fill-white text-white" />
                Chat on WhatsApp (+91 81301 55540)
              </a>
            </div>
          </div>

          {/* PHONE & CALLING */}
          <div className="glass-panel rounded-3xl p-6 border border-border/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-4">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Phone Assistance</h3>
            <p className="mt-1 text-sm text-foreground-muted">Call our service desk during working hours.</p>
            <a
              href="tel:+918130155540"
              className="mt-3 inline-block font-mono text-xl font-bold text-brand hover:underline"
            >
              +91 81301 55540
            </a>
          </div>

          {/* EMAIL & STORE HOURS */}
          <div className="glass-panel rounded-3xl p-6 border border-border/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Hours & Email</h3>
            <div className="mt-2 space-y-1 text-sm text-foreground-muted">
              <div>Mon – Sat: 10:00 AM – 8:00 PM</div>
              <div>Sunday: 11:00 AM – 5:00 PM</div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/60">
              <a href="mailto:hello@hmcmobile.in" className="text-sm font-medium text-brand hover:underline">
                hello@hmcmobile.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
