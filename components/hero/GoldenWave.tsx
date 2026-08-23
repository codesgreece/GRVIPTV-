"use client";

import { motion, useReducedMotion } from "framer-motion";

type GoldenWaveProps = {
  className?: string;
};

const CORE_PATH =
  "M-10,82 C60,38 120,112 200,66 C280,22 340,102 420,62 C490,32 550,86 610,52";

const GLOW_PATH =
  "M-10,88 C55,44 115,118 195,74 C275,30 335,108 415,68 C485,38 545,92 610,58";

const OUTER_PATH =
  "M-10,94 C58,50 118,124 198,80 C278,36 338,114 418,74 C488,44 548,96 610,66";

export function GoldenWave({ className }: GoldenWaveProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`pointer-events-none absolute inset-x-0 top-[48%] z-10 h-[38%] sm:inset-x-[-2%] ${className ?? ""}`}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, delay: 0.85 }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 600 140"
        className="h-full w-full"
        preserveAspectRatio="none"
        animate={
          reduce
            ? undefined
            : {
                x: ["-1.5%", "1.5%", "-1.5%"],
                opacity: [0.82, 1, 0.82],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <defs>
          <linearGradient id="heroWaveOuter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A72C" stopOpacity="0" />
            <stop offset="18%" stopColor="#FFD978" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#F2C75C" stopOpacity="0.55" />
            <stop offset="82%" stopColor="#FFD978" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D4A72C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroWaveCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A72C" stopOpacity="0" />
            <stop offset="22%" stopColor="#FFD978" stopOpacity="0.95" />
            <stop offset="48%" stopColor="#F2C75C" stopOpacity="1" />
            <stop offset="74%" stopColor="#FFD978" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D4A72C" stopOpacity="0" />
          </linearGradient>
          <filter id="heroWaveBlur" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="heroWaveSoft" x="-20%" y="-150%" width="140%" height="400%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Outer glow layer */}
        <path
          d={OUTER_PATH}
          fill="none"
          stroke="url(#heroWaveOuter)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#heroWaveSoft)"
        />

        {/* Mid glow ribbon */}
        <path
          d={GLOW_PATH}
          fill="none"
          stroke="url(#heroWaveCore)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
          filter="url(#heroWaveBlur)"
        />

        {/* Bright core trail */}
        <path
          d={CORE_PATH}
          fill="none"
          stroke="url(#heroWaveCore)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#heroWaveBlur)"
        />

        {/* Thin highlight line */}
        <path
          d="M0,78 C70,34 130,102 210,58 C290,18 350,96 430,54 C490,28 550,76 600,46"
          fill="none"
          stroke="#FFD978"
          strokeWidth="1"
          opacity="0.65"
        />
      </motion.svg>
    </motion.div>
  );
}
