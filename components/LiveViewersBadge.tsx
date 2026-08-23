"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const MIN_VIEWERS = 297;
const MAX_VIEWERS = 784;

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextCount(current: number) {
  const delta = randomInRange(-9, 11);
  return Math.min(MAX_VIEWERS, Math.max(MIN_VIEWERS, current + delta));
}

type LiveViewersBadgeProps = {
  className?: string;
};

export function LiveViewersBadge({ className }: LiveViewersBadgeProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(() => randomInRange(MIN_VIEWERS, MAX_VIEWERS));

  useEffect(() => {
    const tick = () => {
      setCount((current) => nextCount(current));
      const delay = randomInRange(4000, 9000);
      timer = window.setTimeout(tick, delay);
    };

    let timer = window.setTimeout(tick, randomInRange(4000, 9000));
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        {!reduce ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        ) : null}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
      </span>

      <span className="font-ui text-[11px] font-bold tracking-[0.08em] text-white/90 uppercase sm:text-xs">
        ΠΑΡΑΚΟΛΟΥΘΟΥΝ ΤΩΡΑ LIVE
      </span>

      <span className="font-ui text-sm font-bold tabular-nums text-emerald-300">
        {count.toLocaleString("el-GR")}
      </span>
    </div>
  );
}
