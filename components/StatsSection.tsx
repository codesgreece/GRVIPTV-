"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Clapperboard, Film, Tv } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { stats } from "@/data/content";

const icons = {
  tv: Tv,
  film: Film,
  clapperboard: Clapperboard,
} as const;

export function StatsSection() {
  const greekStats = stats.filter((s) => s.group === "greek");

  return (
    <section className="relative pb-8 md:pb-12">
      <div className="container-premium">
        <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
          Ελληνικό Περιεχόμενο
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {greekStats.map((stat, i) => {
            const Icon = icons[stat.icon as keyof typeof icons];
            return (
              <Reveal key={stat.id} delay={i * 0.08}>
                <div className="glass-card gold-glow group relative overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,167,44,0.12),transparent_55%)] opacity-70" />
                  <div className="relative">
                    <Icon className="mb-4 h-6 w-6 text-gold" />
                    <StatValue value={stat.value} suffix={stat.suffix} />
                    <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-text-dim uppercase">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-5 text-center text-sm text-text-dim md:text-[15px]">
            Επιπλέον πρόσβαση σε{" "}
            <span className="text-text-muted">24.000+ κανάλια</span> και{" "}
            <span className="text-text-muted">120.000+ ταινίες & σειρές</span>{" "}
            από όλο τον κόσμο · Full HD / 4K
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      const id = requestAnimationFrame(() => setCurrent(value));
      return () => cancelAnimationFrame(id);
    }

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduce]);

  return (
    <span
      ref={ref}
      className="font-display text-3xl font-bold text-white md:text-4xl"
    >
      {(reduce && inView ? value : current).toLocaleString("el-GR")}
      {suffix}
    </span>
  );
}
