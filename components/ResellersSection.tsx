"use client";

import { Crown, Users } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { resellersAdmin, resellersPartners } from "@/data/content";
import { cn } from "@/lib/cn";

export function ResellersSection() {
  return (
    <section id="resellers" className="relative py-12 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,95,168,0.08),transparent_55%)]" />
      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Resellers"
          title="Οι Συνεργάτες Μας"
          description="Επίσημο δίκτυο resellers με σταθερή απόδοση και υποστήριξη πελατών."
        />

        <Reveal className="mx-auto mb-8 max-w-xl md:mb-10">
          <article className="relative overflow-hidden rounded-2xl border border-gold/45 bg-[#0B0B0B] p-6 text-center shadow-[0_20px_60px_rgba(212,167,44,0.14)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.12),transparent_60%)]" />
            <div className="relative">
              <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                <Crown className="h-5 w-5 text-gold" />
              </span>
              <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">
                {resellersAdmin.badge}
              </p>
              <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                {resellersAdmin.name}
              </h3>
              <p className="mt-2 text-sm font-semibold tracking-[0.08em] text-text-muted uppercase">
                {resellersAdmin.role}
              </p>
            </div>
          </article>
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {resellersPartners.map((partner, i) => (
            <Reveal key={partner.id} delay={0.08 + i * 0.08} className="h-full">
              <article
                className={cn(
                  "glass-card gold-glow relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1",
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,167,44,0.1),transparent_55%)] opacity-70" />
                <div className="relative flex h-full flex-col">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Users className="h-4 w-4 text-gold" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {partner.name}
                  </h3>
                  <div className="mt-5 flex-1">
                    <p className="font-display text-4xl font-black text-white">
                      {partner.avgMonthlyClients.toLocaleString("el-GR")}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      Μέσος όρος μηνιαίων πελατών
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
