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

const cellInput =
  "admin-input !rounded-md !px-1.5 !py-1 text-sm tabular-nums w-full max-w-[4.5rem]";

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
      setError(
        `Χωρίς προσφορά: ${failed.map((pkg) => pkg.packageName).join(", ")} (δεν αφήνει κέρδος).`,
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
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-white">Πακέτα & τιμές</h2>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="outline"
            className="h-7 px-2.5 py-1 text-[11px] sm:px-2.5 sm:py-1 sm:text-[11px]"
            onClick={() => void enableValidOffers()}
          >
            Προσφορά όλα
          </Button>
          <Button
            variant="ghost"
            className="h-7 px-2.5 py-1 text-[11px] sm:px-2.5 sm:py-1 sm:text-[11px]"
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
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="overflow-x-auto rounded-lg border border-white/10 md:max-w-3xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-bold tracking-[0.1em] text-text-dim uppercase">
                <th className="px-2 py-1.5 font-bold">Πακέτο</th>
                <th className="w-20 px-1 py-1.5 font-bold">Κανον.</th>
                <th className="w-20 px-1 py-1.5 font-bold">Προσφ.</th>
                <th className="w-16 px-1 py-1.5 font-bold">Κόστος</th>
                <th className="w-16 px-1 py-1.5 font-bold">Ελάχ.</th>
                <th className="w-16 px-1 py-1.5 font-bold">Κέρδος</th>
                <th className="w-10 px-1 py-1.5 font-bold">On</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((pkg) => {
                const salePrice = pkg.offerEnabled ? pkg.offerPrice : pkg.normalPrice;
                const profit = profitForSale(pkg, salePrice);
                const offerCheck = canEnableOffer({ ...pkg, offerEnabled: true });

                return (
                  <tr key={pkg.packageId} className="border-b border-white/8 last:border-0">
                    <td className="px-2 py-1.5 align-middle">
                      <p className="font-semibold text-white">{pkg.packageName}</p>
                      {!offerCheck.ok ? (
                        <p className="max-w-[9rem] text-[10px] leading-tight text-rose-300">
                          {offerCheck.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-1.5 py-1.5 align-middle">
                      <input
                        name={`${pkg.packageId}:normalPrice`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        defaultValue={pkg.normalPrice}
                        onInput={(event) => {
                          const parsed = Number(event.currentTarget.value);
                          if (Number.isFinite(parsed)) update(pkg.packageId, { normalPrice: parsed });
                        }}
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-middle">
                      <input
                        name={`${pkg.packageId}:offerPrice`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        defaultValue={pkg.offerPrice}
                        onInput={(event) => {
                          const parsed = Number(event.currentTarget.value);
                          if (Number.isFinite(parsed)) update(pkg.packageId, { offerPrice: parsed });
                        }}
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-middle">
                      <input
                        name={`${pkg.packageId}:purchaseCost`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        defaultValue={pkg.purchaseCost}
                        onInput={(event) => {
                          const parsed = Number(event.currentTarget.value);
                          if (Number.isFinite(parsed)) update(pkg.packageId, { purchaseCost: parsed });
                        }}
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-middle">
                      <input
                        name={`${pkg.packageId}:minimumProfit`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        defaultValue={pkg.minimumProfit}
                        onInput={(event) => {
                          const parsed = Number(event.currentTarget.value);
                          if (Number.isFinite(parsed)) update(pkg.packageId, { minimumProfit: parsed });
                        }}
                        className={cellInput}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <span
                        className={cn(
                          "font-display text-sm font-black tabular-nums",
                          profit > 0 ? "text-emerald-400" : "text-rose-400",
                        )}
                      >
                        {formatEuro(profit)}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <input
                        type="checkbox"
                        name={`${pkg.packageId}:offerEnabled`}
                        checked={pkg.offerEnabled}
                        onChange={(event) => toggleOffer(pkg, event.target.checked)}
                        aria-label={`Προσφορά ${pkg.packageName}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {error ? <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p> : null}
        {notice ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            {notice}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-3 h-8 px-3 py-1.5 text-xs font-extrabold sm:px-3 sm:py-1.5 sm:text-xs"
          disabled={saving}
        >
          <Save className="h-3.5 w-3.5" />
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
