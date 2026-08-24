import { defaultPublicPricing, toPublicPricing, type PublicPackagePrice } from "@/lib/customers/pricing";
import { getPricingCatalog } from "@/lib/customers/store";

export async function getPublicPricingSafe(): Promise<PublicPackagePrice[]> {
  try {
    return toPublicPricing(await getPricingCatalog());
  } catch {
    return defaultPublicPricing();
  }
}
