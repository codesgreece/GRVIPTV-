"use client";

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

const stepIcons = [Package, CreditCard, Send, Clock3] as const;

function getCardLink(amount: number) {
  return paysafeCardLinks.find((link) => link.amount === amount)?.href;
}

export function OrderLineSection() {
  return (
    <section id="paraggelia" className="relative py-12 md:py-24">
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
              Στείλε τον κωδικό στο Telegram
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-sky-500/20 bg-[#0A0A0A] p-5 sm:p-6">
              <p className="text-xs font-bold tracking-[0.16em] text-sky-300 uppercase">
                Πακέτο → Κάρτα
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-white">
                Διάλεξε πακέτο, πάρε την κάρτα
              </h3>

              <div className="mt-5 space-y-4">
                {orderLineContent.packageCardMap.map((item) => {
                  const href = getCardLink(item.cardAmount);

                  return (
                    <div
                      key={item.planTitle}
                      className="grid grid-cols-[1fr_auto_92px] items-center gap-3 rounded-xl border border-white/8 bg-black/30 p-3 sm:grid-cols-[1fr_auto_108px] sm:p-4"
                    >
                      <div>
                        <p className="font-display text-base font-bold text-white">
                          {item.planTitle}
                        </p>
                        {"note" in item && item.note ? (
                          <p className="mt-0.5 text-[11px] text-text-dim">{item.note}</p>
                        ) : null}
                      </div>

                      <ArrowRight className="hidden h-4 w-4 text-gold sm:block" />

                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block transition hover:scale-[1.03]"
                        aria-label={`Αγορά PaysafeCard ${item.cardAmount} EUR`}
                      >
                        <PaysafeCardVisual amount={item.cardAmount} />
                      </a>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="mb-3 text-xs font-bold tracking-[0.14em] text-text-dim uppercase">
                  Όλες οι διαθέσιμες κάρτες
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {paysafeCardLinks.map((link) => (
                    <a
                      key={link.amount}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:scale-[1.04]"
                      aria-label={`Αγορά PaysafeCard ${link.amount} EUR`}
                    >
                      <PaysafeCardVisual amount={link.amount} className="max-w-[88px] mx-auto" />
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
