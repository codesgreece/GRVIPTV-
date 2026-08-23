"use client";

import {
  Headphones,
  Library,
  MonitorPlay,
  Radio,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/data/content";

const icons = {
  radio: Radio,
  library: Library,
  trophy: Trophy,
  monitor: MonitorPlay,
  zap: Zap,
  headset: Headphones,
} as const;

export function FeaturesSection() {
  return (
    <section className="section-noise relative py-16 md:py-24">
      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Γιατί να επιλέξετε GRVIP OTT;"
          title="Όλα Όσα Χρειάζεστε, Σε Ένα Μέρος"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = icons[feature.icon as keyof typeof icons];
            return (
              <Reveal key={feature.title} delay={i * 0.06}>
                <article className="group glass-card h-full rounded-2xl p-6 transition duration-300 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_16px_40px_rgba(212,167,44,0.14)]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition group-hover:bg-gold/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {feature.description}
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
