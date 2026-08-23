"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, Sparkles, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PromoCountdown } from "@/components/PromoCountdown";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pricingPlans } from "@/data/content";
import { telegramUrl } from "@/lib/contact";
import { getPlanDisplay, getPlanSavings, isPromoActive } from "@/lib/pricing-promo";
import { cn } from "@/lib/cn";

type PricingSectionProps = {
  showHeading?: boolean;
};

export function PricingSection({ showHeading = true }: PricingSectionProps) {
  const [promoActive, setPromoActive] = useState(() => isPromoActive());

  useEffect(() => {
    const syncPromo = () => setPromoActive(isPromoActive());
    syncPromo();

    const timer = window.setInterval(syncPromo, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="paketa" className="relative py-12 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,167,44,0.08),transparent_55%)]" />
      <div className="container-premium relative z-10">
        {showHeading ? (
          <SectionHeading
            eyebrow="Επιλέξτε το πακέτο σας"
            title="Τιμές για να απολαμβάνουν όλοι"
          />
        ) : null}

        <PromoCountdown />

        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan, i) => {
            const display = getPlanDisplay(plan, promoActive);
            const savings = getPlanSavings(plan, promoActive);

            return (
              <Reveal key={plan.id} delay={i * 0.08} className="h-full">
                <article
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border bg-[#0B0B0B] p-6 transition duration-300",
                    plan.popular
                      ? "border-gold/55 shadow-[0_20px_60px_rgba(212,167,44,0.18)] lg:scale-105"
                      : "border-white/10 hover:border-gold/30",
                    display.showSale ? "border-emerald-500/25" : null,
                  )}
                >
                  {plan.popular ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4A72C] to-[#F2C75C] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-black uppercase">
                      {plan.badge}
                    </span>
                  ) : display.showSale ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-black uppercase">
                      Προσφορά
                    </span>
                  ) : null}

                  <h3 className="font-display text-lg font-semibold text-white">
                    {plan.title}
                  </h3>
                  <div className="mt-4">
                    {display.originalPrice ? (
                      <p className="mb-1 text-base font-semibold text-text-dim line-through">
                        {display.originalPrice}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="flex items-end gap-1">
                        <span className="font-display text-4xl font-bold text-white sm:text-5xl">
                          {display.price}
                        </span>
                        <span className="pb-2 text-sm text-text-dim">{plan.period}</span>
                      </div>
                      {savings ? (
                        <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                          <TrendingDown className="h-3.5 w-3.5" />
                          Κερδίζεις {savings}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-text-muted"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    href={telegramUrl()}
                    variant={plan.popular ? "gold" : "outline"}
                    fullWidth
                    className="mt-8 font-extrabold"
                  >
                    {display.showSale ? "Πρόλαβε την προσφορά" : "Επιλογή Πακέτου"}
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-sm text-text-muted sm:flex-row sm:gap-8">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" /> Χωρίς κρυφές χρεώσεις
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="h-4 w-4 text-gold" /> Άμεση ενεργοποίηση
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" /> Ασφαλείς πληρωμές
          </span>
        </div>
      </div>
    </section>
  );
}
