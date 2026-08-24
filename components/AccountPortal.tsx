import { Calendar, CalendarX, Clock3, Package, RefreshCw, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactConfig } from "@/lib/contact";
import { formatGreekDate, getPackageLabel, getSubscriptionView } from "@/lib/customers/status";
import { RENEW_PATH, type Customer } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type AccountPortalProps = {
  customer: Customer;
};

const toneStyles = {
  green: {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    bar: "from-emerald-400 to-emerald-300",
    glow: "rgba(16,185,129,0.18)",
  },
  orange: {
    badge: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    bar: "from-amber-400 to-amber-200",
    glow: "rgba(245,158,11,0.18)",
  },
  red: {
    badge: "border-rose-400/35 bg-rose-500/10 text-rose-300",
    bar: "from-rose-500 to-rose-400",
    glow: "rgba(244,63,94,0.2)",
  },
  expired: {
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    bar: "from-rose-700 to-rose-500",
    glow: "rgba(127,29,29,0.28)",
  },
} as const;

export function AccountPortal({ customer }: AccountPortalProps) {
  const view = getSubscriptionView(customer);
  const tone = toneStyles[view.tone];
  const urgent = view.tone === "orange" || view.tone === "red" || view.tone === "expired";
  const packageLabel = getPackageLabel(customer.packageId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] pb-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${tone.glow}, transparent 62%)`,
        }}
      />

      <header className="relative z-10 border-b border-white/8">
        <div className="container-premium flex h-16 items-center justify-between">
          <a href="/" className="font-display text-sm font-black tracking-[0.18em] text-gold">
            GRVIP OTT
          </a>
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-bold uppercase", tone.badge)}>
            {view.statusLabel}
          </span>
        </div>
      </header>

      <main className="container-premium relative z-10 pt-8 sm:pt-12">
        <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">My Account</p>
        <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
          👋 Γεια σου, {customer.name}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
          {view.statusHint}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <AccountCard icon={Package} label="Το πακέτο σου" value={`${packageLabel} Premium`} />
          <AccountCard icon={Calendar} label="Ενεργοποίηση" value={formatGreekDate(customer.activatedAt)} />
          <AccountCard
            icon={Clock3}
            label="Απομένουν"
            value={view.daysRemaining > 0 ? `${view.daysRemaining} ημέρες` : "0 ημέρες"}
            emphasize
          />
          <AccountCard icon={CalendarX} label="Λήξη συνδρομής" value={formatGreekDate(customer.expiresAt)} />
        </div>

        <section className="mt-4 rounded-3xl border border-white/10 bg-[#0B0B0B] p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-[0.14em] text-text-dim uppercase">
              Πορεία συνδρομής
            </p>
            <p className="font-display text-lg font-black text-white">{view.remainingPercent}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tone.bar)}
              style={{ width: `${view.remainingPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-text-muted">
            {view.tone === "expired"
              ? "⛔ Η συνδρομή έχει λήξει"
              : `${view.daysRemaining} από ${view.totalDays} ημέρες απομένουν`}
          </p>
        </section>

        <div className="mt-6 grid gap-3">
          {urgent ? (
            <Button href={RENEW_PATH} fullWidth className="h-12 font-extrabold">
              <RefreshCw className="h-4 w-4" />
              Ανανέωση Συνδρομής
            </Button>
          ) : null}

          <Button href={customer.setupGuideUrl} variant={urgent ? "outline" : "gold"} fullWidth className="h-12 font-extrabold">
            <Smartphone className="h-4 w-4" />
            Οδηγός Εγκατάστασης
          </Button>

          <Button href={contactConfig.telegram} variant="outline" fullWidth className="h-12 font-extrabold">
            <Send className="h-4 w-4" />
            Telegram Support
          </Button>

          {!urgent ? (
            <Button href={RENEW_PATH} variant="ghost" fullWidth>
              <RefreshCw className="h-4 w-4" />
              Ανανέωση Συνδρομής
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function AccountCard({
  icon: Icon,
  label,
  value,
  emphasize,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#0B0B0B] p-5">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] font-bold tracking-[0.16em] text-text-dim uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-display font-black text-white",
          emphasize ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
        )}
      >
        {value}
      </p>
    </article>
  );
}
