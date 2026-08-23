"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gift, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { spinWheelPrizes } from "@/data/content";
import { contactConfig } from "@/lib/contact";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "grvip-spin-wheel-complete";
const SEGMENT_COUNT = spinWheelPrizes.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

type SpinPhase = "idle" | "spinning" | "won";

function prizeRotation(index: number, extraSpins: number) {
  const centerOffset = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  return extraSpins * 360 + (360 - centerOffset);
}

function pickWeightedPrizeIndex() {
  const totalWeight = spinWheelPrizes.reduce((sum, prize) => sum + prize.weight, 0);
  let roll = Math.random() * totalWeight;

  for (let index = 0; index < spinWheelPrizes.length; index += 1) {
    roll -= spinWheelPrizes[index].weight;
    if (roll <= 0) return index;
  }

  return 0;
}

function WheelSvg({ spinning }: { spinning: boolean }) {
  const size = 340;
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
        const labelRadius = radius * 0.64;
        const lx = center + labelRadius * Math.cos(labelRad);
        const ly = center + labelRadius * Math.sin(labelRad);
        const pegAngle = endAngle;
        const pegRad = (pegAngle * Math.PI) / 180;
        const px = center + (radius - 8) * Math.cos(pegRad);
        const py = center + (radius - 8) * Math.sin(pegRad);

        return {
          prize,
          path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
          lx,
          ly,
          labelAngle: labelAngle + 90,
          px,
          py,
        };
      }),
    [center, radius],
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn(
        "h-full w-full",
        spinning ? "spin-wheel-blur-active" : "spin-wheel-blur-idle",
      )}
    >
      <defs>
        <filter id="wheel-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#D4A72C" floodOpacity="0.25" />
        </filter>
        {spinWheelPrizes.map((prize) => (
          <linearGradient
            key={`grad-${prize.id}`}
            id={`grad-${prize.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={prize.colorLight} />
            <stop offset="42%" stopColor={prize.color} />
            <stop offset="100%" stopColor={prize.colorDark} />
          </linearGradient>
        ))}
        <radialGradient id="wheel-gloss" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={radius - 2}
        fill="#050505"
        filter="url(#wheel-shadow)"
      />

      {segments.map(({ prize, path, lx, ly, labelAngle, px, py }) => (
        <g key={prize.id}>
          <path d={path} fill={`url(#grad-${prize.id})`} stroke="#120B00" strokeWidth="2.5" />
          <path
            d={path}
            fill="url(#wheel-gloss)"
            opacity="0.55"
            style={{ mixBlendMode: "screen" }}
          />
          <circle cx={px} cy={py} r="3.2" fill="#F8FAFC" stroke="#111827" strokeWidth="1" />
          <text
            x={lx}
            y={ly}
            fill="#111827"
            fontSize="12"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${labelAngle}, ${lx}, ${ly})`}
            className="font-ui"
            style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
          >
            {prize.shortLabel}
          </text>
        </g>
      ))}

      <circle cx={center} cy={center} r={radius - 3} fill="none" stroke="#F2C75C" strokeWidth="5" opacity="0.85" />
      <circle cx={center} cy={center} r={radius - 8} fill="none" stroke="#000000" strokeWidth="2" opacity="0.45" />

      <circle cx={center} cy={center} r="34" fill="#141414" stroke="#D4A72C" strokeWidth="4" />
      <circle cx={center} cy={center} r="26" fill="url(#wheel-gloss)" opacity="0.35" />
      <circle cx={center} cy={center} r="12" fill="#D4A72C" stroke="#F2C75C" strokeWidth="2" />
    </svg>
  );
}

export function SpinWheelPopup() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<SpinPhase>("idle");
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
    if (phase !== "idle") return;

    const index = pickWeightedPrizeIndex();
    const extraSpins = 7 + Math.floor(Math.random() * 4);
    const target = rotation + prizeRotation(index, extraSpins);

    setWonIndex(index);
    setPhase("spinning");
    setRotation(target);

    window.setTimeout(() => {
      setPhase("won");
      window.localStorage.setItem(STORAGE_KEY, "1");
    }, reduce ? 300 : 5400);
  };

  const prize = wonIndex !== null ? spinWheelPrizes[wonIndex] : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold/35 bg-[#080808] shadow-[0_40px_100px_rgba(0,0,0,0.75)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spin-wheel-title"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.16),transparent_58%)]" />
            {phase === "won" ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-gold"
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: Math.cos((i / 18) * Math.PI * 2) * (80 + (i % 3) * 30),
                      y: Math.sin((i / 18) * Math.PI * 2) * (80 + (i % 3) * 30),
                      scale: 0,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                ))}
              </div>
            ) : null}

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
                Premium Lucky Wheel
              </div>

              <h2 id="spin-wheel-title" className="font-display text-2xl font-black text-white sm:text-3xl">
                {phase === "won" ? "Συγχαρητήρια!" : "Γύρισε τον τροχό"}
              </h2>
              <p className="mt-2 text-sm text-text-muted sm:text-base">
                {phase === "won" && prize
                  ? prize.description
                  : "Δοκίμασε την τύχη σου — premium δώρα & εκπτώσεις."}
              </p>

              <div className="spin-wheel-stage relative my-7">
                <div className="spin-wheel-stage-glow" aria-hidden />
                <div className="spin-wheel-floor" aria-hidden />

                <div className="pointer-events-none absolute top-0 left-1/2 z-30 -translate-x-1/2">
                  <div
                    className={cn(
                      "spin-wheel-pointer",
                      phase === "won" && "spin-wheel-pointer--landed",
                    )}
                  />
                </div>

                <motion.div
                  className="spin-wheel-tilt mx-auto w-full max-w-[min(100%,340px)]"
                  animate={
                    reduce
                      ? {}
                      : {
                          y: phase === "spinning" ? [0, -3, 0] : [0, -5, 0],
                          rotateX: phase === "spinning" ? 11 : 14,
                        }
                  }
                  transition={
                    phase === "spinning"
                      ? { y: { duration: 0.18, repeat: Infinity, ease: "easeInOut" } }
                      : { y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }, rotateX: { duration: 0.4 } }
                  }
                >
                  <motion.div
                    className="spin-wheel-disc relative aspect-square w-full"
                    animate={{
                      rotateZ: rotation,
                      rotateY: phase === "spinning" ? [0, 2, -2, 1, 0] : 0,
                      scale: phase === "spinning" ? 1.025 : phase === "won" ? 1.03 : 1,
                    }}
                    transition={
                      phase === "spinning"
                        ? {
                            rotateZ: {
                              duration: reduce ? 0.25 : 5.4,
                              ease: [0.08, 0.92, 0.12, 1],
                            },
                            rotateY: { duration: 0.22, repeat: Infinity, ease: "easeInOut" },
                            scale: { duration: 0.35 },
                          }
                        : { duration: 0.5, type: "spring", stiffness: 110, damping: 13 }
                    }
                  >
                    <div className="spin-wheel-rim" aria-hidden />
                    <WheelSvg spinning={phase === "spinning"} />
                  </motion.div>
                </motion.div>
              </div>

              {phase === "won" && prize ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-center"
                >
                  <Gift className="mx-auto mb-2 h-6 w-6 text-gold" />
                  <p className="font-display text-xl font-black text-white">{prize.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{prize.description}</p>
                </motion.div>
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
