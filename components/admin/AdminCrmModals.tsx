"use client";

import { useMemo, useState } from "react";
import { Copy, Gift, MessageCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  activePrice,
  formatEuro,
  getPricingById,
} from "@/lib/customers/pricing";
import {
  activationMessage,
  expiredMessage,
  expiringSoonMessage,
  renewalMessage,
} from "@/lib/customers/messages";
import { CUSTOMER_PACKAGES, type CustomerView, type PackageId, type PackagePricing } from "@/lib/customers/types";
import { validateSpecialOfferPrice } from "@/lib/customers/views";
import { cn } from "@/lib/cn";

type MessagesModalProps = {
  customer: CustomerView;
  origin: string;
  onClose: () => void;
  onCopied: (message: string) => void;
};

export function AdminMessagesModal({ customer, origin, onClose, onCopied }: MessagesModalProps) {
  const templates = useMemo(
    () => [
      { id: "activation", title: "Μήνυμα ενεργοποίησης", body: activationMessage(customer, origin) },
      { id: "soon", title: "Μήνυμα λήξης σύντομα", body: expiringSoonMessage(customer) },
      { id: "expired", title: "Μήνυμα ληγμένης συνδρομής", body: expiredMessage(customer) },
      { id: "renewal", title: "Μήνυμα ανανέωσης", body: renewalMessage(customer, customer.subscriptions.at(-1), origin) },
    ],
    [customer, origin],
  );

  const copy = async (body: string) => {
    await navigator.clipboard.writeText(body);
    onCopied("Το μήνυμα αντιγράφηκε.");
  };

  return (
    <Modal title={`💬 Μηνύματα — ${customer.name}`} onClose={onClose}>
      <div className="grid min-w-0 gap-4">
        {templates.map((item) => (
          <article
            key={item.id}
            className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4"
          >
            <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="min-w-0 font-display text-sm font-bold text-white sm:text-base">
                {item.title}
              </h3>
              <Button
                variant="outline"
                className="w-full shrink-0 px-3 py-2 text-xs sm:w-auto sm:text-sm"
                onClick={() => void copy(item.body)}
              >
                <Copy className="h-4 w-4" />
                Αντιγραφή
              </Button>
            </div>
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[13px] leading-relaxed text-text-muted sm:text-sm">
              {item.body}
            </pre>
          </article>
        ))}
      </div>
    </Modal>
  );
}

type RenewModalProps = {
  customer: CustomerView;
  pricing: PackagePricing[];
  saving: boolean;
  onClose: () => void;
  onConfirm: (packageId: PackageId) => void;
};

export function AdminRenewModal({ customer, pricing, saving, onClose, onConfirm }: RenewModalProps) {
  const [packageId, setPackageId] = useState<PackageId>(customer.packageId);
  const pkg = getPricingById(pricing, packageId);
  const pay = activePrice(pkg);

  return (
    <Modal title={`🔄 Ανανέωση — ${customer.name}`} onClose={onClose}>
      <p className="text-sm text-text-muted">
        Το Magic Link μένει το ίδιο. Η νέα συνδρομή καταγράφεται στο ιστορικό με την τιμή που πληρώνει τώρα ο
        πελάτης.
      </p>

      <label className="mt-5 block text-xs font-semibold tracking-[0.12em] text-text-dim uppercase">
        Πακέτο
      </label>
      <select
        value={packageId}
        onChange={(event) => setPackageId(event.target.value as PackageId)}
        className="admin-input mt-2"
      >
        {CUSTOMER_PACKAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <PriceBox label="Αρχική τιμή" value={formatEuro(pkg.normalPrice)} />
        <PriceBox
          label="Ενεργή τιμή"
          value={formatEuro(pay)}
          hint={pkg.offerEnabled ? "Ισχύει προσφορά" : "Κανονική τιμή"}
        />
        <PriceBox label="Τιμή προσφοράς" value={formatEuro(pkg.offerPrice)} muted={!pkg.offerEnabled} />
        <PriceBox
          label="Τύπος"
          value={pkg.offerEnabled ? "🔥 Προσφορά" : "Κανονική"}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4">
        <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Ο πελάτης πληρώνει</p>
        <p className="mt-1 font-display text-3xl font-black text-white">{formatEuro(pay)}</p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button className="font-extrabold sm:flex-1" disabled={saving} onClick={() => onConfirm(packageId)}>
          <RefreshCw className="h-4 w-4" />
          {saving ? "Ανανέωση…" : "Ολοκλήρωση ανανέωσης"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Ακύρωση
        </Button>
      </div>
    </Modal>
  );
}

type SpecialOfferModalProps = {
  customer: CustomerView;
  pricing: PackagePricing[];
  saving: boolean;
  onClose: () => void;
  onConfirm: (packageId: PackageId, amountPaid: number) => void;
};

export function AdminSpecialOfferModal({
  customer,
  pricing,
  saving,
  onClose,
  onConfirm,
}: SpecialOfferModalProps) {
  const [packageId, setPackageId] = useState<PackageId>(customer.packageId);
  const pkg = getPricingById(pricing, packageId);
  const [specialPrice, setSpecialPrice] = useState(String(Math.max(pkg.purchaseCost + 1, pkg.offerPrice)));
  const amount = Number(specialPrice);
  const check = validateSpecialOfferPrice(pkg, amount);

  return (
    <Modal title={`🎁 Ειδική Προσφορά — ${customer.name}`} onClose={onClose}>
      <p className="text-sm text-text-muted">
        Μόνο για αυτόν τον πελάτη. Δεν αλλάζει τις δημόσιες τιμές στο /paketa ούτε άλλους πελάτες.
      </p>

      <label className="mt-5 block text-xs font-semibold tracking-[0.12em] text-text-dim uppercase">
        Πακέτο
      </label>
      <select
        value={packageId}
        onChange={(event) => {
          const next = event.target.value as PackageId;
          const nextPkg = getPricingById(pricing, next);
          setPackageId(next);
          setSpecialPrice(String(Math.max(nextPkg.purchaseCost + 1, nextPkg.offerPrice)));
        }}
        className="admin-input mt-2"
      >
        {CUSTOMER_PACKAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <PriceBox label="Κανονική τιμή" value={formatEuro(pkg.normalPrice)} />
        <PriceBox label="Κόστος αγοράς" value={formatEuro(pkg.purchaseCost)} />
      </div>

      <label className="mt-4 block text-xs font-semibold tracking-[0.12em] text-text-dim uppercase">
        Προτεινόμενη ειδική τιμή
      </label>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={specialPrice}
        onChange={(event) => setSpecialPrice(event.target.value)}
        className="admin-input mt-2"
      />

      <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4">
        <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Καθαρό κέρδος</p>
        <p className={cn("mt-1 font-display text-3xl font-black", check.profit > 0 ? "text-emerald-400" : "text-rose-400")}>
          {formatEuro(check.profit)}
        </p>
      </div>

      {!check.ok ? (
        <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200">
          ⚠️ {check.message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          className="font-extrabold sm:flex-1"
          disabled={saving || !check.ok}
          onClick={() => onConfirm(packageId, amount)}
        >
          <Gift className="h-4 w-4" />
          {saving ? "Εφαρμογή…" : "Εφαρμογή ειδικής προσφοράς"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Ακύρωση
        </Button>
      </div>
    </Modal>
  );
}

function PriceBox({
  label,
  value,
  hint,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-black", muted ? "text-text-dim" : "text-white")}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/70 p-3 pt-8 sm:p-4 sm:pt-16">
      <div
        className={cn(
          "mx-auto w-full min-w-0 rounded-3xl border border-gold/25 bg-[#0B0B0B] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-6",
          wide ? "max-w-3xl" : "max-w-2xl",
        )}
      >
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 break-words font-display text-lg font-bold text-white sm:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 p-2 text-text-muted hover:text-white"
            aria-label="Κλείσιμο"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export { Modal as AdminModal };

export function MessagesButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <MessageCircle className="h-4 w-4" />
      Μηνύματα
    </Button>
  );
}
