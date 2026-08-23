"use client";

import { Handshake, TrendingUp, Headphones, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { becomeResellerContent } from "@/data/content";
import { telegramUrl } from "@/lib/contact";

const icons = [TrendingUp, Package, Handshake, Headphones];

export function BecomeResellerSection() {
  return (
    <section id="synergasia" className="relative py-12 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,167,44,0.06),transparent_55%)]" />
      <div className="container-premium relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <SectionHeading
              eyebrow={becomeResellerContent.eyebrow}
              title={becomeResellerContent.title}
              description={becomeResellerContent.description}
              align="left"
              className="mb-0 md:mb-0"
            />
            <Button href={telegramUrl()} className="mt-8 font-extrabold">
              {becomeResellerContent.ctaLabel}
            </Button>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {becomeResellerContent.benefits.map((benefit, i) => {
              const Icon = icons[i] ?? TrendingUp;
              return (
                <Reveal key={benefit} delay={0.06 + i * 0.06}>
                  <article className="h-full rounded-2xl border border-white/10 bg-[#0B0B0B] p-5 transition hover:border-gold/35">
                    <Icon className="mb-3 h-5 w-5 text-gold" />
                    <p className="text-sm leading-relaxed text-text-muted">{benefit}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
