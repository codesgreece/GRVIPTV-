"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  canEnableOffer,
  formatEuro,
  offerProfit,
  profitForSale,
} from "@/lib/customers/pricing";
import type { PackagePricing } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type AdminPricingManagerProps = {
  pricing: PackagePricing[];
  onChange: (pricing: PackagePricing[]) => void;
  onSave: (pricing: PackagePricing[]) => Promise<string | null>;
};

function NumberField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">
        {label}
      </span>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        defaultValue={Number.isFinite(value) ? value : 0}
        onInput={(event) => {
          const parsed = Number(event.currentTarget.value);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        className="admin-input"
      />
    </label>
  );
}

function readNumber(form: HTMLFormElement, name: string, fallback: number) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) return fallback;
  const parsed = Number(field.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function AdminPricingManager({ pricing, onChange, onSave }: AdminPricingManagerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formEpoch, setFormEpoch] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const anyOffer = pricing.some((pkg) => pkg.offerEnabled);

  const update = (packageId: string, patch: Partial<PackagePricing>) => {
    onChange(pricing.map((pkg) => (pkg.packageId === packageId ? { ...pkg, ...patch } : pkg)));
  };

  const readFormPricing = (): PackagePricing[] => {
    const form = formRef.current;
    if (!form) return pricing;

    return pricing.map((pkg) => {
      const offerBox = form.elements.namedItem(`${pkg.packageId}:offerEnabled`);
      return {
        ...pkg,
        normalPrice: readNumber(form, `${pkg.packageId}:normalPrice`, pkg.normalPrice),
        offerPrice: readNumber(form, `${pkg.packageId}:offerPrice`, pkg.offerPrice),
        purchaseCost: readNumber(form, `${pkg.packageId}:purchaseCost`, pkg.purchaseCost),
        minimumProfit: readNumber(form, `${pkg.packageId}:minimumProfit`, pkg.minimumProfit),
        offerEnabled: offerBox instanceof HTMLInputElement ? offerBox.checked : pkg.offerEnabled,
      };
    });
  };

  const toggleOffer = (pkg: PackagePricing, enabled: boolean) => {
    const current = readFormPricing().find((item) => item.packageId === pkg.packageId) ?? pkg;
    if (enabled) {
      const check = canEnableOffer({ ...current, offerEnabled: true });
      if (!check.ok) {
        setError(`⚠️ ${pkg.packageName}: ${check.message}`);
        setNotice("");
        return;
      }
    }
    setError("");
    update(pkg.packageId, { offerEnabled: enabled });
  };

  const save = async (next?: PackagePricing[]) => {
    const payload = next ?? readFormPricing();
    onChange(payload);
    setSaving(true);
    setError("");
    setNotice("");
    const message = await onSave(payload);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    setNotice("Οι τιμές αποθηκεύτηκαν και ισχύουν σε όλο το site.");
    setFormEpoch((current) => current + 1);
  };

  const enableValidOffers = async () => {
    const current = readFormPricing();
    const next = current.map((pkg) => {
      const check = canEnableOffer({ ...pkg, offerEnabled: true });
      return { ...pkg, offerEnabled: check.ok };
    });
    onChange(next);
    const failed = current.filter((pkg) => !canEnableOffer({ ...pkg, offerEnabled: true }).ok);
    if (failed.length) {
      setError(
        `⚠️ Δεν ενεργοποιήθηκε προσφορά για: ${failed.map((pkg) => pkg.packageName).join(", ")}. Η τιμή προσφοράς δεν αφήνει κέρδος.`,
      );
    }
    await save(next);
  };

  const disableAllOffers = async () => {
    const next = readFormPricing().map((pkg) => ({ ...pkg, offerEnabled: false }));
    onChange(next);
    await save(next);
  };

  return (
    <section className="mb-8 rounded-3xl border border-gold/20 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Central Pricing</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">💰 Διαχείριση Πακέτων & Τιμών</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Ένα σημείο αλήθειας για /paketa, κάρτες πακέτων, αγορά και ανανεώσεις. Αν δεν υπάρχει ενεργή
            προσφορά, ισχύουν οι κανονικές τιμές.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => void enableValidOffers()}>
            Προσφορά σε όλα
          </Button>
          <Button variant="ghost" onClick={() => void disableAllOffers()} disabled={!anyOffer}>
            Απενεργοποίηση προσφορών
          </Button>
        </div>
      </div>

      <form
        key={formEpoch}
        ref={formRef}
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {pricing.map((pkg) => {
          const salePrice = pkg.offerEnabled ? pkg.offerPrice : pkg.normalPrice;
          const profit = profitForSale(pkg, salePrice);
          const offerCheck = canEnableOffer({ ...pkg, offerEnabled: true });
          const offerP = offerProfit(pkg);

          return (
            <article key={pkg.packageId} className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{pkg.packageName}</h3>
                  <p className="text-xs text-text-dim">Διάρκεια: {pkg.durationMonths} μήνες</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-text-muted">
                  <input
                    type="checkbox"
                    name={`${pkg.packageId}:offerEnabled`}
                    checked={pkg.offerEnabled}
                    onChange={(event) => toggleOffer(pkg, event.target.checked)}
                  />
                  Προσφορά ενεργή
                </label>
              </div>

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <NumberField
                  label="Κανονική τιμή"
                  name={`${pkg.packageId}:normalPrice`}
                  value={pkg.normalPrice}
                  onChange={(value) => update(pkg.packageId, { normalPrice: value })}
                />
                <NumberField
                  label="Τιμή προσφοράς"
                  name={`${pkg.packageId}:offerPrice`}
                  value={pkg.offerPrice}
                  onChange={(value) => update(pkg.packageId, { offerPrice: value })}
                />
                <NumberField
                  label="Κόστος αγοράς"
                  name={`${pkg.packageId}:purchaseCost`}
                  value={pkg.purchaseCost}
                  onChange={(value) => update(pkg.packageId, { purchaseCost: value })}
                />
                <NumberField
                  label="Ελάχιστο κέρδος"
                  name={`${pkg.packageId}:minimumProfit`}
                  value={pkg.minimumProfit}
                  onChange={(value) => update(pkg.packageId, { minimumProfit: value })}
                />
                <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">
                    Κέρδος ανά πώληση
                  </p>
                  <p
                    className={cn(
                      "mt-2 font-display text-2xl font-black",
                      profit > 0 ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {formatEuro(profit)} {profit > 0 ? "🟢" : "🔴"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-text-muted sm:grid-cols-3">
                <p>Κανονική: {formatEuro(pkg.normalPrice)}</p>
                <p>Προσφορά: {formatEuro(pkg.offerPrice)} (κέρδος {formatEuro(offerP)})</p>
                <p>Ενεργή χρέωση: {formatEuro(salePrice)}</p>
              </div>

              {!offerCheck.ok ? (
                <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200">
                  ⚠️ {offerCheck.message}
                </p>
              ) : null}
            </article>
          );
        })}

        {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}
        {notice ? (
          <p className="inline-flex items-center gap-2 text-sm text-emerald-400">
            <Check className="h-4 w-4" />
            {notice}
          </p>
        ) : null}

        <Button type="submit" className="font-extrabold sm:w-fit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Αποθήκευση…" : "Αποθήκευση τιμών"}
        </Button>
      </form>
    </section>
  );
}

export function PricingWarningBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-4 flex gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      Η τιμή προσφοράς δεν αφήνει κέρδος. Διόρθωσε την τιμή πριν την ενεργοποίηση.
    </div>
  );
}
