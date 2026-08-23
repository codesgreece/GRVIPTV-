"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/data/content";
import { SupportSection } from "@/components/SupportSection";
import { cn } from "@/lib/cn";

type FAQSectionProps = {
  showHeading?: boolean;
};

export function FAQSection({ showHeading = true }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="py-12 md:py-24">
      <div className="container-premium">
        {showHeading ? <SectionHeading title="Συχνές Ερωτήσεις" /> : null}
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div
                    key={item.question}
                    className={cn(
                      "overflow-hidden rounded-xl border transition",
                      open
                        ? "border-gold/40 bg-gold/[0.04]"
                        : "border-white/10 bg-[#0B0B0B]",
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      onClick={() =>
                        setOpenIndex(open ? null : index)
                      }
                      aria-expanded={open}
                    >
                      <span
                        className={cn(
                          "font-medium",
                          open ? "text-gold" : "text-white",
                        )}
                      >
                        {item.question}
                      </span>
                      {open ? (
                        <Minus className="h-4 w-4 shrink-0 text-gold" />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0 text-text-dim" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">
                            {item.answer}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <SupportSection />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
