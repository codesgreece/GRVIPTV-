import type { PackageId, PackagePricing } from "@/lib/customers/types";
import type { ProviderPackage } from "@/lib/iptv/types";

/** Suggested mapping from local paid packages to provider package ids by duration. */
export const DEFAULT_PROVIDER_PACKAGE_IDS: Partial<Record<PackageId, number>> = {
  "3-months": 875,
  "6-months": 874,
  "12-months": 873,
  "trial-30min": 983,
  "trial-1hour": 983,
  "trial-1day": 983,
};

export function applyProviderPackageMeta(
  pricing: PackagePricing,
  provider?: ProviderPackage | null,
): PackagePricing {
  if (!provider) return pricing;
  return {
    ...pricing,
    providerPackageId: provider.id,
    providerName: provider.name,
    providerDuration: provider.duration,
    providerDurationUnit: provider.duration_unit,
    providerCredits: provider.credits,
    providerMaxConnections: provider.max_connections,
  };
}

export function mergeProviderPackagesIntoPricing(
  pricing: PackagePricing[],
  providerPackages: ProviderPackage[],
): PackagePricing[] {
  const bySuggestedId = new Map<number, ProviderPackage>();
  for (const pkg of providerPackages) {
    bySuggestedId.set(pkg.id, pkg);
  }

  return pricing.map((item) => {
    if (item.providerPackageId) {
      const linked = providerPackages.find((pkg) => pkg.id === item.providerPackageId);
      return applyProviderPackageMeta(item, linked);
    }

    const suggestedId = DEFAULT_PROVIDER_PACKAGE_IDS[item.packageId];
    if (!suggestedId) return item;
    return applyProviderPackageMeta(item, bySuggestedId.get(suggestedId));
  });
}
