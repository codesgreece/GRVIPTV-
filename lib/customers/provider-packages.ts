import { getPricingById } from "@/lib/customers/pricing";
import { isTrialPackage } from "@/lib/customers/status";
import { CUSTOMER_PACKAGES, type PackageId, type PackagePricing } from "@/lib/customers/types";
import { DEFAULT_PROVIDER_PACKAGE_IDS } from "@/lib/iptv/pricing-map";

export function resolveProviderPackageId(pricing: PackagePricing[], packageId: PackageId): number | null {
  const pkg = getPricingById(pricing, packageId);
  if (typeof pkg.providerPackageId === "number" && pkg.providerPackageId > 0) {
    return pkg.providerPackageId;
  }
  const suggested = DEFAULT_PROVIDER_PACKAGE_IDS[packageId];
  return typeof suggested === "number" ? suggested : null;
}

export function isProviderBackedPackage(pricing: PackagePricing[], packageId: PackageId): boolean {
  return resolveProviderPackageId(pricing, packageId) != null;
}

/** Packages that can create/renew a real provider line via API. */
export function providerSellablePackages(pricing: PackagePricing[]) {
  const sellable = CUSTOMER_PACKAGES.filter((item) => isProviderBackedPackage(pricing, item.id));
  const trials = sellable.filter((item) => isTrialPackage(item.id));
  const paid = sellable.filter((item) => !isTrialPackage(item.id) && item.id !== "1-month");
  return [...trials, ...paid];
}

export function providerTrialPackages(pricing: PackagePricing[]) {
  return providerSellablePackages(pricing).filter((item) => isTrialPackage(item.id));
}

export function providerPaidPackages(pricing: PackagePricing[]) {
  return providerSellablePackages(pricing).filter((item) => !isTrialPackage(item.id));
}

export function defaultProviderPackageId(pricing: PackagePricing[]): PackageId {
  const sellable = providerSellablePackages(pricing);
  const preferredTrial = sellable.find((item) => item.id === "trial-1day");
  if (preferredTrial) return preferredTrial.id;
  const preferred = sellable.find((item) => item.id === "3-months");
  return preferred?.id ?? sellable[0]?.id ?? "trial-1day";
}

export function providerPackageSummary(pricing: PackagePricing[], packageId: PackageId) {
  const pkg = getPricingById(pricing, packageId);
  const providerPackageId = resolveProviderPackageId(pricing, packageId);
  if (!providerPackageId) {
    return {
      linked: false as const,
      message: "Δεν υπάρχει provider package — ρύθμισέ το στο Τιμές.",
    };
  }
  const duration =
    pkg.providerDuration && pkg.providerDurationUnit
      ? `${pkg.providerDuration} ${pkg.providerDurationUnit}`
      : null;
  return {
    linked: true as const,
    providerPackageId,
    providerName: pkg.providerName,
    credits: pkg.providerCredits,
    maxConnections: pkg.providerMaxConnections,
    duration,
  };
}
