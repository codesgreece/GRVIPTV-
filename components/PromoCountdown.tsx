"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import {
  getPromoCountdown,
  getPromoRemainingMs,
  splitCountdown,
} from "@/lib/pricing-promo";
import { cn } from "@/lib/cn";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function CountdownUnit({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "font-display tabular-nums text-2xl font-black sm:text-3xl",
          highlight ? "text-gold-bright" : "text-white",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold tracking-[0.16em] text-text-dim uppercase">
        {label}
      </span>
    </div>
  );
}

export function PromoCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const promo = useMemo(() => getPromoCountdown(now), [now]);
  const remaining = getPromoRemainingMs(now, promo.target);
  const { days, hours, minutes, seconds } = splitCountdown(remaining);

  const isEnding = promo.mode === "sale-ending";

  return (
    <div
      className={cn(
        "mx-auto mb-8 max-w-3xl overflow-hidden rounded-2xl border p-4 sm:p-5",
        isEnding
          ? "border-gold/35 bg-gradient-to-r from-gold/12 via-[#111111] to-gold/8"
          : "border-white/10 bg-[#0B0B0B]",
      )}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <div
            className={cn(
              "mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase",
              isEnding
                ? "border border-gold/30 bg-gold/15 text-gold"
                : "border border-white/10 bg-white/5 text-text-muted",
            )}
          >
            {isEnding ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Flash Προσφορά
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Κανονικές τιμές
              </>
            )}
          </div>
          <p className="font-display text-base font-bold text-white sm:text-lg">
            {isEnding
              ? "Η προσφορά λήγει σε"
              : "Η επόμενη προσφορά ξεκινά σε"}
          </p>
          <p className="mt-1 text-xs text-text-dim sm:text-sm">
            {isEnding
              ? "Έκπτωση ενεργή από 17 του μήνα — πρόλαβε πριν επιστρέψουν οι κανονικές τιμές."
              : "Μέχρι τις 16, ισχύουν οι κανονικές τιμές. Από 17, επιστρέφουν οι εκπτώσεις."}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 sm:gap-4 sm:px-5",
            isEnding ? "border-gold/25 bg-black/35" : "border-white/10 bg-black/25",
          )}
        >
          {days > 0 ? (
            <>
              <CountdownUnit label="Ημέρες" value={pad(days)} highlight={isEnding} />
              <span className="pb-4 text-xl font-black text-gold/70">:</span>
            </>
          ) : null}
          <CountdownUnit label="Ώρες" value={pad(hours)} highlight={isEnding} />
          <span className="pb-4 text-xl font-black text-gold/70">:</span>
          <CountdownUnit label="Λεπτά" value={pad(minutes)} highlight={isEnding} />
          <span className="pb-4 text-xl font-black text-gold/70">:</span>
          <CountdownUnit label="Δευτ." value={pad(seconds)} highlight={isEnding} />
        </div>
      </div>
    </div>
  );
}
