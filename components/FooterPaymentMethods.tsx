import { ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import { paysafeCardLinks } from "@/data/content";
import { cn } from "@/lib/cn";

const paymentMethods = [
  {
    id: "paysafe",
    label: "Paysafe Card",
    icon: CreditCard,
    accent: "from-[#0ea5e9]/20 to-[#0369a1]/10",
    border: "border-sky-500/30",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
  {
    id: "binance",
    label: "Binance Card",
    icon: Wallet,
    accent: "from-gold/20 to-[#b8860b]/10",
    border: "border-gold/35",
    text: "text-gold-bright",
    dot: "bg-gold-bright",
  },
] as const;

function paysafeAmount(label: string) {
  return label.replace(/\s*ΕΥΡΩ/i, "").trim();
}

export function FooterPaymentMethods() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0A0A0A] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,167,44,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_50%)]" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">
              Τρόποι Πληρωμής
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
              Προμηθεύσου τις κάρτες σου
            </h3>
            <p className="mt-1 max-w-md text-sm text-text-muted">
              Επίσημες κάρτες Paysafe μέσω Eneba — ασφαλής αγορά, άμεση παράδοση κωδικού.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {paymentMethods.map((method) => (
              <span
                key={method.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3.5 py-2 text-xs font-semibold",
                  method.border,
                  method.accent,
                  method.text,
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", method.dot)} />
                <method.icon className="h-3.5 w-3.5 opacity-90" />
                {method.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/8 bg-black/35 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-[0.14em] text-sky-300 uppercase">
              Paysafe · Eneba
            </p>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-text-dim uppercase">
              Greece
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {paysafeCardLinks.map((link) => {
              const amount = paysafeAmount(link.label);

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0B0B0B] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-sky-400/45 hover:shadow-[0_10px_28px_rgba(14,165,233,0.18)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/0 transition duration-300 group-hover:from-sky-500/10 group-hover:to-transparent" />
                  <div className="relative">
                    <p className="font-display text-2xl font-black leading-none text-white">
                      €{amount}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-text-dim transition group-hover:text-sky-300">
                      Αγορά
                      <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
