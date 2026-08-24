import type { PackageId, PackagePricing } from "./types";
import { PACKAGE_OPTIONS } from "./types";

export const DEFAULT_PACKAGE_PRICING: PackagePricing[] = [
  {
    packageId: "1-month",
    packageName: "1 Μήνας",
    durationMonths: 1,
    normalPrice: 20,
    offerPrice: 15,
    purchaseCost: 1,
    offerEnabled: false,
    minimumProfit: 0,
  },
  {
    packageId: "3-months",
    packageName: "3 Μήνες",
    durationMonths: 3,
    normalPrice: 40,
    offerPrice: 30,
    purchaseCost: 3,
    offerEnabled: false,
    minimumProfit: 0,
  },
  {
    packageId: "6-months",
    packageName: "6 Μήνες",
    durationMonths: 6,
    normalPrice: 55,
    offerPrice: 45,
    purchaseCost: 6,
    offerEnabled: false,
    minimumProfit: 0,
  },
  {
    packageId: "12-months",
    packageName: "12 Μήνες",
    durationMonths: 12,
    normalPrice: 75,
    offerPrice: 55,
    purchaseCost: 15,
    offerEnabled: false,
    minimumProfit: 0,
  },
];

export function packageLabel(id: PackageId): string {
  return PACKAGE_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

export function durationMonths(id: PackageId): number {
  return PACKAGE_OPTIONS.find((item) => item.id === id)?.months ?? 1;
}

export function ensurePricing(list: PackagePricing[] | undefined): PackagePricing[] {
  const byId = new Map((list ?? []).map((item) => [item.packageId, item]));
  return DEFAULT_PACKAGE_PRICING.map((seed) => {
    const existing = byId.get(seed.packageId);
    if (!existing) return { ...seed };
    const num = (value: unknown, fallback: number) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    return {
      packageId: seed.packageId,
      packageName: existing.packageName || seed.packageName,
      durationMonths: num(existing.durationMonths, seed.durationMonths),
      normalPrice: num(existing.normalPrice, seed.normalPrice),
      offerPrice: num(existing.offerPrice, seed.offerPrice),
      purchaseCost: num(existing.purchaseCost, seed.purchaseCost),
      offerEnabled: Boolean(existing.offerEnabled),
      minimumProfit: num(existing.minimumProfit, seed.minimumProfit),
    };
  });
}

export function activePrice(pkg: PackagePricing): number {
  return pkg.offerEnabled && canEnableOffer(pkg).ok ? pkg.offerPrice : pkg.normalPrice;
}

export function priceType(pkg: PackagePricing): "NORMAL" | "OFFER" {
  return pkg.offerEnabled && canEnableOffer(pkg).ok ? "OFFER" : "NORMAL";
}

export function profitForSale(pkg: PackagePricing, salePrice: number): number {
  return roundMoney(salePrice - pkg.purchaseCost);
}

export function offerProfit(pkg: PackagePricing): number {
  return profitForSale(pkg, pkg.offerPrice);
}

export function canEnableOffer(pkg: PackagePricing): { ok: boolean; message?: string } {
  const profit = offerProfit(pkg);
  if (profit <= 0) {
    return { ok: false, message: "Η τιμή προσφοράς δεν αφήνει κέρδος" };
  }
  if (profit < (pkg.minimumProfit ?? 0)) {
    return {
      ok: false,
      message: `Η τιμή προσφοράς αφήνει κέρδος ${formatEuro(profit)}, κάτω από το ελάχιστο ${formatEuro(pkg.minimumProfit ?? 0)}`,
    };
  }
  return { ok: true };
}

export function validatePricingUpdate(next: PackagePricing): { ok: boolean; message?: string } {
  if (!Number.isFinite(next.normalPrice) || next.normalPrice < 0) {
    return { ok: false, message: "Η κανονική τιμή δεν είναι έγκυρη." };
  }
  if (!Number.isFinite(next.offerPrice) || next.offerPrice < 0) {
    return { ok: false, message: "Η τιμή προσφοράς δεν είναι έγκυρη." };
  }
  if (!Number.isFinite(next.purchaseCost) || next.purchaseCost < 0) {
    return { ok: false, message: "Το κόστος αγοράς δεν είναι έγκυρο." };
  }
  if (next.offerEnabled) {
    const check = canEnableOffer(next);
    if (!check.ok) return check;
  }
  return { ok: true };
}

export function getPricingById(list: PackagePricing[], id: PackageId): PackagePricing {
  const found = list.find((item) => item.packageId === id);
  return found ?? ensurePricing([])[0];
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatEuro(value: number): string {
  const rounded = roundMoney(value);
  return Number.isInteger(rounded) ? `${rounded}€` : `${rounded.toFixed(2)}€`;
}

export type PublicPackagePrice = {
  packageId: PackageId;
  packageName: string;
  durationMonths: number;
  normalPrice: number;
  offerPrice: number;
  offerEnabled: boolean;
  activePrice: number;
  priceType: "NORMAL" | "OFFER";
};

export function toPublicPricing(list: PackagePricing[]): PublicPackagePrice[] {
  return list.map((pkg) => {
    const enabled = priceType(pkg) === "OFFER";
    return {
      packageId: pkg.packageId,
      packageName: pkg.packageName,
      durationMonths: pkg.durationMonths,
      normalPrice: pkg.normalPrice,
      offerPrice: pkg.offerPrice,
      offerEnabled: enabled,
      activePrice: enabled ? pkg.offerPrice : pkg.normalPrice,
      priceType: enabled ? "OFFER" : "NORMAL",
    };
  });
}

export function defaultPublicPricing(): PublicPackagePrice[] {
  return toPublicPricing(ensurePricing([]));
}

export function formatEuroPrefix(value: number): string {
  const rounded = roundMoney(value);
  return Number.isInteger(rounded) ? `€${rounded}` : `€${rounded.toFixed(2)}`;
}

export function parsePricingPayload(body: unknown): PackagePricing[] {
  const data = (body ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.pricing) ? data.pricing : Array.isArray(body) ? body : null;
  if (!list) throw new Error("Μη έγκυρα δεδομένα τιμών.");
  return ensurePricing(list as PackagePricing[]);
}
