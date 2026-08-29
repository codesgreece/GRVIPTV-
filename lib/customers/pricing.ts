import type { PackageId, PackagePricing } from "./types";
import { PACKAGE_OPTIONS } from "./types";
import { DEFAULT_PROVIDER_PACKAGE_IDS } from "@/lib/iptv/pricing-map";

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
    providerPackageId: null,
  },
  {
    packageId: "3-months",
    packageName: "3 Μήνες",
    durationMonths: 3,
    normalPrice: 47,
    offerPrice: 35,
    purchaseCost: 3,
    offerEnabled: false,
    minimumProfit: 0,
    providerPackageId: DEFAULT_PROVIDER_PACKAGE_IDS["3-months"] ?? null,
  },
  {
    packageId: "6-months",
    packageName: "6 Μήνες",
    durationMonths: 6,
    normalPrice: 56,
    offerPrice: 46,
    purchaseCost: 6,
    offerEnabled: false,
    minimumProfit: 0,
    providerPackageId: DEFAULT_PROVIDER_PACKAGE_IDS["6-months"] ?? null,
  },
  {
    packageId: "12-months",
    packageName: "12 Μήνες",
    durationMonths: 12,
    normalPrice: 89,
    offerPrice: 72,
    purchaseCost: 15,
    offerEnabled: false,
    minimumProfit: 0,
    providerPackageId: DEFAULT_PROVIDER_PACKAGE_IDS["12-months"] ?? null,
  },
];

/** Previous CRM seed — migrate stored catalogs that still have these defaults. */
const LEGACY_CRM_SEED_PRICES: Partial<
  Record<PackageId, { normalPrice: number; offerPrice: number }>
> = {
  "3-months": { normalPrice: 40, offerPrice: 30 },
  "6-months": { normalPrice: 55, offerPrice: 45 },
  "12-months": { normalPrice: 75, offerPrice: 55 },
};

export function packageLabel(id: PackageId): string {
  return PACKAGE_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

export function durationMonths(id: PackageId): number {
  return PACKAGE_OPTIONS.find((item) => item.id === id)?.months ?? 0;
}

export function getPricingById(list: PackagePricing[], id: PackageId): PackagePricing {
  const found = list.find((item) => item.packageId === id);
  if (found) return found;

  const option = PACKAGE_OPTIONS.find((item) => item.id === id);
  if (option && option.minutes > 0) {
    return {
      packageId: id,
      packageName: option.label,
      durationMonths: 0,
      normalPrice: 0,
      offerPrice: 0,
      purchaseCost: 0,
      offerEnabled: false,
      minimumProfit: 0,
    };
  }

  return ensurePricing([])[0];
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
      providerPackageId:
        existing.providerPackageId ?? seed.providerPackageId ?? null,
      providerName: existing.providerName ?? null,
      providerDuration: existing.providerDuration ?? null,
      providerDurationUnit: existing.providerDurationUnit ?? null,
      providerCredits: existing.providerCredits ?? null,
      providerMaxConnections: existing.providerMaxConnections ?? null,
    };
  });
}

function isLegacyCrmSeedCatalog(list: PackagePricing[]) {
  return (Object.entries(LEGACY_CRM_SEED_PRICES) as Array<
    [PackageId, { normalPrice: number; offerPrice: number }]
  >).every(([packageId, legacy]) => {
    const current = list.find((item) => item.packageId === packageId);
    return (
      current != null &&
      current.normalPrice === legacy.normalPrice &&
      current.offerPrice === legacy.offerPrice
    );
  });
}

export function migrateStoredPricing(list: PackagePricing[] | undefined): PackagePricing[] {
  const normalized = ensurePricing(list);
  if (!isLegacyCrmSeedCatalog(normalized)) return normalized;

  return normalized.map((pkg) => {
    if (!LEGACY_CRM_SEED_PRICES[pkg.packageId]) return pkg;
    const seed = DEFAULT_PACKAGE_PRICING.find((item) => item.packageId === pkg.packageId);
    if (!seed) return pkg;
    return {
      ...pkg,
      normalPrice: seed.normalPrice,
      offerPrice: seed.offerPrice,
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
