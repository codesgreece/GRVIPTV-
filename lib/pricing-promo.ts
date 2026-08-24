import type { PublicPackagePrice } from "@/lib/customers/pricing";
import { formatEuroPrefix } from "@/lib/customers/pricing";

export function getPlanDisplay(plan: PublicPackagePrice) {
  if (plan.offerEnabled) {
    return {
      price: formatEuroPrefix(plan.offerPrice),
      originalPrice: formatEuroPrefix(plan.normalPrice),
      showSale: true,
    };
  }

  return {
    price: formatEuroPrefix(plan.normalPrice),
    originalPrice: null as string | null,
    showSale: false,
  };
}

export function getPlanSavings(plan: PublicPackagePrice, catalog: PublicPackagePrice[]) {
  if (plan.durationMonths <= 1) return null;

  const monthly = catalog.find((item) => item.packageId === "1-month");
  if (!monthly) return null;

  const savings = monthly.activePrice * plan.durationMonths - plan.activePrice;
  if (savings <= 0) return null;

  return formatEuroPrefix(savings);
}

export function anyOfferActive(catalog: PublicPackagePrice[]) {
  return catalog.some((item) => item.offerEnabled);
}
