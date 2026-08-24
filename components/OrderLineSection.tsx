"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  CreditCard,
  Package,
  Send,
} from "lucide-react";
import { PaysafeCardVisual } from "@/components/PaysafeCardVisual";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderLineContent, paysafeCardLinks } from "@/data/content";
import { telegramUrl } from "@/lib/contact";
import { defaultPublicPricing, formatEuroPrefix, type PublicPackagePrice } from "@/lib/customers/pricing";
import { splitIntoPaysafeCards } from "@/lib/paysafe";

const stepIcons = [Package, CreditCard, Send, Clock3] as const;

function getCardLink(amount: number) {
  return paysafeCardLinks.find((link) => link.amount === amount)?.href;
}

export function OrderLineSection({ initialPrices }: { initialPrices?: PublicPackagePrice[] }) {
  const [catalog, setCatalog] = useState<PublicPackagePrice[]>(
    () => initialPrices ?? defaultPublicPricing(),
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/pricing", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { pricing?: PublicPackagePrice[] };
        if (!cancelled && payload.pricing?.length) setCatalog(payload.pricing);
      } catch {
        // Keep the central default catalog if the public API is temporarily unavailable.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(
    () => new Map(catalog.map((item) => [item.packageId, item])),
    [catalog],
  );

  return (
    <section id="paraggelia" className="relative overflow-x-hidden py-12 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,153,232,0.08),transparent_58%)]" />
      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow={orderLineContent.eyebrow}
          title={orderLineContent.title}
          description={orderLineContent.description}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <Reveal>
            <ol className="space-y-4">
              {orderLineContent.steps.map((step, index) => {
                const Icon = stepIcons[index];

                return (
                  <li
                    key={step.title}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] p-5 transition hover:border-gold/25"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 font-display text-sm font-black text-gold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gold" />
                          <h3 className="font-display text-lg font-bold text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-text-muted">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-sm leading-relaxed text-amber-100/90">
                  {orderLineContent.disclaimer}
                </p>
              </div>
            </div>

            <Button href={telegramUrl()} className="mt-6 font-extrabold" fullWidth>
              <Send className="h-4 w-4" />
              Στείλε τους κωδικούς στο Telegram
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-[#0A0A0A] p-4 sm:p-6">
              <p className="text-[10px] font-bold tracking-[0.14em] text-sky-300 uppercase sm:text-xs">
                Πακέτο → Κάρτα
              </p>
              <h3 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                Διάλεξε πακέτο, πάρε τις κάρτες
              </h3>

              <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                {orderLineContent.packageCardMap.map((item) => {
                  const live = byId.get(item.planId);
                  const amount = live?.activePrice ?? 0;
                  const cards = splitIntoPaysafeCards(amount);

                  return (
                    <div
                      key={item.planTitle}
                      className="rounded-xl border border-white/8 bg-black/30 p-2.5 sm:p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                        <div>
                          <p className="font-display text-sm font-bold text-white sm:text-base">
                            {item.planTitle}
                          </p>
                          <p className="text-[11px] text-text-dim">{formatEuroPrefix(amount)}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gold sm:h-4 sm:w-4" />
                      </div>

                      <div className="flex items-center justify-center gap-1 sm:justify-end sm:gap-2">
                        {cards.map((cardAmount, cardIndex) => (
                          <div
                            key={`${item.planTitle}-${cardAmount}-${cardIndex}`}
                            className="flex shrink-0 items-center gap-1 sm:gap-2"
                          >
                            {cardIndex > 0 ? (
                              <span className="text-xs font-black leading-none text-gold sm:text-base">
                                +
                              </span>
                            ) : null}
                            <a
                              href={getCardLink(cardAmount)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-[58px] shrink-0 sm:w-[84px] md:w-[100px]"
                              aria-label={`Αγορά PaysafeCard ${cardAmount} EUR`}
                            >
                              <PaysafeCardVisual amount={cardAmount} compact />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-white/8 pt-4 sm:mt-6 sm:pt-5">
                <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-text-dim uppercase sm:mb-3 sm:text-xs">
                  Όλες οι διαθέσιμες κάρτες
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                  {paysafeCardLinks.map((link) => (
                    <a
                      key={link.amount}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-auto block w-full max-w-[72px] sm:max-w-[96px]"
                      aria-label={`Αγορά PaysafeCard ${link.amount} EUR`}
                    >
                      <PaysafeCardVisual amount={link.amount} compact />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
