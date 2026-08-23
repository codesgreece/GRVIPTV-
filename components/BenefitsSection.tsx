"use client";

import {
  CalendarDays,
  Lock,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { benefits } from "@/data/content";

const icons = {
  shield: ShieldCheck,
  screens: MonitorSmartphone,
  calendar: CalendarDays,
  lock: Lock,
  refresh: RefreshCw,
} as const;

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-premium">
        <SectionHeading title="Γιατί Εμπιστεύονται το GRVIP OTT" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {benefits.map((benefit, i) => {
            const Icon = icons[benefit.icon as keyof typeof icons];
            return (
              <Reveal key={benefit.title} delay={i * 0.05}>
                <article className="h-full rounded-2xl border border-white/10 bg-[#0B0B0B] p-5 transition hover:border-gold/35">
                  <Icon className="mb-3 h-6 w-6 text-gold" />
                  <h3 className="font-display text-base font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {benefit.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
