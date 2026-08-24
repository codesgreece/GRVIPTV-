import { OrderLineSection } from "@/components/OrderLineSection";
import { PricingSection } from "@/components/PricingSection";
import { getPublicPricingSafe } from "@/lib/customers/public-pricing";

export async function LivePricingSection({ showHeading = true }: { showHeading?: boolean }) {
  const prices = await getPublicPricingSafe();
  return <PricingSection showHeading={showHeading} initialPrices={prices} />;
}

export async function LiveOrderLineSection() {
  const prices = await getPublicPricingSafe();
  return <OrderLineSection initialPrices={prices} />;
}
