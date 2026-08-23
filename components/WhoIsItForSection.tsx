"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Globe2, Home, Trophy } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { audiencePersonas } from "@/data/content";
import { cn } from "@/lib/cn";

const icons = {
  home: Home,
  trophy: Trophy,
  globe: Globe2,
} as const;

const accentStyles = {
  gold: {
    aura: "bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.28),transparent_62%)]",
    border: "border-gold/20 hover:border-gold/45",
    glow: "hover:shadow-[0_28px_70px_rgba(212,167,44,0.16)]",
    icon: "border-gold/30 bg-gold/12 text-gold",
    line: "from-gold/70 via-gold-bright/40 to-transparent",
  },
  blue: {
    aura: "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),transparent_62%)]",
    border: "border-blue-bright/20 hover:border-blue-bright/45",
    glow: "hover:shadow-[0_28px_70px_rgba(59,130,246,0.18)]",
    icon: "border-blue-bright/30 bg-blue-bright/10 text-blue-bright",
    line: "from-blue-bright/70 via-blue-bright/30 to-transparent",
  },
  emerald: {
    aura: "bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),transparent_62%)]",
    border: "border-emerald-400/20 hover:border-emerald-400/45",
    glow: "hover:shadow-[0_28px_70px_rgba(52,211,153,0.14)]",
    icon: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    line: "from-emerald-400/70 via-emerald-400/30 to-transparent",
  },
} as const;

type PersonaCardProps = {
  persona: (typeof audiencePersonas)[number];
  index: number;
};

function PersonaCard({ persona, index }: PersonaCardProps) {
  const reduce = useReducedMotion();
  const Icon = icons[persona.icon];
  const accent = accentStyles[persona.accent];

  return (
    <Reveal delay={index * 0.1} className="h-full">
      <motion.article
        whileHover={reduce ? undefined : { y: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-[#0A0A0A] transition duration-500",
          accent.border,
          accent.glow,
          persona.featured && "lg:-mt-3 lg:scale-[1.03]",
        )}
      >
        <div className={cn("pointer-events-none absolute inset-0 opacity-90", accent.aura)} />

        {persona.featured ? (
          <span className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-r from-[#D4A72C] to-[#F2C75C] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-black uppercase">
            Δημοφιλές
          </span>
        ) : null}

        <div className="relative px-6 pt-8 pb-5 sm:px-7">
          <div
            className={cn(
              "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-105",
              accent.icon,
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </div>

          <p className="text-[11px] font-bold tracking-[0.2em] text-text-dim uppercase">
            {persona.label}
          </p>
          <h3 className="mt-2 font-display text-2xl leading-tight font-black text-white sm:text-[1.65rem]">
            {persona.title}
          </h3>
          <div className={cn("mt-4 h-px w-16 bg-gradient-to-r", accent.line)} />
        </div>

        <div className="relative flex flex-1 flex-col px-6 pb-7 sm:px-7">
          <p className="text-sm leading-relaxed text-text-muted md:text-[15px]">
            {persona.description}
          </p>

          <ul className="mt-6 space-y-3">
            {persona.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-text-muted">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    accent.icon,
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function WhoIsItForSection() {
  return (
    <section id="gia-poion-einai" className="section-noise relative overflow-hidden py-14 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[8%] left-[-8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(212,167,44,0.08),transparent_68%)]" />
        <div className="absolute right-[-6%] bottom-[6%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(30,95,168,0.12),transparent_70%)]" />
      </div>

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Για ποιον είναι"
          title="Βρες το Δικό σου Streaming"
          description="Είτε είσαι οικογένεια, λάτρης του αθλητισμού ή ξενιτεμένος — το GRVIP OTT προσαρμόζεται στις ανάγκες σου."
        />

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {audiencePersonas.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
