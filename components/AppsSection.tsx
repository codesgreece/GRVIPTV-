"use client";

import { AppWindow } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { apps } from "@/data/content";

export function AppsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-premium">
        <SectionHeading title="Δημοφιλείς Εφαρμογές" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, i) => (
            <Reveal key={app.id} delay={i * 0.05}>
              <article className="glass-card flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-1 hover:border-gold/40">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gold">
                  <AppWindow className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  {app.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-text-muted">
                  {app.description}
                </p>
                <Button
                  href="/odigos-egkatastasis"
                  variant="outline"
                  className="mt-5 tracking-[0.1em] uppercase"
                >
                  Δείτε Οδηγό
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
