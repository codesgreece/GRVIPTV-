"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gift, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { spinWheelPrizes } from "@/data/content";
import { contactConfig } from "@/lib/contact";

const STORAGE_KEY = "grvip-spin-wheel-complete";
const SEGMENT_COUNT = spinWheelPrizes.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

type SpinPhase = "ready" | "spinning" | "won";

function prizeRotation(index: number, extraSpins: number) {
  const centerOffset = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  return extraSpins * 360 + (360 - centerOffset);
}

function WheelSvg() {
  const size = 320;
  const radius = size / 2;
  const center = radius;

  const segments = useMemo(
    () =>
      spinWheelPrizes.map((prize, index) => {
        const startAngle = index * SEGMENT_ANGLE - 90;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
        const labelAngle = startAngle + SEGMENT_ANGLE / 2;
        const labelRad = (labelAngle * Math.PI) / 180;
        const labelRadius = radius * 0.62;
        const lx = center + labelRadius * Math.cos(labelRad);
        const ly = center + labelRadius * Math.sin(labelRad);

        return {
          prize,
          path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
          lx,
          ly,
          labelAngle: labelAngle + 90,
        };
      }),
    [center, radius],
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
    >
      <circle cx={center} cy={center} r={radius - 1} fill="#0A0A0A" />
      {segments.map(({ prize, path, lx, ly, labelAngle }) => (
        <g key={prize.id}>
          <path d={path} fill={prize.color} stroke="#0A0A0A" strokeWidth="2" />
          <text
            x={lx}
            y={ly}
            fill="#0A0A0A"
            fontSize="11"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${labelAngle}, ${lx}, ${ly})`}
            className="font-ui"
          >
            {prize.shortLabel}
          </text>
        </g>
      ))}
      <circle cx={center} cy={center} r="28" fill="#111" stroke="#D4A72C" strokeWidth="3" />
      <circle cx={center} cy={center} r="10" fill="#D4A72C" />
    </svg>
  );
}

export function SpinWheelPopup() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<SpinPhase>("ready");
  const [rotation, setRotation] = useState(0);
  const [wonIndex, setWonIndex] = useState<number | null>(null);

  useEffect(() => {
    const completed = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (completed) return;

    const timer = window.setTimeout(() => setOpen(true), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    if (phase === "won") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const spin = () => {
    if (phase !== "ready") return;

    const index = Math.floor(Math.random() * SEGMENT_COUNT);
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const target = rotation + prizeRotation(index, extraSpins);

    setWonIndex(index);
    setPhase("spinning");
    setRotation(target);

    window.setTimeout(() => {
      setPhase("won");
      window.localStorage.setItem(STORAGE_KEY, "1");
    }, reduce ? 300 : 4800);
  };

  const prize = wonIndex !== null ? spinWheelPrizes[wonIndex] : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/30 bg-[#0A0A0A] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spin-wheel-title"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.14),transparent_55%)]" />

            <button
              type="button"
              onClick={close}
              aria-label="Κλείσιμο"
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-text-dim transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 pt-8 sm:p-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Δώρο Τροχός
              </div>

              <h2 id="spin-wheel-title" className="font-display text-2xl font-black text-white sm:text-3xl">
                {phase === "won" ? "Συγχαρητήρια!" : "Γύρισε τον τροχό"}
              </h2>
              <p className="mt-2 text-sm text-text-muted sm:text-base">
                {phase === "won" && prize
                  ? prize.description
                  : "Κέρδισε έκπτωση, δωρεάν ημέρα, μήνα ή συμμετοχή σε κλήρωση 1 έτους."}
              </p>

              <div className="relative my-6">
                <div className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
                  <div className="h-0 w-0 border-x-[12px] border-t-[18px] border-x-transparent border-t-gold drop-shadow-[0_4px_8px_rgba(212,167,44,0.45)]" />
                </div>

                <motion.div
                  className="relative mx-auto aspect-square w-full max-w-[min(100%,320px)]"
                  animate={{ rotate: rotation }}
                  transition={
                    phase === "spinning"
                      ? { duration: reduce ? 0.2 : 4.6, ease: [0.12, 0.8, 0.16, 1] }
                      : { duration: 0 }
                  }
                >
                  <WheelSvg />
                </motion.div>
              </div>

              {phase === "won" && prize ? (
                <div className="mb-5 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-center">
                  <Gift className="mx-auto mb-2 h-6 w-6 text-gold" />
                  <p className="font-display text-xl font-black text-white">{prize.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{prize.description}</p>
                </div>
              ) : null}

              {phase !== "won" ? (
                <Button
                  type="button"
                  onClick={spin}
                  disabled={phase === "spinning"}
                  fullWidth
                  className="font-extrabold"
                >
                  {phase === "spinning" ? "Γυρίζει..." : "Γύρισε τον Τροχό"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button href={contactConfig.telegram} fullWidth className="font-extrabold">
                    <Send className="h-4 w-4" />
                    Διεκδίκησε στο Telegram
                  </Button>
                  <p className="text-center text-xs text-text-dim">
                    Στείλε μας: «{prize?.telegramNote}» για να ενεργοποιήσουμε το δώρο σου.
                  </p>
                </div>
              )}

              <ul className="mt-5 grid grid-cols-1 gap-1.5 text-[11px] text-text-dim sm:grid-cols-2">
                {spinWheelPrizes.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
