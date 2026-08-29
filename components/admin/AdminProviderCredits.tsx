"use client";

import { RefreshCw } from "lucide-react";
import { formatProviderCredits } from "@/lib/iptv/format";
import { cn } from "@/lib/cn";

type AdminProviderCreditsProps = {
  connected: boolean;
  credits: number | null;
  statusLabel: string;
  refreshing?: boolean;
  compact?: boolean;
  onRefresh?: () => void;
};

export function AdminProviderCredits({
  connected,
  credits,
  statusLabel,
  refreshing = false,
  compact = false,
  onRefresh,
}: AdminProviderCreditsProps) {
  const creditsLabel = formatProviderCredits(credits);
  const configured = statusLabel !== "Μη ρυθμισμένο";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold",
          connected
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : "border-rose-500/30 bg-rose-500/10 text-rose-100",
        )}
        title={
          configured
            ? `Provider: ${statusLabel} · Διαθέσιμα credits: ${creditsLabel}`
            : "Ρύθμισε GRVIP_PROVIDER_API_KEY στο environment"
        }
      >
        <span aria-hidden>{connected ? "🟢" : "🔴"}</span>
        <span className="whitespace-nowrap">
          💳 <span className="tabular-nums text-white">{creditsLabel}</span>
        </span>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded p-0.5 text-current hover:bg-white/10 disabled:opacity-50"
            aria-label="Ανανέωση credits"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border p-3 sm:p-4",
        connected
          ? "border-emerald-500/25 bg-emerald-500/8"
          : "border-rose-500/25 bg-rose-500/8",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-text-dim uppercase">
            GRVIP Provider
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
            <span aria-hidden>{connected ? "🟢" : "🔴"}</span>
            <span>{connected ? "API Connected" : statusLabel}</span>
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-text-muted hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Ανανέωση
          </button>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-text-dim uppercase">
          Διαθέσιμα credits
        </p>
        <p className="mt-1 font-display text-3xl font-black tabular-nums text-white sm:text-4xl">
          {creditsLabel}
        </p>
        {!configured ? (
          <p className="mt-1 text-xs text-amber-200">
            Ρύθμισε <code className="text-amber-100">GRVIP_PROVIDER_API_KEY</code> στο environment.
          </p>
        ) : !connected ? (
          <p className="mt-1 text-xs text-rose-200">Δεν ήταν δυνατή η σύνδεση με τον provider.</p>
        ) : (
          <p className="mt-1 text-xs text-text-muted">
            Υπόλοιπο από τον IPTV provider — ενημερώνεται live από το API.
          </p>
        )}
      </div>
    </section>
  );
}
