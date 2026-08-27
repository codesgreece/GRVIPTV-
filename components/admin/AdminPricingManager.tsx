"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  canEnableOffer,
  formatEuro,
  profitForSale,
} from "@/lib/customers/pricing";
import type { PackagePricing } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type AdminPricingManagerProps = {
  pricing: PackagePricing[];
  onChange: (pricing: PackagePricing[]) => void;
  onSave: (pricing: PackagePricing[]) => Promise<string | null>;
};

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
        setError(`${pkg.packageName}: ${check.message}`);
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
    setNotice("Οι τιμές αποθηκεύτηκαν.");
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
      setError(`Χωρίς προσφορά: ${failed.map((pkg) => pkg.packageName).join(", ")}`);
    }
    await save(next);
  };

  const disableAllOffers = async () => {
    const next = readFormPricing().map((pkg) => ({ ...pkg, offerEnabled: false }));
    onChange(next);
    await save(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-white">Πακέτα & τιμές</h2>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            className="h-8 px-2.5 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs"
            onClick={() => void enableValidOffers()}
          >
            Προσφορά όλα
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2.5 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs"
            onClick={() => void disableAllOffers()}
            disabled={!anyOffer}
          >
            Off προσφορές
          </Button>
        </div>
      </div>

      <form
        key={formEpoch}
        ref={formRef}
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {pricing.map((pkg) => {
          const salePrice = pkg.offerEnabled ? pkg.offerPrice : pkg.normalPrice;
          const profit = profitForSale(pkg, salePrice);
          const offerCheck = canEnableOffer({ ...pkg, offerEnabled: true });

          return (
            <article
              key={pkg.packageId}
              className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">{pkg.packageName}</h3>
                <label className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    name={`${pkg.packageId}:offerEnabled`}
                    checked={pkg.offerEnabled}
                    onChange={(event) => toggleOffer(pkg, event.target.checked)}
                  />
                  Προσφορά
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {(
                  [
                    ["normalPrice", "Κανονική", pkg.normalPrice],
                    ["offerPrice", "Προσφορά", pkg.offerPrice],
                    ["purchaseCost", "Κόστος", pkg.purchaseCost],
                    ["minimumProfit", "Ελάχ.", pkg.minimumProfit],
                  ] as const
                ).map(([key, label, value]) => (
                  <label key={key} className="min-w-0 block">
                    <span className="mb-1 block text-[10px] font-semibold tracking-wide text-text-dim uppercase">
                      {label}
                    </span>
                    <input
                      name={`${pkg.packageId}:${key}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      defaultValue={value}
                      onInput={(event) => {
                        const parsed = Number(event.currentTarget.value);
                        if (Number.isFinite(parsed)) update(pkg.packageId, { [key]: parsed });
                      }}
                      className="admin-input"
                    />
                  </label>
                ))}
                <div className="col-span-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 sm:col-span-4 lg:col-span-1">
                  <p className="text-[10px] font-semibold tracking-wide text-text-dim uppercase">
                    Κέρδος τώρα
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-base font-black tabular-nums",
                      profit > 0 ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {formatEuro(profit)}
                  </p>
                </div>
              </div>

              {!offerCheck.ok ? (
                <p className="mt-2 text-[11px] font-semibold text-rose-300">{offerCheck.message}</p>
              ) : null}
            </article>
          );
        })}

        {error ? <p className="text-xs font-semibold text-rose-300">{error}</p> : null}
        {notice ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            {notice}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-9 px-4 py-2 text-sm font-extrabold sm:px-4 sm:py-2 sm:text-sm"
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? "Αποθήκευση…" : "Αποθήκευση"}
        </Button>
      </form>
    </div>
  );
}

export function PricingWarningBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-3 flex gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Η τιμή προσφοράς δεν αφήνει κέρδος.
    </div>
  );
}
