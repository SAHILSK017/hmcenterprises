import { SellForm } from "@/components/sell/sell-form";

const PERKS = [
  {
    title: "Fair market price",
    desc: "Transparent valuation based on real condition — no hidden deductions.",
  },
  {
    title: "Offer on WhatsApp",
    desc: "Receive your quote directly on WhatsApp within hours.",
  },
  {
    title: "Secure & simple",
    desc: "IMEI-checked process with clear steps from quote to payment.",
  },
];

export function SellPageContent() {
  return (
    <section className="sell-fullscreen flex min-h-[calc(100dvh-5rem)] w-full flex-1 flex-col bg-gradient-to-br from-[#F0FDF4] via-[#F7F9FC] to-[#ECFEFF]">
      <div className="container-page flex w-full flex-1 flex-col justify-center py-10 sm:py-12 lg:py-8 xl:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-14">
          <div className="min-w-0 lg:sticky lg:top-24 lg:pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
              HMC Buyback
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-[3.5rem]">
              Sell your old <span className="text-[#0D9488]">phone or Mac</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-[#64748B] sm:text-xl sm:leading-relaxed">
              Share your device details in a few steps. We evaluate smartphones and Apple MacBooks honestly and send a transparent
              offer — usually the same day.
            </p>

            <div className="mt-10 lg:mt-12">
              <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-[#0D9488]" /> Why sell with HMC?
              </h2>
              <ul className="mt-5 space-y-5">
                {PERKS.map(({ title, desc }, idx) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#CCFBF1] bg-[#F0FDFA] text-xs font-bold text-[#0D9488]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-base font-bold text-[#0F172A] sm:text-lg">{title}</p>
                      <p className="mt-1 text-base leading-relaxed text-[#64748B] sm:text-[17px]">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-[17px] font-medium">
                We buy smartphones and Apple Mac laptops in all conditions — like new, good, average, or damaged.
              </p>
            </div>
          </div>

          <div
            id="sell-form-panel"
            className="min-w-0 w-full overflow-visible lg:pr-[clamp(32px,4vw,64px)]"
          >
            <SellForm />
          </div>
        </div>
      </div>
    </section>
  );
}
