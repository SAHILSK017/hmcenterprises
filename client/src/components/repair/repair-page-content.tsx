import { RepairForm } from "@/components/repair/repair-form";
import { cn } from "@/lib/utils";

const PERKS = [
  {
    title: "Expert technicians",
    desc: "Skilled repair for screens, batteries, charging, cameras, and more.",
  },
  {
    title: "Live tracking",
    desc: "Follow your repair status online from diagnosis to ready for pickup.",
  },
  {
    title: "Genuine parts",
    desc: "Quality components with clear quotes before any work begins.",
  },
];

export function RepairPageContent() {
  return (
    <section className="service-fullscreen flex min-h-[calc(100dvh-5rem)] w-full flex-1 flex-col bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#CCFBF1]">
      <div className="container-page flex w-full flex-1 flex-col justify-center py-10 sm:py-12 lg:py-8 xl:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-14">
          <div className="min-w-0 lg:sticky lg:top-24 lg:pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#99F6E4] bg-gradient-to-r from-[#F0FDFA] to-[#ECFEFF] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E] shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#06B6D4] animate-pulse" />
              HMC Care
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-[3.5rem]">
              Book a phone or <span className="bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#06B6D4] bg-clip-text text-transparent">Mac repair</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-[#64748B] sm:text-xl sm:leading-relaxed">
              Get a quick assessment and track every update online — from smartphones to MacBooks and iMacs.
            </p>

            <div className="mt-10 lg:mt-12">
              <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-[#0F766E]" /> Why repair with HMC?
              </h2>
              <ul className="mt-5 space-y-5">
                {PERKS.map(({ title, desc }, idx) => {
                  const colors = ["border-[#06B6D4] bg-[#ECFEFF] text-[#0891B2]", "border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]", "border-[#22D3EE] bg-[#ECFEFF] text-[#0D9488]"];
                  const c = colors[idx % colors.length];
                  return (
                    <li key={title} className="flex items-start gap-3">
                      <span className={cn("mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold", c)}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#0F172A] sm:text-lg">{title}</p>
                        <p className="mt-1 text-base leading-relaxed text-[#64748B] sm:text-[17px]">
                          {desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-[17px] font-medium">
                We repair all major mobile brands and Apple Mac laptops — same-day assessment available for most issues.
              </p>
            </div>
          </div>

          <div
            id="repair-form-panel"
            className="min-w-0 w-full overflow-visible lg:pr-[clamp(32px,4vw,64px)]"
          >
            <RepairForm />
          </div>
        </div>
      </div>
    </section>
  );
}
