import { getPricingById, roundMoney } from "@/lib/customers/pricing";
import type { CrmData } from "@/lib/customers/types";

function normalizeGreekName(name: string) {
  return name
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function isDontorosCustomer(name: string) {
  return normalizeGreekName(name).includes("ντοντορο");
}

/** One-off: Αποστολής Ντοντορος paid 55€, not the stored 89€. */
function fixApostolosDontorosPayment(data: CrmData): { data: CrmData; changed: boolean } {
  const customer = data.customers.find((item) => isDontorosCustomer(item.name));
  if (!customer) return { data, changed: false };

  const correctedAmount = 55;
  let changed = false;

  const subscriptions = data.subscriptions.map((subscription) => {
    if (subscription.customerId !== customer.id) return subscription;
    if (roundMoney(Number(subscription.amountPaid)) !== 89) return subscription;

    const pkg = getPricingById(data.pricing, subscription.packageId);
    const purchaseCostAtTime = roundMoney(pkg.purchaseCost);
    changed = true;

    return {
      ...subscription,
      amountPaid: correctedAmount,
      purchaseCostAtTime,
      profitAtTime: roundMoney(correctedAmount - purchaseCostAtTime),
      priceType: "CUSTOMER_SPECIAL_OFFER" as const,
    };
  });

  if (!changed) return { data, changed: false };
  return { data: { ...data, subscriptions }, changed: true };
}

export function applyCrmMigrations(data: CrmData): { data: CrmData; changed: boolean } {
  return fixApostolosDontorosPayment(data);
}
