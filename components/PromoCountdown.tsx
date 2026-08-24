"use client";

import { Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function PromoCountdown({ hasOffer }: { hasOffer: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto mb-8 max-w-3xl overflow-hidden rounded-2xl border p-4 sm:p-5",
        hasOffer
          ? "border-gold/35 bg-gradient-to-r from-gold/12 via-[#111111] to-gold/8"
          : "border-white/10 bg-[#0B0B0B]",
      )}
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <div
            className={cn(
              "mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase",
              hasOffer
                ? "border border-gold/30 bg-gold/15 text-gold"
                : "border border-white/10 bg-white/5 text-text-muted",
            )}
          >
            {hasOffer ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Προσφορά ενεργή
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Κανονικές τιμές
              </>
            )}
          </div>
          <p className="font-display text-base font-bold text-white sm:text-lg">
            {hasOffer ? "Ισχύουν οι τιμές προσφοράς" : "Ισχύουν οι κανονικές τιμές"}
          </p>
          <p className="mt-1 text-xs text-text-dim sm:text-sm">
            {hasOffer
              ? "Οι εκπτώσεις ενημερώνονται αυτόματα σε όλα τα πακέτα που έχουν ενεργή προσφορά."
              : "Όταν ενεργοποιηθεί προσφορά από το admin, οι τιμές αλλάζουν αυτόματα σε όλο το site."}
          </p>
        </div>
      </div>
    </div>
  );
}
