import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { guaranteeStrip } from "@/data/content";

const badgeIcons = [ShieldCheck, Zap, Sparkles];

export function GuaranteeStrip() {
  return (
    <section aria-label="Εγγύηση ικανοποίησης" className="relative py-8 md:py-10">
      <div className="container-premium">
        <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-r from-[#0B0B0B] via-[#101010] to-[#0B0B0B] px-6 py-8 md:px-10 md:py-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(212,167,44,0.12),transparent_55%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                24h Guarantee
              </div>
              <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl">
                {guaranteeStrip.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted md:text-base">
                {guaranteeStrip.description}
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              {guaranteeStrip.badges.map((badge, i) => {
                const Icon = badgeIcons[i] ?? ShieldCheck;
                return (
                  <li
                    key={badge}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-text-muted"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold" />
                    {badge}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
