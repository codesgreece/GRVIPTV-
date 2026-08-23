"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type CinematicTVProps = {
  className?: string;
};

export function CinematicTV({ className }: CinematicTVProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`absolute left-1/2 top-[46%] z-[5] w-[88%] max-w-[700px] -translate-x-[46%] -translate-y-1/2 sm:w-[min(700px,65%)] ${className ?? ""}`}
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={
          reduce
            ? undefined
            : { y: [0, -4, 0] }
        }
        transition={
          reduce
            ? undefined
            : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative"
      >
        {/* TV frame — widescreen 16:9 */}
        <div
          className="relative w-full rounded-xl p-[7px] shadow-[0_28px_70px_rgba(0,0,0,0.72),0_0_50px_rgba(212,167,44,0.1)] sm:rounded-2xl sm:p-2"
          style={{
            background:
              "linear-gradient(160deg, #3a3a3a 0%, #1a1a1a 35%, #080808 70%, #030303 100%)",
          }}
        >
          {/* Gold rim highlights */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/[0.08] sm:rounded-2xl" />
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="pointer-events-none absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

          {/* Screen */}
          <div className="relative aspect-video overflow-hidden rounded-[8px] border border-black/80 bg-black shadow-[inset_0_0_40px_rgba(0,0,0,0.85)] sm:rounded-[10px]">
            <Image
              src="/images/hero/lion-cinematic.png"
              alt="Cinematic lion artwork"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 700px"
              className="object-cover object-[center_20%]"
            />

            {/* Cinematic lighting overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_38%,rgba(242,199,92,0.22),transparent_52%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_55%,rgba(30,95,168,0.18),transparent_48%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,167,44,0.08)_0%,transparent_40%,rgba(30,95,168,0.06)_100%)]" />

            {/* Branding inside screen */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-10 sm:gap-2 sm:pb-5 sm:pt-12">
              <Image
                src="/images/logo.png"
                alt="GRVIP OTT"
                width={220}
                height={70}
                className="h-8 w-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:h-10 md:h-11"
              />
              <span className="text-[9px] tracking-[0.32em] text-white/65 uppercase sm:text-[10px]">
                Τώρα σε Streaming
              </span>
            </div>
          </div>
        </div>

        {/* Premium stand */}
        <div className="relative mx-auto mt-1 w-[38%] sm:mt-1.5">
          <div
            className="mx-auto h-3 w-[32%] rounded-b-sm sm:h-3.5"
            style={{
              background: "linear-gradient(180deg, #3d3d3d 0%, #151515 100%)",
            }}
          />
          <div className="mx-auto mt-0.5 h-1.5 w-full rounded-full bg-gradient-to-r from-transparent via-[#222] to-transparent" />
          <div className="mx-auto mt-1 h-2 w-[72%] rounded-full bg-black/70 blur-[2px]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
