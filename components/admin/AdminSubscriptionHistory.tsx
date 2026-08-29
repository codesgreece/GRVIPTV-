"use client";

import { formatEuro } from "@/lib/customers/pricing";
import { paymentMethodLabel } from "@/lib/customers/payment";
import { priceTypeLabel } from "@/lib/customers/views";
import type { Subscription } from "@/lib/customers/types";

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function Stat({
  label,
  value,
  emphasize,
  profit,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  profit?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-text-dim uppercase">{label}</p>
      <p
        className={
          profit
            ? "mt-0.5 text-sm font-semibold text-emerald-400"
            : emphasize
              ? "mt-0.5 text-sm font-semibold text-white"
              : "mt-0.5 text-sm text-text-muted"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function AdminSubscriptionHistory({
  subscriptions,
  className,
}: {
  subscriptions: Subscription[];
  className?: string;
}) {
  return (
    <div className={className ?? "mt-4 min-w-0"}>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <h3 className="border-b border-white/8 px-3 py-3 font-display text-sm font-bold text-white sm:text-base">
          Ιστορικό συνδρομών
        </h3>

        {subscriptions.length === 0 ? (
          <p className="px-3 py-3 text-sm text-text-muted">Δεν υπάρχει ιστορικό ακόμα.</p>
        ) : (
          <>
            <div className="grid gap-3 p-3 md:hidden">
              {subscriptions.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-base font-bold text-gold">{item.packageName}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                      {priceTypeLabel(item.priceType)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Stat label="Ενεργοποίηση" value={formatDate(item.startDate)} emphasize />
                    <Stat label="Λήξη" value={formatDate(item.endDate)} emphasize />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/8 pt-3 sm:grid-cols-4">
                    <Stat label="Πληρωμή" value={formatEuro(item.amountPaid)} emphasize />
                    <Stat label="Κόστος" value={formatEuro(item.purchaseCostAtTime)} />
                    <Stat label="Κέρδος" value={formatEuro(item.profitAtTime)} profit />
                    <Stat
                      label="Τρόπος πληρωμής"
                      value={paymentMethodLabel(item.paymentMethod) ?? "—"}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-white/4 text-[11px] tracking-[0.12em] text-text-dim uppercase">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Πακέτο</th>
                    <th className="px-3 py-2 font-semibold">Ενεργοποίηση</th>
                    <th className="px-3 py-2 font-semibold">Λήξη</th>
                    <th className="px-3 py-2 font-semibold">Πληρωμή</th>
                    <th className="px-3 py-2 font-semibold">Κόστος</th>
                    <th className="px-3 py-2 font-semibold">Κέρδος</th>
                    <th className="px-3 py-2 font-semibold">Πληρωμή με</th>
                    <th className="px-3 py-2 font-semibold">Τύπος</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((item) => (
                    <tr key={item.id} className="border-t border-white/8">
                      <td className="px-3 py-2 text-white">{item.packageName}</td>
                      <td className="px-3 py-2 text-text-muted">{formatDate(item.startDate)}</td>
                      <td className="px-3 py-2 text-text-muted">{formatDate(item.endDate)}</td>
                      <td className="px-3 py-2 font-semibold text-white">
                        {formatEuro(item.amountPaid)}
                      </td>
                      <td className="px-3 py-2 text-text-muted">
                        {formatEuro(item.purchaseCostAtTime)}
                      </td>
                      <td className="px-3 py-2 font-semibold text-emerald-400">
                        {formatEuro(item.profitAtTime)}
                      </td>
                      <td className="px-3 py-2 text-text-muted">
                        {paymentMethodLabel(item.paymentMethod) ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-text-muted">
                        {priceTypeLabel(item.priceType)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
