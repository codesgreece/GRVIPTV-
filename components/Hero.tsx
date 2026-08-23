"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { HeroVisual } from "@/components/HeroVisual";
import { LiveViewersBadge } from "@/components/LiveViewersBadge";
import { Button } from "@/components/ui/Button";

const trustItems = [
  "Άμεση πρόσβαση",
  "99.9% Εγγυημένη λειτουργία",
  "Υποστήριξη 24/7",
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="section-noise relative overflow-hidden pt-[4.75rem] pb-8 sm:pt-28 sm:pb-16 md:pt-32 md:pb-24 lg:min-h-[92vh] lg:pt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,167,44,0.14),transparent_68%)]" />
        <div className="absolute right-[-5%] bottom-[10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(30,95,168,0.16),transparent_70%)]" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,199,92,0.06),transparent_65%)]" />
      </div>

      <div className="container-premium relative z-10 grid items-center gap-6 sm:gap-12 lg:grid-cols-[9fr_11fr] lg:gap-8 xl:gap-12">
        <div className="max-w-xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-gold uppercase sm:mb-4 sm:text-xs sm:tracking-[0.28em]"
          >
            GRVIP OTT · Premium Streaming
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-[1.65rem] leading-[1.12] font-black tracking-tight text-white uppercase min-[380px]:text-[1.9rem] min-[420px]:text-[2.1rem] sm:text-6xl sm:leading-[0.95] md:text-7xl"
          >
            <span className="block">Premium</span>
            <span className="text-gold-gradient block">Entertainment</span>
            <span className="block">Without Limits</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-4 max-w-lg text-base leading-[1.65] text-text-muted sm:mt-6 md:text-lg"
          >
            Απολαύστε 226 ελληνικά κανάλια, 4.492 ταινίες και 226 σειρές σε Full
            HD, 4K και παραπάνω — με επιπλέον διεθνές περιεχόμενο από όλο τον
            κόσμο.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-4 sm:mt-5"
          >
            <LiveViewersBadge />
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-4 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-stretch sm:mt-6 sm:gap-3"
          >
            <Button href="/paketa" className="w-full min-[420px]:flex-1">
              Ξεκινήστε Τώρα
            </Button>
            <Button href="/paketa" variant="outline" className="w-full min-[420px]:flex-1">
              Δείτε τα Πακέτα
            </Button>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-7 sm:gap-x-5"
          >
            {trustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[13px] leading-snug text-text-muted sm:gap-2 sm:text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold sm:h-4 sm:w-4" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-4 w-full max-w-[min(100%,300px)] sm:mt-0 sm:max-w-[min(100%,420px)] lg:max-w-none lg:mx-0"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
